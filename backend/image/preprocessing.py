"""Image dataset analysis, class distributions, and PCA visual space projections."""
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List
from backend.config import IMAGE_FEATURE_NAMES, TARGET_CLASSES, RANDOM_SEED
from backend.data.dataset_loader import MultimodalDatasetManager

def analyze_image_modality() -> Dict[str, Any]:
    """Perform statistical and 2D manifold projection of visual feature space."""
    manager = MultimodalDatasetManager.get_instance()
    X, y, feature_names = manager.get_image_features()
    df = manager.df

    # Feature statistics
    distributions = {}
    for col in feature_names:
        series = df[col].dropna()
        hist_counts, bin_edges = np.histogram(series, bins=15)
        distributions[col] = {
            "mean": round(float(series.mean()), 2),
            "std": round(float(series.std()), 2),
            "min": round(float(series.min()), 2),
            "max": round(float(series.max()), 2),
            "median": round(float(series.median()), 2),
            "histogram": [
                {"bin": f"{round(bin_edges[i], 1)} - {round(bin_edges[i+1], 1)}", "count": int(hist_counts[i]), "mid": round((bin_edges[i]+bin_edges[i+1])/2, 2)}
                for i in range(len(hist_counts))
            ]
        }

    # 2D PCA Visual Manifold
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    pca = PCA(n_components=2, random_state=RANDOM_SEED)
    X_2d = pca.fit_transform(X_scaled)

    points_2d = []
    class_map = {i: c for i, c in enumerate(TARGET_CLASSES)}
    for i in range(len(X_2d)):
        target_name = df["target_class"].iloc[i] if "target_class" in df.columns else class_map.get(y[i], f"Class_{y[i]}")
        points_2d.append({
            "sample_id": int(df["sample_id"].iloc[i]) if "sample_id" in df.columns else i + 1,
            "x": round(float(X_2d[i, 0]), 3),
            "y": round(float(X_2d[i, 1]), 3),
            "target_class": target_name,
            "class_label": int(y[i]),
            "edge_density": float(df["edge_density"].iloc[i]) if "edge_density" in df.columns else 0.0,
            "aspect_ratio": float(df["aspect_ratio"].iloc[i]) if "aspect_ratio" in df.columns else 1.0,
            "spatial_entropy": float(df["spatial_entropy"].iloc[i]) if "spatial_entropy" in df.columns else 0.0
        })

    pca_variance = [round(float(v), 4) for v in pca.explained_variance_ratio_.tolist()]

    return {
        "total_samples": len(df),
        "features": feature_names,
        "distributions": distributions,
        "pca_projection": {
            "points": points_2d,
            "explained_variance": pca_variance,
            "total_variance": round(float(sum(pca_variance)), 4)
        },
        "research_note": (
            "Optical image features capture geometric aspect ratio, edge texture density, and spatial entropy. "
            "Visual features provide high spatial fidelity in clear line-of-sight, but degrade in adverse weather or RF occlusion."
        )
    }
