"""Classical Machine Learning models for single-modality and multimodal baseline target detection."""
import time
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from typing import Dict, Any, Tuple, Optional
from backend.config import RANDOM_SEED
from backend.data.preprocessing import DataPreprocessor
from backend.utils.metrics import compute_model_metrics
from backend.config import TARGET_CLASSES

def get_classifier(model_type: str = "random_forest", random_seed: int = RANDOM_SEED):
    """Instantiate classical classifier."""
    model_type = model_type.lower()
    if model_type in ["rf", "random_forest"]:
        return RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            min_samples_split=3,
            random_state=random_seed
        )
    elif model_type in ["svm", "svc"]:
        return SVC(
            kernel="rbf",
            C=1.5,
            probability=True,
            random_state=random_seed
        )
    elif model_type in ["logistic_regression", "lr"]:
        return LogisticRegression(
            max_iter=500,
            C=1.0,
            random_state=random_seed
        )
    else:
        return RandomForestClassifier(n_estimators=100, random_state=random_seed)


class ClassicalModalityTrainer:
    """Trainer for single-modality or fused feature sets."""
    def __init__(self, model_type: str = "random_forest", scaler_type: str = "standard", random_seed: int = RANDOM_SEED):
        self.model_type = model_type
        self.scaler_type = scaler_type
        self.random_seed = random_seed
        self.preprocessor = DataPreprocessor(scaler_type=scaler_type, random_seed=random_seed)
        self.model = get_classifier(model_type, random_seed=random_seed)
        self.is_trained = False
        self.metrics: Optional[Dict[str, Any]] = None

    def train_and_evaluate(
        self,
        X: np.ndarray,
        y: np.ndarray,
        model_name: str = "Random Forest",
        modality: str = "Radio"
    ) -> Dict[str, Any]:
        """Train classifier with leak-free preprocessing and evaluate on test partition."""
        X_train, X_test, y_train, y_test = self.preprocessor.fit_transform_split(X, y)

        # Train with timing
        t_start = time.perf_counter()
        self.model.fit(X_train, y_train)
        train_time_sec = time.perf_counter() - t_start

        # Inference with latency timing
        t_infer_start = time.perf_counter()
        y_pred = self.model.predict(X_test)
        infer_time_ms = ((time.perf_counter() - t_infer_start) / len(X_test)) * 1000.0

        # Predict probabilities if available
        y_prob = None
        if hasattr(self.model, "predict_proba"):
            try:
                y_prob = self.model.predict_proba(X_test)
            except Exception:
                pass

        self.is_trained = True
        self.metrics = compute_model_metrics(
            y_true=y_test,
            y_pred=y_pred,
            y_prob=y_prob,
            class_names=TARGET_CLASSES,
            train_time_sec=train_time_sec,
            inference_time_ms=infer_time_ms,
            model_name=model_name,
            modality=modality
        )
        return self.metrics

    def predict_sample(self, X_sample: np.ndarray) -> Tuple[int, str, float, np.ndarray]:
        """Predict target class and confidence for a single feature vector."""
        if not self.is_trained:
            raise RuntimeError("Model has not been trained yet.")
        
        if X_sample.ndim == 1:
            X_sample = X_sample.reshape(1, -1)
            
        X_scaled = self.preprocessor.transform_new(X_sample)
        pred_idx = int(self.model.predict(X_scaled)[0])
        class_name = TARGET_CLASSES[pred_idx] if pred_idx < len(TARGET_CLASSES) else f"Class_{pred_idx}"
        
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(X_scaled)[0]
            confidence = float(probs[pred_idx])
        else:
            probs = np.zeros(len(TARGET_CLASSES))
            probs[pred_idx] = 1.0
            confidence = 1.0

        return pred_idx, class_name, confidence, probs
