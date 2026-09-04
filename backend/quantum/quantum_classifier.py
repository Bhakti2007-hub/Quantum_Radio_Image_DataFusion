"""Quantum Support Vector Classifier (QSVC) using Quantum Kernel simulation."""
import time
import numpy as np
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from typing import Dict, Any, Tuple, Optional
from backend.quantum.quantum_features import QuantumFeaturePipeline
from backend.quantum.quantum_kernel import QuantumKernelEngine
from backend.quantum.circuit_visualizer import generate_circuit_metadata
from backend.utils.metrics import compute_model_metrics
from backend.config import TARGET_CLASSES, RANDOM_SEED, DEFAULT_QUANTUM_QUBITS

class QuantumTargetClassifier:
    """
    QSVC Model for Multimodal Target Detection.
    Explicitly operates under Quantum Simulation mode.
    """
    def __init__(
        self,
        n_qubits: int = DEFAULT_QUANTUM_QUBITS,
        reps: int = 2,
        feature_map_name: str = "ZZFeatureMap",
        C: float = 1.0,
        random_seed: int = RANDOM_SEED
    ):
        self.n_qubits = n_qubits
        self.reps = reps
        self.feature_map_name = feature_map_name
        self.C = C
        self.random_seed = random_seed

        self.feature_pipeline = QuantumFeaturePipeline(n_qubits=n_qubits, random_seed=random_seed)
        self.kernel_engine = QuantumKernelEngine(n_qubits=n_qubits, reps=reps, feature_map=feature_map_name)
        self.svc = SVC(kernel="precomputed", C=C, probability=True, random_state=random_seed)
        
        self.is_trained = False
        self.X_train_q: Optional[np.ndarray] = None
        self.y_train: Optional[np.ndarray] = None
        self.metrics: Dict[str, Any] = {}
        self.circuit_info: Dict[str, Any] = {}

    def train_and_evaluate(
        self,
        X_rf: np.ndarray,
        X_img: np.ndarray,
        y: np.ndarray,
        test_size: float = 0.25
    ) -> Dict[str, Any]:
        """Run quantum feature mapping, compute quantum Gram matrix, and evaluate QSVC."""
        X_fused = np.hstack([X_rf, X_img])
        
        # Train / test split
        X_train_raw, X_test_raw, y_train, y_test = train_test_split(
            X_fused, y, test_size=test_size, random_state=self.random_seed,
            stratify=y if len(np.unique(y)) > 1 else None
        )

        t_start = time.perf_counter()

        # Step 1: Quantum feature reduction and phase encoding
        X_train_q, pipeline_meta = self.feature_pipeline.fit_transform(X_train_raw)
        X_test_q = self.feature_pipeline.transform(X_test_raw)
        self.X_train_q = X_train_q
        self.y_train = y_train

        # Step 2: Compute Quantum Kernel Gram Matrices
        t_kernel_start = time.perf_counter()
        K_train = self.kernel_engine.compute_kernel_matrix(X_train_q, X_train_q)
        K_test = self.kernel_engine.compute_kernel_matrix(X_test_q, X_train_q)
        kernel_time = time.perf_counter() - t_kernel_start

        # Step 3: Fit QSVC
        self.svc.fit(K_train, y_train)
        train_time = time.perf_counter() - t_start

        # Step 4: Inference
        t_infer_start = time.perf_counter()
        y_pred = self.svc.predict(K_test)
        y_prob = self.svc.predict_proba(K_test)
        infer_time_ms = ((time.perf_counter() - t_infer_start) / len(y_test)) * 1000.0

        self.is_trained = True
        self.circuit_info = generate_circuit_metadata(
            n_qubits=self.n_qubits,
            reps=self.reps,
            feature_map_type=self.feature_map_name
        )

        metrics = compute_model_metrics(
            y_true=y_test,
            y_pred=y_pred,
            y_prob=y_prob,
            class_names=TARGET_CLASSES,
            train_time_sec=train_time,
            inference_time_ms=infer_time_ms,
            model_name=f"QSVC ({self.feature_map_name})",
            modality="Radio + Image (Quantum Fusion)"
        )

        # Attach Quantum-specific metadata
        sample_kernel_matrix = K_train[:12, :12].round(3).tolist() # Sample subset for UI heatmap
        metrics["quantum_metadata"] = {
            "execution_type": "Quantum Simulation",
            "simulation_backend": "Statevector Quantum Simulator",
            "qubits": self.n_qubits,
            "feature_map": self.feature_map_name,
            "circuit_depth": self.circuit_info["circuit_depth"],
            "total_quantum_gates": self.circuit_info["total_gates"],
            "kernel_computation_time_sec": round(kernel_time, 4),
            "sample_kernel_heatmap": sample_kernel_matrix,
            "pipeline_meta": pipeline_meta,
            "train_samples": len(y_train),
            "test_samples": len(y_test)
        }

        self.metrics = metrics
        return metrics

    def predict_sample(self, x_rf: np.ndarray, x_img: np.ndarray) -> Tuple[int, str, float, np.ndarray, Dict[str, Any]]:
        """Predict for a single multimodal input instance."""
        if not self.is_trained or self.X_train_q is None:
            raise RuntimeError("Quantum model is not trained.")
        if x_rf.ndim == 1:
            x_rf = x_rf.reshape(1, -1)
        if x_img.ndim == 1:
            x_img = x_img.reshape(1, -1)

        x_fused = np.hstack([x_rf, x_img])
        x_q = self.feature_pipeline.transform(x_fused)

        # Compute test kernel row against all training vectors
        k_sample = self.kernel_engine.compute_kernel_matrix(x_q, self.X_train_q)
        pred_idx = int(self.svc.predict(k_sample)[0])
        probs = self.svc.predict_proba(k_sample)[0]
        
        class_name = TARGET_CLASSES[pred_idx] if pred_idx < len(TARGET_CLASSES) else f"Class_{pred_idx}"
        confidence = float(probs[pred_idx])

        quantum_state_details = {
            "qubit_angles_rad": [round(float(a), 4) for a in x_q[0]],
            "quantum_state_dim": 2 ** self.n_qubits,
            "execution_mode": "Quantum Simulation"
        }

        return pred_idx, class_name, confidence, probs, quantum_state_details
