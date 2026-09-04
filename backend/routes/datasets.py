"""Dataset management, exploration, and upload endpoints."""
import os
import werkzeug.utils
from flask import Blueprint, jsonify, request
from pathlib import Path
from backend.data.dataset_loader import MultimodalDatasetManager
from backend.config import UPLOAD_DIR
from backend.utils.logging_config import logger

datasets_bp = Blueprint("datasets", __name__)

ALLOWED_EXTENSIONS = {"csv", "png", "jpg", "jpeg"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@datasets_bp.route("/api/datasets", methods=["GET"])
def get_dataset_info():
    """Get current dataset summary, stats, and sample records."""
    try:
        manager = MultimodalDatasetManager.get_instance()
        summary = manager.get_summary()
        return jsonify({
            "status": "success",
            **summary
        })
    except Exception as e:
        logger.error(f"Error fetching dataset info: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@datasets_bp.route("/api/datasets/reset", methods=["POST"])
def reset_dataset():
    """Reset dataset to default synthetic demonstration dataset."""
    try:
        data = request.get_json() or {}
        n_samples = int(data.get("n_samples", 500))
        manager = MultimodalDatasetManager.get_instance()
        summary = manager.reset_to_synthetic(n_samples=n_samples)
        return jsonify({
            "status": "success",
            "message": f"Reset to synthetic dataset with {n_samples} samples.",
            **summary
        })
    except Exception as e:
        logger.error(f"Error resetting dataset: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@datasets_bp.route("/api/datasets/upload", methods=["POST"])
def upload_dataset():
    """Upload custom CSV dataset or image file."""
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded in request."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"status": "error", "message": "Empty filename."}), 400

    if not allowed_file(file.filename):
        return jsonify({"status": "error", "message": "Unsupported file type. Use CSV or PNG/JPEG images."}), 400

    filename = werkzeug.utils.secure_filename(file.filename)
    save_path = UPLOAD_DIR / filename
    file.save(save_path)

    try:
        if filename.endswith(".csv"):
            is_real = request.form.get("is_real_data", "true").lower() == "true"
            manager = MultimodalDatasetManager.get_instance()
            summary = manager.load_custom_csv(str(save_path), is_real_data=is_real)
            return jsonify({
                "status": "success",
                "message": f"Successfully loaded CSV dataset: {filename}",
                **summary
            })
        else:
            return jsonify({
                "status": "success",
                "message": f"Successfully uploaded image: {filename}",
                "file_path": str(save_path),
                "filename": filename
            })
    except Exception as e:
        logger.error(f"Error processing uploaded dataset: {e}")
        return jsonify({"status": "error", "message": str(e)}), 400
