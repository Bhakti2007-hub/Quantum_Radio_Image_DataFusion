"""Quantum Machine Learning training, kernel computation, and circuit inspection routes."""
from flask import Blueprint, jsonify, request
from backend.data.dataset_loader import MultimodalDatasetManager
from backend.quantum.quantum_classifier import QuantumTargetClassifier
from backend.quantum.circuit_visualizer import generate_circuit_metadata
from backend.models.model_store import model_store
from backend.routes.experiments import log_experiment_result
from backend.utils.logging_config import logger

quantum_bp = Blueprint("quantum", __name__)

@quantum_bp.route("/api/quantum/train", methods=["POST"])
def train_quantum_model():
    """Train Quantum Support Vector Classifier (QSVC) on multimodal data."""
    try:
        body = request.get_json() or {}
        n_qubits = int(body.get("n_qubits", 4))
        reps = int(body.get("reps", 2))
        feature_map = body.get("feature_map", "ZZFeatureMap")
        c_param = float(body.get("C", 1.0))

        # Enforce realistic quantum limits for fast interactive research
        n_qubits = min(max(2, n_qubits), 8)
        reps = min(max(1, reps), 4)

        manager = MultimodalDatasetManager.get_instance()
        X_rf, _, _ = manager.get_radio_features()
        X_img, y, _ = manager.get_image_features()

        q_classifier = QuantumTargetClassifier(
            n_qubits=n_qubits,
            reps=reps,
            feature_map_name=feature_map,
            C=c_param
        )

        metrics = q_classifier.train_and_evaluate(X_rf, X_img, y)
        model_store.quantum_model = q_classifier
        
        log_experiment_result(metrics, {
            "n_qubits": n_qubits,
            "reps": reps,
            "feature_map": feature_map,
            "C": c_param,
            "backend": "Statevector Quantum Simulator"
        })

        return jsonify({
            "status": "success",
            "message": "Quantum Support Vector Classifier trained successfully (Quantum Simulation).",
            "metrics": metrics,
            "circuit_info": q_classifier.circuit_info
        })

    except Exception as e:
        logger.error(f"Error training quantum classifier: {e}")
        return jsonify({
            "status": "error",
            "message": f"Quantum simulation encountered an error: {str(e)}",
            "help": "Quantum simulation is currently using analytical fallback."
        }), 500

@quantum_bp.route("/api/quantum/circuit", methods=["GET"])
def get_circuit_details():
    """Get quantum circuit structure and gate diagram."""
    try:
        n_qubits = int(request.args.get("n_qubits", 4))
        reps = int(request.args.get("reps", 2))
        feature_map = request.args.get("feature_map", "ZZFeatureMap")
        
        circuit_info = generate_circuit_metadata(n_qubits=n_qubits, reps=reps, feature_map_type=feature_map)
        return jsonify({
            "status": "success",
            **circuit_info
        })
    except Exception as e:
        logger.error(f"Error getting circuit metadata: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
