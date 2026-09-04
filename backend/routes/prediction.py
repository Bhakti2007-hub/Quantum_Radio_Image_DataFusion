"""Interactive Target Detection inference route running live multimodal prediction."""
import numpy as np
from flask import Blueprint, jsonify, request
from backend.models.model_store import model_store
from backend.data.dataset_loader import MultimodalDatasetManager
from backend.models.classical_models import ClassicalModalityTrainer
from backend.fusion.early_fusion import EarlyFusionPipeline
from backend.fusion.late_fusion import LateFusionPipeline
from backend.quantum.quantum_classifier import QuantumTargetClassifier
from backend.image.feature_extraction import extract_features_from_pil, extract_features_from_path_or_bytes
from backend.config import RADIO_FEATURE_NAMES, IMAGE_FEATURE_NAMES, TARGET_CLASSES
from backend.utils.logging_config import logger

prediction_bp = Blueprint("prediction", __name__)

def ensure_models_trained():
    """Ensure baseline, fusion, and quantum models are ready for prediction."""
    manager = MultimodalDatasetManager.get_instance()
    X_rf, y, _ = manager.get_radio_features()
    X_img, _, _ = manager.get_image_features()

    if model_store.radio_model is None or not model_store.radio_model.is_trained:
        rf_m = ClassicalModalityTrainer(model_type="random_forest")
        rf_m.train_and_evaluate(X_rf, y, model_name="Radio (RF)", modality="Radio")
        model_store.radio_model = rf_m

    if model_store.image_model is None or not model_store.image_model.is_trained:
        img_m = ClassicalModalityTrainer(model_type="random_forest")
        img_m.train_and_evaluate(X_img, y, model_name="Image (RF)", modality="Image")
        model_store.image_model = img_m

    if model_store.early_fusion is None or not model_store.early_fusion.is_trained:
        early = EarlyFusionPipeline(classifier_name="random_forest")
        early.train(X_rf, X_img, y)
        model_store.early_fusion = early

    if model_store.quantum_model is None or not model_store.quantum_model.is_trained:
        q_m = QuantumTargetClassifier(n_qubits=4, reps=2, feature_map_name="ZZFeatureMap")
        q_m.train_and_evaluate(X_rf, X_img, y)
        model_store.quantum_model = q_m


@prediction_bp.route("/api/predict", methods=["POST"])
def predict_target():
    """Run live target detection across all 4 paradigms simultaneously."""
    try:
        ensure_models_trained()

        # 1. Parse Radio Input
        rf_dict = {}
        if request.is_json:
            rf_dict = request.json.get("radio_features", {})
            img_dict = request.json.get("image_features", {})
            sample_id = request.json.get("sample_id")
        else:
            # Form data
            rf_dict = {
                "rssi_dbm": float(request.form.get("rssi_dbm", -60.0)),
                "snr_db": float(request.form.get("snr_db", 15.0)),
                "carrier_freq_ghz": float(request.form.get("carrier_freq_ghz", 2.4)),
                "bandwidth_mhz": float(request.form.get("bandwidth_mhz", 20.0)),
                "doppler_shift_khz": float(request.form.get("doppler_shift_khz", 3.5)),
                "phase_variance_rad": float(request.form.get("phase_variance_rad", 0.35)),
                "path_loss_db": float(request.form.get("path_loss_db", 80.0)),
                "spectral_kurtosis": float(request.form.get("spectral_kurtosis", 4.0)),
                "papr_db": float(request.form.get("papr_db", 7.5))
            }
            img_dict = {}
            sample_id = request.form.get("sample_id")

        # Fallback values if fields are missing
        default_rf = {
            "rssi_dbm": -62.0, "snr_db": 16.5, "carrier_freq_ghz": 2.4,
            "bandwidth_mhz": 20.0, "doppler_shift_khz": 4.5, "phase_variance_rad": 0.4,
            "path_loss_db": 82.0, "spectral_kurtosis": 5.0, "papr_db": 8.0
        }
        for k, v in default_rf.items():
            if k not in rf_dict:
                rf_dict[k] = v

        x_rf = np.array([[float(rf_dict.get(k, default_rf.get(k, 0.0))) for k in RADIO_FEATURE_NAMES]])

        # 2. Parse / Extract Image Features
        thumbnail_b64 = None
        if "image" in request.files:
            file = request.files["image"]
            res = extract_features_from_path_or_bytes(file.read())
            img_dict = res["features"]
            thumbnail_b64 = res["thumbnail_b64"]
        elif sample_id is not None:
            manager = MultimodalDatasetManager.get_instance()
            matching = manager.df[manager.df["sample_id"] == int(sample_id)]
            if not matching.empty:
                row = matching.iloc[0]
                img_dict = {k: float(row[k]) for k in IMAGE_FEATURE_NAMES if k in row}
                rf_dict = {k: float(row[k]) for k in RADIO_FEATURE_NAMES if k in row}
                x_rf = np.array([[float(rf_dict[k]) for k in RADIO_FEATURE_NAMES]])

        # Fallback default image features if none provided
        default_img = {
            "edge_density": 0.65, "aspect_ratio": 1.1, "spatial_entropy": 5.5,
            "color_moment_r_mean": 160.0, "color_moment_g_mean": 175.0, "color_moment_b_mean": 190.0,
            "color_moment_r_std": 40.0, "color_moment_g_std": 42.0, "color_moment_b_std": 45.0,
            "texture_contrast": 0.7, "texture_homogeneity": 0.5, "texture_energy": 0.35
        }
        for k, v in default_img.items():
            if k not in img_dict:
                img_dict[k] = v

        x_img = np.array([[float(img_dict.get(k, default_img.get(k, 0.0))) for k in IMAGE_FEATURE_NAMES]])

        # 3. Model Predictions
        # A. Radio-only
        rf_idx, rf_class, rf_conf, rf_probs = model_store.radio_model.predict_sample(x_rf)

        # B. Image-only
        img_idx, img_class, img_conf, img_probs = model_store.image_model.predict_sample(x_img)

        # C. Classical Fusion (Early Fusion)
        fuse_idx, fuse_class, fuse_conf, fuse_probs = model_store.early_fusion.predict(x_rf, x_img)

        # D. Quantum Fusion (QSVC)
        q_idx, q_class, q_conf, q_probs, q_meta = model_store.quantum_model.predict_sample(x_rf, x_img)

        # Primary Consensus Verdict (weighted fusion consensus)
        primary_class = fuse_class
        primary_confidence = round(fuse_conf, 4)

        return jsonify({
            "status": "success",
            "detection_result": {
                "target_class": primary_class,
                "confidence": primary_confidence,
                "confidence_percent": f"{primary_confidence * 100:.1f}%"
            },
            "modality_comparisons": {
                "radio_only": {
                    "model": "Radio Classifier (RF)",
                    "predicted_class": rf_class,
                    "confidence": round(float(rf_conf), 4),
                    "probabilities": [round(float(p), 4) for p in rf_probs]
                },
                "image_only": {
                    "model": "Image Classifier (RF)",
                    "predicted_class": img_class,
                    "confidence": round(float(img_conf), 4),
                    "probabilities": [round(float(p), 4) for p in img_probs]
                },
                "classical_fusion": {
                    "model": "Classical Multimodal Fusion",
                    "predicted_class": fuse_class,
                    "confidence": round(float(fuse_conf), 4),
                    "probabilities": [round(float(p), 4) for p in fuse_probs]
                },
                "quantum_fusion": {
                    "model": "Quantum ML Fusion (QSVC)",
                    "predicted_class": q_class,
                    "confidence": round(float(q_conf), 4),
                    "probabilities": [round(float(p), 4) for p in q_probs],
                    "quantum_metadata": q_meta
                }
            },
            "target_classes": TARGET_CLASSES,
            "inputs": {
                "radio_features": rf_dict,
                "image_features": img_dict,
                "thumbnail_b64": thumbnail_b64
            }
        })

    except Exception as e:
        logger.error(f"Error executing prediction: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
