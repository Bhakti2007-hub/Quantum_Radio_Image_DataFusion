"""Preprocessing, scaling, and feature reduction pipelines for multimodal target detection."""
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.decomposition import PCA
from sklearn.impute import SimpleImputer
from typing import Tuple, Optional, Dict, Any
from backend.config import RANDOM_SEED, DEFAULT_TEST_SIZE

class DataPreprocessor:
    def __init__(self, scaler_type: str = "standard", test_size: float = DEFAULT_TEST_SIZE, random_seed: int = RANDOM_SEED):
        self.scaler_type = scaler_type
        self.test_size = test_size
        self.random_seed = random_seed
        self.imputer = SimpleImputer(strategy="median")
        
        if scaler_type == "minmax":
            self.scaler = MinMaxScaler()
        elif scaler_type == "robust":
            self.scaler = RobustScaler()
        else:
            self.scaler = StandardScaler()

    def fit_transform_split(
        self,
        X: np.ndarray,
        y: np.ndarray,
        scale: bool = True
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Impute, split into train/test, and scale without data leakage."""
        # Impute missing values
        X_imputed = self.imputer.fit_transform(X)
        
        # Stratified train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X_imputed,
            y,
            test_size=self.test_size,
            random_state=self.random_seed,
            stratify=y if len(np.unique(y)) > 1 else None
        )

        if scale:
            X_train = self.scaler.fit_transform(X_train)
            X_test = self.scaler.transform(X_test)

        return X_train, X_test, y_train, y_test

    def transform_new(self, X: np.ndarray) -> np.ndarray:
        """Transform new single or batch samples using fitted scaler."""
        X_imputed = self.imputer.transform(X)
        return self.scaler.transform(X_imputed)


def reduce_dimensions_pca(
    X_train: np.ndarray,
    X_test: Optional[np.ndarray] = None,
    n_components: int = 4,
    random_seed: int = RANDOM_SEED
) -> Tuple[np.ndarray, Optional[np.ndarray], PCA, Dict[str, Any]]:
    """
    Perform PCA reduction for intermediate representation or Quantum State encoding.
    Returns reduced train, test, fitted PCA model, and explained variance statistics.
    """
    max_comp = min(X_train.shape[0], X_train.shape[1], n_components)
    pca = PCA(n_components=max_comp, random_state=random_seed)
    X_train_pca = pca.fit_transform(X_train)
    
    X_test_pca = None
    if X_test is not None:
        X_test_pca = pca.transform(X_test)

    explained_var = pca.explained_variance_ratio_.tolist()
    total_var = float(np.sum(pca.explained_variance_ratio_))

    stats = {
        "n_components": max_comp,
        "explained_variance_ratio": [round(float(v), 4) for v in explained_var],
        "cumulative_variance": round(total_var, 4),
        "singular_values": [round(float(s), 4) for s in pca.singular_values_.tolist()]
    }

    return X_train_pca, X_test_pca, pca, stats
