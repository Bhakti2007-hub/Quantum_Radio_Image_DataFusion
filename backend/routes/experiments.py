"""Experiment registry and model comparison tracker."""
import time
import datetime
from typing import Dict, Any, List, Optional
from flask import Blueprint, jsonify, request
from backend.routes.insights import generate_research_insights

experiments_bp = Blueprint("experiments", __name__)

# In-memory experiment registry initialized with initial baseline runs
EXPERIMENT_REGISTRY: List[Dict[str, Any]] = []

def log_experiment_result(metrics: Dict[str, Any], params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Record a model run into the experiment registry."""
    exp_id = f"EXP-{len(EXPERIMENT_REGISTRY) + 1:04d}"
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    entry = {
        "experiment_id": exp_id,
        "timestamp": timestamp,
        "model_name": metrics.get("model_name", "Model"),
        "modality": metrics.get("modality", "Fused"),
        "accuracy": metrics.get("accuracy", 0.0),
        "precision": metrics.get("precision", 0.0),
        "recall": metrics.get("recall", 0.0),
        "f1": metrics.get("f1", 0.0),
        "roc_auc": metrics.get("roc_auc"),
        "train_time_sec": metrics.get("train_time_sec", 0.0),
        "inference_time_ms": metrics.get("inference_time_ms", 0.0),
        "confusion_matrix": metrics.get("confusion_matrix", []),
        "per_class": metrics.get("per_class", {}),
        "parameters": params or {},
        "quantum_metadata": metrics.get("quantum_metadata"),
        "execution_mode": "Quantum Simulation" if "Quantum" in metrics.get("modality", "") else "Classical ML"
    }

    EXPERIMENT_REGISTRY.append(entry)
    return entry

@experiments_bp.route("/api/experiments", methods=["GET"])
def get_experiments():
    """Retrieve full history of executed experiments."""
    return jsonify({
        "status": "success",
        "total_experiments": len(EXPERIMENT_REGISTRY),
        "experiments": EXPERIMENT_REGISTRY
    })

@experiments_bp.route("/api/models/comparison", methods=["GET"])
def get_model_comparison():
    """Retrieve summarized model benchmark comparison table."""
    # Deduplicate by (modality, model_name) keeping latest run
    latest_models = {}
    for exp in EXPERIMENT_REGISTRY:
        key = f"{exp['modality']}::{exp['model_name']}"
        latest_models[key] = exp

    comparison_list = list(latest_models.values())
    
    # Identify best performing model by F1
    best_f1 = -1.0
    best_model_id = None
    for exp in comparison_list:
        if exp["f1"] > best_f1:
            best_f1 = exp["f1"]
            best_model_id = exp["experiment_id"]

    return jsonify({
        "status": "success",
        "comparison_table": comparison_list,
        "best_model_id": best_model_id,
        "best_f1": best_f1
    })

@experiments_bp.route("/api/insights", methods=["GET"])
def get_insights():
    """Generate and return dynamic research conclusions based on actual runs."""
    insights_data = generate_research_insights(EXPERIMENT_REGISTRY)
    return jsonify({
        "status": "success",
        **insights_data
    })

@experiments_bp.route("/api/experiments/clear", methods=["POST"])
def clear_experiments():
    """Clear experiment history."""
    global EXPERIMENT_REGISTRY
    EXPERIMENT_REGISTRY = []
    return jsonify({"status": "success", "message": "Experiment history cleared."})
