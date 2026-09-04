"""Evaluation metrics utility for classical and quantum model benchmarking."""
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
    classification_report
)
from typing import Dict, Any, List, Optional

def compute_model_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: Optional[np.ndarray] = None,
    class_names: Optional[List[str]] = None,
    train_time_sec: float = 0.0,
    inference_time_ms: float = 0.0,
    model_name: str = "Model",
    modality: str = "Fused"
) -> Dict[str, Any]:
    """Compute comprehensive evaluation metrics from true and predicted targets."""
    acc = float(accuracy_score(y_true, y_pred))
    prec_macro = float(precision_score(y_true, y_pred, average="macro", zero_division=0))
    rec_macro = float(recall_score(y_true, y_pred, average="macro", zero_division=0))
    f1_macro = float(f1_score(y_true, y_pred, average="macro", zero_division=0))
    
    prec_weighted = float(precision_score(y_true, y_pred, average="weighted", zero_division=0))
    rec_weighted = float(recall_score(y_true, y_pred, average="weighted", zero_division=0))
    f1_weighted = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))

    cm = confusion_matrix(y_true, y_pred).tolist()

    roc_auc = None
    if y_prob is not None:
        try:
            if len(np.unique(y_true)) > 1:
                if y_prob.ndim == 2 and y_prob.shape[1] > 2:
                    roc_auc = float(roc_auc_score(y_true, y_prob, multi_class="ovr", average="macro"))
                elif y_prob.ndim == 2 and y_prob.shape[1] == 2:
                    roc_auc = float(roc_auc_score(y_true, y_prob[:, 1]))
                elif y_prob.ndim == 1:
                    roc_auc = float(roc_auc_score(y_true, y_prob))
        except Exception:
            roc_auc = None

    # Per-class metrics
    unique_labels = sorted(list(set(y_true).union(set(y_pred))))
    per_class = {}
    for idx, lbl in enumerate(unique_labels):
        name = class_names[lbl] if class_names and lbl < len(class_names) else f"Class_{lbl}"
        y_t_binary = (y_true == lbl).astype(int)
        y_p_binary = (y_pred == lbl).astype(int)
        per_class[name] = {
            "precision": round(float(precision_score(y_t_binary, y_p_binary, zero_division=0)), 4),
            "recall": round(float(recall_score(y_t_binary, y_p_binary, zero_division=0)), 4),
            "f1": round(float(f1_score(y_t_binary, y_p_binary, zero_division=0)), 4),
            "support": int(np.sum(y_true == lbl))
        }

    return {
        "model_name": model_name,
        "modality": modality,
        "accuracy": round(acc, 4),
        "precision": round(prec_macro, 4),
        "recall": round(rec_macro, 4),
        "f1": round(f1_macro, 4),
        "precision_weighted": round(prec_weighted, 4),
        "recall_weighted": round(rec_weighted, 4),
        "f1_weighted": round(f1_weighted, 4),
        "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
        "confusion_matrix": cm,
        "per_class": per_class,
        "train_time_sec": round(train_time_sec, 4),
        "inference_time_ms": round(inference_time_ms, 3),
        "sample_count": len(y_true)
    }
