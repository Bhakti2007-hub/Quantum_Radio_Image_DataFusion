"""Flask REST API server for Quantum ML for Radio-Image Data Fusion research platform."""
import os
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import PORT, HOST, DEBUG
from backend.routes.datasets import datasets_bp
from backend.routes.analysis import analysis_bp
from backend.routes.fusion import fusion_bp
from backend.routes.quantum import quantum_bp
from backend.routes.prediction import prediction_bp
from backend.routes.experiments import experiments_bp
from backend.utils.logging_config import logger

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(datasets_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(fusion_bp)
    app.register_blueprint(quantum_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(experiments_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "service": "Quantum ML for Radio-Image Data Fusion API",
            "version": "1.0.0",
            "simulation_mode": "Quantum Simulation Enabled"
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"status": "error", "message": "API endpoint not found."}), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal server error: {e}")
        return jsonify({"status": "error", "message": "Internal research server error."}), 500

    return app

app = create_app()

if __name__ == "__main__":
    logger.info(f"Starting Quantum ML Radio-Image Data Fusion API server on http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=DEBUG)
