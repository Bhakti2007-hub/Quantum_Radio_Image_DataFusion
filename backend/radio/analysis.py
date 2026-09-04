"""Radio signal data analysis, statistical distributions, correlation, and 2D projections."""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List
from backend.config import RADIO_FEATURE_NAMES, TARGET_CLASSES, RANDOM_SEED
from backend.data.dataset_loader import MultimodalDatasetManager

def analyze_radio_modality() -> Dict[str, Any]:
    """Perform comprehensive statistical and spatial analysis of Radio features."""
    manager = MultimodalDatasetManager.get_instance()
    X, y, feature_names = manager.get_radio_features()
    df = manager.df
    
    # 1. Feature distributions (mean, std, min, max, median, quartiles)
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

    # 2. Correlation Matrix
    corr_df = df[feature_names].corr().fillna(0)
    correlation_matrix = {
        "features": feature_names,
        "matrix": [[round(float(val), 3) for val in row] for row in corr_df.values]
    }

    # 3. RF Feature Importance using Random Forest
    rf_clf = RandomForestClassifier(n_estimators=50, random_state=RANDOM_SEED)
    rf_clf.fit(X, y)
    importances = rf_clf.feature_importances_
    importance_ranking = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
    ]

    # 4. 2D PCA Feature Space Projection
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
            "rssi_dbm": float(df["rssi_dbm"].iloc[i]) if "rssi_dbm" in df.columns else 0.0,
            "snr_db": float(df["snr_db"].iloc[i]) if "snr_db" in df.columns else 0.0,
            "doppler_shift_khz": float(df["doppler_shift_khz"].iloc[i]) if "doppler_shift_khz" in df.columns else 0.0
        })

    pca_variance = [round(float(v), 4) for v in pca.explained_variance_ratio_.tolist()]

    # 5. Class-specific RF Summary
    class_profiles = {}
    for class_name in df["target_class"].unique():
        sub_df = df[df["target_class"] == class_name]
        class_profiles[class_name] = {
            "mean_rssi": round(float(sub_df["rssi_dbm"].mean()), 2) if "rssi_dbm" in sub_df else 0,
            "mean_snr": round(float(sub_df["snr_db"].mean()), 2) if "snr_db" in sub_df else 0,
            "mean_doppler": round(float(sub_df["doppler_shift_khz"].mean()), 3) if "doppler_shift_khz" in sub_df else 0,
            "sample_count": len(sub_df)
        }

    return {
        "total_samples": len(df),
        "features": feature_names,
        "distributions": distributions,
        "correlation_matrix": correlation_matrix,
        "feature_importance": importance_ranking,
        "pca_projection": {
            "points": points_2d,
            "explained_variance": pca_variance,
            "total_variance": round(float(sum(pca_variance)), 4)
        },
        "class_profiles": class_profiles,
        "research_note": (
            "Radio measurements (RSSI, SNR, Doppler shift, and spectral kurtosis) capture electromagnetic kinematics and channel physics. "
            "Micro-Doppler spreads distinguish rotational UAV dynamics from linear aircraft/vehicle kinetics, providing critical non-line-of-sight sensing."
        )
    }
