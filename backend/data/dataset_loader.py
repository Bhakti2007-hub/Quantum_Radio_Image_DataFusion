"""Dataset loader and repository manager for multimodal radio-image data."""
import os
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List
from backend.config import (
    DATA_DIR,
    RADIO_FEATURE_NAMES,
    IMAGE_FEATURE_NAMES,
    TARGET_CLASSES,
    RANDOM_SEED
)
from backend.data.synthetic_generator import generate_multimodal_dataset
from backend.utils.logging_config import logger

class MultimodalDatasetManager:
    _instance = None

    def __init__(self):
        self.dataset_type = "Synthetic Demonstration Dataset"
        self.dataset_path = DATA_DIR / "synthetic_target_dataset.csv"
        self.df: Optional[pd.DataFrame] = None
        self._load_or_generate_default()

    @classmethod
    def get_instance(cls) -> "MultimodalDatasetManager":
        if cls._instance is None:
            cls._instance = MultimodalDatasetManager()
        return cls._instance

    def _load_or_generate_default(self):
        """Load cached synthetic dataset or generate fresh if not present."""
        if self.dataset_path.exists():
            try:
                self.df = pd.read_csv(self.dataset_path)
                logger.info(f"Loaded existing dataset from {self.dataset_path} with {len(self.df)} samples.")
                return
            except Exception as e:
                logger.warning(f"Failed to read existing dataset: {e}. Generating new.")
        
        self.df = generate_multimodal_dataset(n_samples=500, random_seed=RANDOM_SEED)
        self.df.to_csv(self.dataset_path, index=False)
        self.dataset_type = "Synthetic Demonstration Dataset"

    def reset_to_synthetic(self, n_samples: int = 500) -> Dict[str, Any]:
        """Regenerate default synthetic demonstration dataset."""
        self.df = generate_multimodal_dataset(n_samples=n_samples, random_seed=RANDOM_SEED)
        self.df.to_csv(self.dataset_path, index=False)
        self.dataset_type = "Synthetic Demonstration Dataset"
        return self.get_summary()

    def load_custom_csv(self, file_path: str, is_real_data: bool = True) -> Dict[str, Any]:
        """Load custom user-uploaded CSV dataset."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        df_custom = pd.read_csv(path)
        # Check required columns or adapt
        if "target_class" not in df_custom.columns:
            if "label" in df_custom.columns:
                df_custom["target_class"] = df_custom["label"]
            elif "class" in df_custom.columns:
                df_custom["target_class"] = df_custom["class"]
            else:
                raise ValueError("Dataset must contain a 'target_class', 'label', or 'class' column.")

        # Ensure numeric label
        unique_classes = sorted(list(df_custom["target_class"].unique()))
        class_to_id = {c: i for i, c in enumerate(unique_classes)}
        df_custom["class_label"] = df_custom["target_class"].map(class_to_id)
        if "sample_id" not in df_custom.columns:
            df_custom["sample_id"] = np.arange(1, len(df_custom) + 1)

        self.df = df_custom
        self.dataset_path = path
        self.dataset_type = "Real Dataset" if is_real_data else "Synthetic Demonstration Dataset"
        logger.info(f"Loaded custom dataset '{path.name}' ({self.dataset_type}) with {len(self.df)} samples.")
        return self.get_summary()

    def get_radio_features(self) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """Get Radio-frequency features and labels."""
        if self.df is None:
            self._load_or_generate_default()
        
        avail_features = [col for col in RADIO_FEATURE_NAMES if col in self.df.columns]
        if not avail_features:
            # Fallback to numeric columns
            numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
            avail_features = [c for c in numeric_cols if c not in ["sample_id", "class_label"]]
        
        X = self.df[avail_features].values
        y = self.df["class_label"].values
        return X, y, avail_features

    def get_image_features(self) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """Get optical visual features and labels."""
        if self.df is None:
            self._load_or_generate_default()
            
        avail_features = [col for col in IMAGE_FEATURE_NAMES if col in self.df.columns]
        if not avail_features:
            numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
            avail_features = [c for c in numeric_cols if c not in RADIO_FEATURE_NAMES and c not in ["sample_id", "class_label"]]
        
        X = self.df[avail_features].values
        y = self.df["class_label"].values
        return X, y, avail_features

    def get_fused_features(self) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """Get combined (early fused) features and labels."""
        X_rf, y, rf_names = self.get_radio_features()
        X_img, _, img_names = self.get_image_features()
        X_fused = np.hstack([X_rf, X_img])
        fused_names = [f"RF_{n}" for n in rf_names] + [f"IMG_{n}" for n in img_names]
        return X_fused, y, fused_names

    def get_summary(self) -> Dict[str, Any]:
        """Return structured summary metadata of current dataset."""
        if self.df is None:
            self._load_or_generate_default()

        rf_features = [col for col in RADIO_FEATURE_NAMES if col in self.df.columns]
        img_features = [col for col in IMAGE_FEATURE_NAMES if col in self.df.columns]
        
        class_counts = self.df["target_class"].value_counts().to_dict()
        missing_counts = self.df.isnull().sum().to_dict()
        total_missing = int(sum(missing_counts.values()))

        head_samples = self.df.head(10).to_dict(orient="records")

        return {
            "dataset_name": self.dataset_path.name if self.dataset_path else "synthetic_target_dataset.csv",
            "dataset_type": self.dataset_type,
            "total_samples": len(self.df),
            "radio_features_count": len(rf_features),
            "image_features_count": len(img_features),
            "total_features_count": len(rf_features) + len(img_features),
            "classes": sorted(list(self.df["target_class"].unique())),
            "class_distribution": class_counts,
            "missing_values_count": total_missing,
            "missing_values_per_col": missing_counts,
            "radio_feature_names": rf_features,
            "image_feature_names": img_features,
            "sample_records": head_samples
        }
