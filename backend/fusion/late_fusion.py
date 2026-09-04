"""Late Fusion (Decision / Score-level fusion) for multimodal wireless target detection."""
import time
import numpy as np
from typing import Dict, Any, Tuple
from backend.models.classical_models import ClassicalModalityTrainer
from backend.utils.metrics import compute_model_metrics
from backend.config import TARGET_CLASSES, RANDOM_SEED

class LateFusionPipeline:
    def __init__(self, model_type: str = "random_forest", rf_weight: float = 0.5, random_seed: int = RANDOM_SEED):
        self.model_type = model_type
        self.rf_weight = rf_weight
        self.img_weight = 1.0 - rf_weight
        self.random_seed = random_seed
        self.rf_trainer = ClassicalModalityTrainer(model_type=model_type, random_seed=random_seed)
        self.img_trainer = ClassicalModalityTrainer(model_type=model_type, random_seed=random_seed)
        self.is_trained = False
        self.metrics: Dict[str, Any] = {}

    def train(
        self,
        X_rf: np.ndarray,
        X_img: np.ndarray,
        y: np.ndarray
    ) -> Dict[str, Any]:
        """Train separate Radio and Image models and evaluate their late probability aggregation."""
        t_start = time.perf_counter()
        # Train both models
        self.rf_trainer.train_and_evaluate(X_rf, y, model_name=f"Radio ({self.model_type})", modality="Radio")
        self.img_trainer.train_and_evaluate(X_img, y, model_name=f"Image ({self.model_type})", modality="Image")
        train_time = time.perf_counter() - t_start

        # Evaluate late ensemble on test split
        _, X_rf_test, _, y_test = self.rf_trainer.preprocessor.fit_transform_split(X_rf, y, scale=False)
        _, X_img_test, _, _ = self.img_trainer.preprocessor.fit_transform_split(X_img, y, scale=False)

        t_infer_start = time.perf_counter()
        y_prob_rf = self.rf_trainer.model.predict_proba(self.rf_trainer.preprocessor.transform_new(X_rf_test))
        y_prob_img = self.img_trainer.model.predict_proba(self.img_trainer.preprocessor.transform_new(X_img_test))
        
        # Soft voting consensus
        y_prob_fused = (self.rf_weight * y_prob_rf) + (self.img_weight * y_prob_img)
        y_pred = np.argmax(y_prob_fused, axis=1)
        infer_time_ms = ((time.perf_counter() - t_infer_start) / len(y_test)) * 1000.0

        self.is_trained = True
        self.metrics = compute_model_metrics(
            y_true=y_test,
            y_pred=y_pred,
            y_prob=y_prob_fused,
            class_names=TARGET_CLASSES,
            train_time_sec=train_time,
            inference_time_ms=infer_time_ms,
            model_name=f"Late Fusion ({self.model_type})",
            modality="Radio + Image (Late)"
        )
        self.metrics["fusion_weights"] = {"radio": self.rf_weight, "image": self.img_weight}
        return self.metrics

    def predict(self, x_rf: np.ndarray, x_img: np.ndarray) -> Tuple[int, str, float, np.ndarray, Dict[str, Any]]:
        """Predict target class by aggregating decision probabilities."""
        if not self.is_trained:
            raise RuntimeError("Late Fusion pipeline is not trained.")
        
        _, rf_class, rf_conf, rf_probs = self.rf_trainer.predict_sample(x_rf)
        _, img_class, img_conf, img_probs = self.img_trainer.predict_sample(x_img)

        fused_probs = (self.rf_weight * rf_probs) + (self.img_weight * img_probs)
        pred_idx = int(np.argmax(fused_probs))
        class_name = TARGET_CLASSES[pred_idx] if pred_idx < len(TARGET_CLASSES) else f"Class_{pred_idx}"
        confidence = float(fused_probs[pred_idx])

        breakdown = {
            "radio_decision": {"predicted_class": rf_class, "confidence": round(rf_conf, 4), "probabilities": rf_probs.tolist()},
            "image_decision": {"predicted_class": img_class, "confidence": round(img_conf, 4), "probabilities": img_probs.tolist()},
            "fused_probabilities": fused_probs.tolist()
        }

        return pred_idx, class_name, confidence, fused_probs, breakdown
