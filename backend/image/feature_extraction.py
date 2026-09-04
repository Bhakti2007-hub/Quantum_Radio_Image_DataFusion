"""Image feature extraction using spatial, color, and texture descriptors."""
import numpy as np
from PIL import Image, ImageFilter, ImageOps
import io
import base64
from typing import Dict, Any, Tuple, List, Union
from pathlib import Path
from backend.config import IMAGE_FEATURE_NAMES

def extract_features_from_pil(img: Image.Image) -> Dict[str, float]:
    """Extract standard optical target descriptors from a PIL Image instance."""
    # Convert to RGB and resize for standardized processing
    img_rgb = img.convert("RGB").resize((128, 128))
    img_gray = img_rgb.convert("L")
    
    arr_rgb = np.array(img_rgb, dtype=np.float32)
    arr_gray = np.array(img_gray, dtype=np.float32)
    
    # 1. Color moments (Mean and Std per channel)
    r_mean = float(np.mean(arr_rgb[:, :, 0]))
    g_mean = float(np.mean(arr_rgb[:, :, 1]))
    b_mean = float(np.mean(arr_rgb[:, :, 2]))
    r_std = float(np.std(arr_rgb[:, :, 0]))
    g_std = float(np.std(arr_rgb[:, :, 1]))
    b_std = float(np.std(arr_rgb[:, :, 2]))
    
    # 2. Edge density
    edges = img_gray.filter(ImageFilter.FIND_EDGES)
    edge_arr = np.array(edges, dtype=np.float32)
    edge_density = float(np.sum(edge_arr > 40.0) / edge_arr.size)
    
    # 3. Spatial Entropy (intensity distribution)
    hist, _ = np.histogram(arr_gray, bins=32, range=(0, 256), density=True)
    hist = hist[hist > 0]
    spatial_entropy = float(-np.sum(hist * np.log2(hist)))
    
    # 4. Aspect Ratio of salient region
    thresh = arr_gray < 220
    if np.any(thresh):
        rows = np.any(thresh, axis=1)
        cols = np.any(thresh, axis=0)
        ymin, ymax = np.where(rows)[0][[0, -1]]
        xmin, xmax = np.where(cols)[0][[0, -1]]
        h = max(1, ymax - ymin)
        w = max(1, xmax - xmin)
        aspect_ratio = float(w / h)
    else:
        aspect_ratio = 1.0

    # 5. Texture features (Contrast, Homogeneity, Energy approximations)
    diff_h = np.abs(arr_gray[:, 1:] - arr_gray[:, :-1])
    diff_v = np.abs(arr_gray[1:, :] - arr_gray[:-1, :])
    t_contrast = float((np.mean(diff_h**2) + np.mean(diff_v**2)) / (2.0 * 255.0**2))
    t_homogeneity = float(np.mean(1.0 / (1.0 + (diff_h / 255.0))) + np.mean(1.0 / (1.0 + (diff_v / 255.0)))) / 2.0
    t_energy = float(np.mean((arr_gray / 255.0)**2))

    return {
        "edge_density": round(float(np.clip(edge_density, 0.0, 1.0)), 4),
        "aspect_ratio": round(float(np.clip(aspect_ratio, 0.1, 5.0)), 3),
        "spatial_entropy": round(float(spatial_entropy), 3),
        "color_moment_r_mean": round(r_mean, 2),
        "color_moment_g_mean": round(g_mean, 2),
        "color_moment_b_mean": round(b_mean, 2),
        "color_moment_r_std": round(r_std, 2),
        "color_moment_g_std": round(g_std, 2),
        "color_moment_b_std": round(b_std, 2),
        "texture_contrast": round(float(np.clip(t_contrast, 0.0, 1.0)), 4),
        "texture_homogeneity": round(float(np.clip(t_homogeneity, 0.0, 1.0)), 4),
        "texture_energy": round(float(np.clip(t_energy, 0.0, 1.0)), 4)
    }

def extract_features_from_path_or_bytes(image_source: Union[str, bytes, Path]) -> Dict[str, Any]:
    """Load image from path, raw bytes, or base64 and extract features."""
    if isinstance(image_source, (str, Path)):
        p = Path(image_source)
        if not p.exists():
            raise FileNotFoundError(f"Image not found at {p}")
        img = Image.open(p)
    elif isinstance(image_source, bytes):
        img = Image.open(io.BytesIO(image_source))
    else:
        raise ValueError("Unsupported image source type.")

    width, height = img.size
    features = extract_features_from_pil(img)
    
    # Generate thumbnail base64
    thumb = img.copy().convert("RGB")
    thumb.thumbnail((160, 160))
    buf = io.BytesIO()
    thumb.save(buf, format="JPEG", quality=85)
    img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return {
        "dimensions": {"width": width, "height": height},
        "features": features,
        "feature_vector": [features[k] for k in IMAGE_FEATURE_NAMES if k in features],
        "thumbnail_b64": f"data:image/jpeg;base64,{img_b64}"
    }
