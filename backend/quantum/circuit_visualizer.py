"""Quantum circuit diagram generator and structured representation for UI visualization."""
from typing import Dict, Any, List
try:
    from qiskit.circuit.library import zz_feature_map, pauli_feature_map
    QISKIT_AVAILABLE = True
except ImportError:
    try:
        from qiskit.circuit.library import ZZFeatureMap, PauliFeatureMap
        QISKIT_AVAILABLE = True
    except ImportError:
        QISKIT_AVAILABLE = False

def generate_circuit_metadata(n_qubits: int = 4, reps: int = 2, feature_map_type: str = "ZZFeatureMap") -> Dict[str, Any]:
    """Generate structured quantum circuit gates and text visualization."""
    wires = [{"qubit": i, "label": f"q[{i}]"} for i in range(n_qubits)]
    gates: List[Dict[str, Any]] = []
    
    # Layer 1: Hadamard superposition
    for q in range(n_qubits):
        gates.append({
            "type": "H",
            "name": "Hadamard",
            "qubit": q,
            "layer": 0,
            "params": [],
            "description": f"Creates equal superposition on qubit {q}"
        })

    # Repetition layers
    layer_idx = 1
    for r in range(reps):
        # Single qubit Rz phase rotations
        for q in range(n_qubits):
            gates.append({
                "type": "Rz",
                "name": f"Rz(φ_{q})",
                "qubit": q,
                "layer": layer_idx,
                "params": [f"x[{q}]"],
                "description": f"Phase rotation proportional to feature x_{q}"
            })
        layer_idx += 1

        # Entanglement layer: CNOT + Rz + CNOT for ZZ interaction
        for q1 in range(n_qubits - 1):
            q2 = q1 + 1
            gates.append({
                "type": "CX",
                "name": "CNOT",
                "control": q1,
                "target": q2,
                "layer": layer_idx,
                "description": f"Entangles qubit {q1} and {q2}"
            })
            gates.append({
                "type": "Rz",
                "name": f"Rz(φ_{q1}{q2})",
                "qubit": q2,
                "layer": layer_idx + 1,
                "params": [f"(π - x[{q1}])(π - x[{q2}])"],
                "description": f"ZZ two-body non-linear phase interaction"
            })
            gates.append({
                "type": "CX",
                "name": "CNOT",
                "control": q1,
                "target": q2,
                "layer": layer_idx + 2,
                "description": f"Completes ZZ parity coupling"
            })
            layer_idx += 3

    # Generate ASCII representation
    ascii_repr = ""
    if QISKIT_AVAILABLE:
        try:
            try:
                qc = zz_feature_map(feature_dimension=n_qubits, reps=reps, entanglement='linear')
            except Exception:
                from qiskit.circuit.library import ZZFeatureMap
                qc = ZZFeatureMap(feature_dimension=n_qubits, reps=reps, entanglement='linear')
            ascii_repr = str(qc.draw(output="text"))
        except Exception:
            ascii_repr = f"ZZFeatureMap(n_qubits={n_qubits}, reps={reps}, entanglement='linear')"
    else:
        ascii_repr = f"Simulated ZZFeatureMap Circuit ({n_qubits} Qubits, {reps} Repetitions)"

    return {
        "n_qubits": n_qubits,
        "repetitions": reps,
        "feature_map_type": feature_map_type,
        "entanglement": "linear",
        "wires": wires,
        "gates": gates,
        "total_gates": len(gates),
        "circuit_depth": layer_idx,
        "ascii_diagram": ascii_repr,
        "simulation_backend": "Qiskit Statevector Simulator (Simulated Quantum Processing)"
    }
