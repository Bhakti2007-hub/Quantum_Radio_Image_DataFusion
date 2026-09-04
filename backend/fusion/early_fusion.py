"""Early Fusion (Feature-level fusion) for multimodal wireless target detection."""
import time
import numpy as np
from typing import Dict, Any, Tuple
from backend.models.classical_models import get_classifier
from backend.data.preprocessing import DataPreprocessor
from backend.utils.metrics import compute_model_metrics
from backend.config import TARGET_CLASSES, RANDOM_SEED

class EarlyFusionPipeline:
    def __init__(self, classifier_name: str = "random_forest", random_seed: int = RANDOM_SEED):
        self.classifier_name = classifier_name
        self.random_seed = random_seed
        self.preprocessor = DataPreprocessor(scaler_type="standard", random_seed=random_seed)
        self.model = get_classifier(classifier_name, random_seed=random_seed)
        self.is_trained = False
        self.metrics: Dict[str, Any] = {}

    def train(
        self,
        X_rf: np.ndarray,
        X_img: np.ndarray,
        y: np.ndarray
    ) -> Dict[str, Any]:
        """Perform early concatenation [X_rf || X_img] and train joint classifier."""
        X_fused = np.hstack([X_rf, X_img])
        X_train, X_test, y_train, y_test = self.preprocessor.fit_transform_split(X_fused, y)

        t_start = time.perf_counter()
        self.model.fit(X_train, y_train)
        train_time = time.perf_counter() - t_start

        t_infer_start = time.perf_counter()
        y_pred = self.model.predict(X_test)
        infer_time_ms = ((time.perf_counter() - t_infer_start) / len(X_test)) * 1000.0

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
            train_time_sec=train_time,
            inference_time_ms=infer_time_ms,
            model_name=f"Early Fusion ({self.classifier_name})",
            modality="Radio + Image (Early)"
        )
        return self.metrics

    def predict(self, x_rf: np.ndarray, x_img: np.ndarray) -> Tuple[int, str, float, np.ndarray]:
        """Predict for a single sample."""
        if not self.is_trained:
            raise RuntimeError("Early Fusion model is not trained.")
        if x_rf.ndim == 1:
            x_rf = x_rf.reshape(1, -1)
        if x_img.ndim == 1:
            x_img = x_img.reshape(1, -1)
            
        x_fused = np.hstack([x_rf, x_img])
        x_scaled = self.preprocessor.transform_new(x_fused)
        
        pred_idx = int(self.model.predict(x_scaled)[0])
        class_name = TARGET_CLASSES[pred_idx] if pred_idx < len(TARGET_CLASSES) else f"Class_{pred_idx}"
        
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(x_scaled)[0]
            confidence = float(probs[pred_idx])
        else:
            probs = np.zeros(len(TARGET_CLASSES))
            probs[pred_idx] = 1.0
            confidence = 1.0

        return pred_idx, class_name, confidence, probs
