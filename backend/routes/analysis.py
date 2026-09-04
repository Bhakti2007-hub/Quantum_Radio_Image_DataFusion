"""Endpoints for Radio and Optical Image modality analysis."""
from flask import Blueprint, jsonify, request
from backend.radio.analysis import analyze_radio_modality
from backend.image.preprocessing import analyze_image_modality
from backend.image.feature_extraction import extract_features_from_path_or_bytes
from backend.utils.logging_config import logger

analysis_bp = Blueprint("analysis", __name__)

@analysis_bp.route("/api/radio/analysis", methods=["GET"])
def get_radio_analysis():
    """Get radio features distributions, correlation matrix, RF importance, and 2D PCA."""
    try:
        data = analyze_radio_modality()
        return jsonify({
            "status": "success",
            **data
        })
    except Exception as e:
        logger.error(f"Error analyzing radio modality: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@analysis_bp.route("/api/image/analysis", methods=["GET"])
def get_image_analysis():
    """Get optical image feature distributions and 2D visual manifold projection."""
    try:
        data = analyze_image_modality()
        return jsonify({
            "status": "success",
            **data
        })
    except Exception as e:
        logger.error(f"Error analyzing image modality: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@analysis_bp.route("/api/image/analyze", methods=["POST"])
def analyze_single_image():
    """Analyze a single uploaded image and extract optical target features."""
    try:
        if "image" in request.files:
            file = request.files["image"]
            image_bytes = file.read()
            result = extract_features_from_path_or_bytes(image_bytes)
            return jsonify({
                "status": "success",
                "filename": file.filename,
                **result
            })
        elif request.is_json and "image_path" in request.json:
            image_path = request.json["image_path"]
            result = extract_features_from_path_or_bytes(image_path)
            return jsonify({
                "status": "success",
                "image_path": image_path,
                **result
            })
        else:
            return jsonify({"status": "error", "message": "No image provided."}), 400
    except Exception as e:
        logger.error(f"Error analyzing single image: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
