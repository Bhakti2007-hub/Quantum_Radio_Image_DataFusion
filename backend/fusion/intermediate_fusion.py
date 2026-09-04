"""Intermediate Fusion (Representation-level embedding fusion) for multimodal wireless target detection."""
import time
import numpy as np
from sklearn.decomposition import PCA
from typing import Dict, Any, Tuple
from backend.models.classical_models import get_classifier
from backend.data.preprocessing import DataPreprocessor
from backend.utils.metrics import compute_model_metrics
from backend.config import TARGET_CLASSES, RANDOM_SEED

class IntermediateFusionPipeline:
    def __init__(self, classifier_name: str = "svm", latent_dim_per_modality: int = 4, random_seed: int = RANDOM_SEED):
        self.classifier_name = classifier_name
        self.latent_dim = latent_dim_per_modality
        self.random_seed = random_seed
        self.rf_preprocessor = DataPreprocessor(scaler_type="standard", random_seed=random_seed)
        self.img_preprocessor = DataPreprocessor(scaler_type="standard", random_seed=random_seed)
        self.rf_pca: PCA = None
        self.img_pca: PCA = None
        self.model = get_classifier(classifier_name, random_seed=random_seed)
        self.is_trained = False
        self.metrics: Dict[str, Any] = {}

    def train(
        self,
        X_rf: np.ndarray,
        X_img: np.ndarray,
        y: np.ndarray
    ) -> Dict[str, Any]:
        """Extract intermediate modality embeddings and classify in shared latent space."""
        # Scale each modality separately to prevent dominance
        X_rf_train, X_rf_test, y_train, y_test = self.rf_preprocessor.fit_transform_split(X_rf, y)
        X_img_train, X_img_test, _, _ = self.img_preprocessor.fit_transform_split(X_img, y)

        # Learn intermediate representations
        rf_dim = min(X_rf.shape[1], self.latent_dim)
        img_dim = min(X_img.shape[1], self.latent_dim)
        
        self.rf_pca = PCA(n_components=rf_dim, random_state=self.random_seed)
        self.img_pca = PCA(n_components=img_dim, random_state=self.random_seed)

        H_rf_train = self.rf_pca.fit_transform(X_rf_train)
        H_rf_test = self.rf_pca.transform(X_rf_test)

        H_img_train = self.img_pca.fit_transform(X_img_train)
        H_img_test = self.img_pca.transform(X_img_test)

        # Joint intermediate representation
        H_fused_train = np.hstack([H_rf_train, H_img_train])
        H_fused_test = np.hstack([H_rf_test, H_img_test])

        t_start = time.perf_counter()
        self.model.fit(H_fused_train, y_train)
        train_time = time.perf_counter() - t_start

        t_infer_start = time.perf_counter()
        y_pred = self.model.predict(H_fused_test)
        infer_time_ms = ((time.perf_counter() - t_infer_start) / len(H_fused_test)) * 1000.0

        y_prob = None
        if hasattr(self.model, "predict_proba"):
            try:
                y_prob = self.model.predict_proba(H_fused_test)
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
            model_name=f"Intermediate Fusion ({self.classifier_name})",
            modality="Radio + Image (Intermediate)"
        )
        self.metrics["intermediate_latent_dimension"] = H_fused_train.shape[1]
        return self.metrics

    def predict(self, x_rf: np.ndarray, x_img: np.ndarray) -> Tuple[int, str, float, np.ndarray]:
        """Predict target class using intermediate latent embedding fusion."""
        if not self.is_trained:
            raise RuntimeError("Intermediate Fusion model is not trained.")
        if x_rf.ndim == 1:
            x_rf = x_rf.reshape(1, -1)
        if x_img.ndim == 1:
            x_img = x_img.reshape(1, -1)

        x_rf_s = self.rf_preprocessor.transform_new(x_rf)
        x_img_s = self.img_preprocessor.transform_new(x_img)

        h_rf = self.rf_pca.transform(x_rf_s)
        h_img = self.img_pca.transform(x_img_s)
        h_fused = np.hstack([h_rf, h_img])

        pred_idx = int(self.model.predict(h_fused)[0])
        class_name = TARGET_CLASSES[pred_idx] if pred_idx < len(TARGET_CLASSES) else f"Class_{pred_idx}"

        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(h_fused)[0]
            confidence = float(probs[pred_idx])
        else:
            probs = np.zeros(len(TARGET_CLASSES))
            probs[pred_idx] = 1.0
            confidence = 1.0

        return pred_idx, class_name, confidence, probs
