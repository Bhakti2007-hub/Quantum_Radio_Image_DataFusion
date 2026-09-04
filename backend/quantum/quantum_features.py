"""Quantum Feature encoding and preprocessing pipeline for multimodal data."""
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
from typing import Tuple, Dict, Any, Optional
from backend.config import RANDOM_SEED, DEFAULT_QUANTUM_QUBITS

class QuantumFeaturePipeline:
    """
    Multimodal feature transformation into bounded quantum rotation angles.
    Pipeline: Raw RF + Visual Features -> Normalization -> PCA Reduction -> Quantum Phase Angle Encoding.
    """
    def __init__(self, n_qubits: int = DEFAULT_QUANTUM_QUBITS, random_seed: int = RANDOM_SEED):
        self.n_qubits = n_qubits
        self.random_seed = random_seed
        self.pca = PCA(n_components=n_qubits, random_state=random_seed)
        self.scaler = MinMaxScaler(feature_range=(0, np.pi)) # Map features into [0, π] for quantum rotation
        self.is_fitted = False

    def fit_transform(self, X_fused: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Fit PCA and scale to [0, π] rotation parameters."""
        X_pca = self.pca.fit_transform(X_fused)
        X_quantum = self.scaler.fit_transform(X_pca)
        self.is_fitted = True

        explained = [round(float(v), 4) for v in self.pca.explained_variance_ratio_.tolist()]
        total_explained = round(float(np.sum(self.pca.explained_variance_ratio_)), 4)

        metadata = {
            "n_qubits": self.n_qubits,
            "original_features_dim": X_fused.shape[1],
            "reduced_quantum_dim": self.n_qubits,
            "explained_variance_ratio": explained,
            "cumulative_variance_preserved": total_explained,
            "encoding_range": "[0, π] (radians)"
        }
        return X_quantum, metadata

    def transform(self, X_fused: np.ndarray) -> np.ndarray:
        """Transform new data into quantum angle parameters."""
        if not self.is_fitted:
            raise RuntimeError("Quantum feature pipeline is not fitted.")
        X_pca = self.pca.transform(X_fused)
        return self.scaler.transform(X_pca)
