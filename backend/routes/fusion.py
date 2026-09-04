"""Multimodal fusion training and evaluation routes."""
from flask import Blueprint, jsonify, request
from backend.data.dataset_loader import MultimodalDatasetManager
from backend.models.classical_models import ClassicalModalityTrainer
from backend.fusion.early_fusion import EarlyFusionPipeline
from backend.fusion.intermediate_fusion import IntermediateFusionPipeline
from backend.fusion.late_fusion import LateFusionPipeline
from backend.models.model_store import model_store
from backend.routes.experiments import log_experiment_result
from backend.utils.logging_config import logger

fusion_bp = Blueprint("fusion", __name__)

@fusion_bp.route("/api/fusion/train", methods=["POST"])
def train_fusion_models():
    """Train classical single-modality and multimodal fusion models."""
    try:
        body = request.get_json() or {}
        strategy = body.get("strategy", "all").lower() # early, intermediate, late, or all
        classifier = body.get("classifier", "random_forest").lower()
        rf_weight = float(body.get("rf_weight", 0.5))
        latent_dim = int(body.get("latent_dim", 4))

        manager = MultimodalDatasetManager.get_instance()
        X_rf, y_rf, rf_names = manager.get_radio_features()
        X_img, y_img, img_names = manager.get_image_features()
        y = y_rf

        results = {}

        # 1. Single Modality Baselines
        radio_trainer = ClassicalModalityTrainer(model_type=classifier)
        radio_metrics = radio_trainer.train_and_evaluate(X_rf, y, model_name=f"Radio ({classifier})", modality="Radio")
        model_store.radio_model = radio_trainer
        log_experiment_result(radio_metrics, {"classifier": classifier, "features_count": len(rf_names)})
        results["radio_baseline"] = radio_metrics

        image_trainer = ClassicalModalityTrainer(model_type=classifier)
        image_metrics = image_trainer.train_and_evaluate(X_img, y, model_name=f"Image ({classifier})", modality="Image")
        model_store.image_model = image_trainer
        log_experiment_result(image_metrics, {"classifier": classifier, "features_count": len(img_names)})
        results["image_baseline"] = image_metrics

        # 2. Early Fusion
        if strategy in ["early", "all"]:
            early_pipe = EarlyFusionPipeline(classifier_name=classifier)
            early_metrics = early_pipe.train(X_rf, X_img, y)
            model_store.early_fusion = early_pipe
            log_experiment_result(early_metrics, {"classifier": classifier, "fusion_type": "early"})
            results["early_fusion"] = early_metrics

        # 3. Intermediate Fusion
        if strategy in ["intermediate", "all"]:
            inter_pipe = IntermediateFusionPipeline(classifier_name=classifier, latent_dim_per_modality=latent_dim)
            inter_metrics = inter_pipe.train(X_rf, X_img, y)
            model_store.intermediate_fusion = inter_pipe
            log_experiment_result(inter_metrics, {"classifier": classifier, "fusion_type": "intermediate", "latent_dim": latent_dim})
            results["intermediate_fusion"] = inter_metrics

        # 4. Late Fusion
        if strategy in ["late", "all"]:
            late_pipe = LateFusionPipeline(model_type=classifier, rf_weight=rf_weight)
            late_metrics = late_pipe.train(X_rf, X_img, y)
            model_store.late_fusion = late_pipe
            log_experiment_result(late_metrics, {"classifier": classifier, "fusion_type": "late", "rf_weight": rf_weight})
            results["late_fusion"] = late_metrics

        return jsonify({
            "status": "success",
            "message": "Multimodal fusion models trained and benchmarked successfully.",
            "results": results
        })

    except Exception as e:
        logger.error(f"Error training fusion models: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
