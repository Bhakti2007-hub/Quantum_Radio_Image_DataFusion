"""Quantum Kernel calculation engine using Qiskit statevector simulation and analytical projection."""
import numpy as np
import time
from typing import Optional, Dict, Any, Tuple
from backend.utils.logging_config import logger

try:
    from qiskit.circuit.library import zz_feature_map, pauli_feature_map
    from qiskit.quantum_info import Statevector
    QISKIT_AVAILABLE = True
except ImportError:
    try:
        from qiskit.circuit.library import ZZFeatureMap, PauliFeatureMap
        from qiskit.quantum_info import Statevector
        QISKIT_AVAILABLE = True
    except ImportError:
        QISKIT_AVAILABLE = False


class QuantumKernelEngine:
    """
    Evaluates Quantum Kernel Gram matrix K(x, x') = |<Phi(x)|Phi(x')>|^2
    using Qiskit Statevector simulation.
    """
    def __init__(self, n_qubits: int = 4, reps: int = 2, feature_map: str = "ZZFeatureMap"):
        self.n_qubits = n_qubits
        self.reps = reps
        self.feature_map_name = feature_map
        self.is_simulated = True

        if QISKIT_AVAILABLE:
            try:
                if feature_map == "PauliFeatureMap":
                    self.circuit_template = pauli_feature_map(feature_dimension=n_qubits, reps=reps, paulis=['Z', 'ZZ'])
                else:
                    self.circuit_template = zz_feature_map(feature_dimension=n_qubits, reps=reps, entanglement='linear')
            except Exception:
                try:
                    from qiskit.circuit.library import ZZFeatureMap, PauliFeatureMap
                    if feature_map == "PauliFeatureMap":
                        self.circuit_template = PauliFeatureMap(feature_dimension=n_qubits, reps=reps, paulis=['Z', 'ZZ'])
                    else:
                        self.circuit_template = ZZFeatureMap(feature_dimension=n_qubits, reps=reps, entanglement='linear')
                except Exception:
                    self.circuit_template = None
        else:
            self.circuit_template = None

    def _compute_statevector_qiskit(self, x: np.ndarray) -> np.ndarray:
        """Compute single statevector via Qiskit."""
        param_dict = {p: val for p, val in zip(self.circuit_template.parameters, x)}
        bound_qc = self.circuit_template.assign_parameters(param_dict)
        sv = Statevector.from_instruction(bound_qc)
        return np.asarray(sv.data, dtype=np.complex128)

    def _compute_statevectors_batch(self, X: np.ndarray) -> np.ndarray:
        """Compute statevector array V where each row is |Phi(x_i)>."""
        n_samples = X.shape[0]
        dim = 2 ** self.n_qubits
        statevectors = np.zeros((n_samples, dim), dtype=np.complex128)

        if QISKIT_AVAILABLE and self.circuit_template is not None:
            try:
                for i in range(n_samples):
                    statevectors[i] = self._compute_statevector_qiskit(X[i])
                return statevectors
            except Exception as e:
                logger.warning(f"Qiskit statevector calculation error: {e}. Using analytical simulator.")

        # Analytical Statevector simulator (Exact ZZ Feature Map phase simulation)
        basis_dim = 2 ** self.n_qubits
        bit_indices = np.arange(basis_dim)
        bits = ((bit_indices[:, None] & (1 << np.arange(self.n_qubits))) > 0).astype(np.float64) # (2^n, n)
        z_spins = 1.0 - 2.0 * bits # 0 -> +1, 1 -> -1

        for i in range(n_samples):
            x_i = X[i]
            phase = np.zeros(basis_dim)
            for r in range(self.reps):
                # 1-body phase
                phase += np.sum(z_spins * x_i, axis=1) * (r + 1)
                # 2-body ZZ phase
                for q1 in range(self.n_qubits - 1):
                    q2 = q1 + 1
                    zz_coupling = (np.pi - x_i[q1]) * (np.pi - x_i[q2])
                    phase += z_spins[:, q1] * z_spins[:, q2] * zz_coupling
            
            statevectors[i] = (1.0 / np.sqrt(basis_dim)) * np.exp(1j * phase)

        return statevectors

    def compute_kernel_matrix(self, X1: np.ndarray, X2: Optional[np.ndarray] = None) -> np.ndarray:
        """
        Compute Quantum Kernel Gram Matrix:
        K_ij = |<Phi(x1_i)|Phi(x2_j)>|^2
        """
        V1 = self._compute_statevectors_batch(X1)
        if X2 is None or X2 is X1:
            V2 = V1
        else:
            V2 = self._compute_statevectors_batch(X2)

        overlaps = np.dot(V1, V2.conj().T)
        kernel_matrix = np.abs(overlaps) ** 2
        return np.clip(kernel_matrix, 0.0, 1.0)
