"""Synthetic multimodal dataset generator for wireless target detection research.
Generates physically consistent RF features and paired visual image descriptors/images.
"""
import os
import numpy as np
import pandas as pd
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
from backend.config import (
    RADIO_FEATURE_NAMES,
    IMAGE_FEATURE_NAMES,
    TARGET_CLASSES,
    SAMPLE_IMAGES_DIR,
    RANDOM_SEED
)
from backend.utils.logging_config import logger

def generate_synthetic_image(target_class: str, sample_id: int, output_dir: Path) -> str:
    """Generate a clean synthetic optical profile image representing target class."""
    output_dir.mkdir(parents=True, exist_ok=True)
    img_filename = f"sample_{sample_id:04d}_{target_class.lower()}.png"
    img_path = output_dir / img_filename
    
    if img_path.exists():
        return str(img_path)

    # 128x128 image with class-specific geometry and palette
    width, height = 128, 128
    img = Image.new("RGB", (width, height), color=(240, 243, 240))
    draw = ImageDraw.Draw(img)

    np.random.seed(sample_id + 100)
    jitter_x = int(np.random.randint(-6, 7))
    jitter_y = int(np.random.randint(-6, 7))
    cx, cy = 64 + jitter_x, 64 + jitter_y

    if target_class == "UAV_Drone":
        # Sky background gradient
        for y in range(height):
            c_val = int(210 + (y / height) * 35)
            draw.line([(0, y), (width, y)], fill=(c_val - 20, c_val - 10, c_val + 10))
        # Central fuselage
        draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(45, 55, 60), outline=(20, 25, 30))
        # 4 Rotor arms (X shape)
        draw.line([cx - 28, cy - 28, cx + 28, cy + 28], fill=(30, 35, 40), width=3)
        draw.line([cx - 28, cy + 28, cx + 28, cy - 28], fill=(30, 35, 40), width=3)
        # Rotors
        for rx, ry in [(cx - 28, cy - 28), (cx + 28, cy - 28), (cx - 28, cy + 28), (cx + 28, cy + 28)]:
            draw.ellipse([rx - 8, ry - 3, rx + 8, ry + 3], outline=(90, 110, 120), width=2)

    elif target_class == "Ground_Vehicle":
        # Ground / asphalt road background
        for y in range(height):
            c_val = int(180 + (y / height) * 20)
            draw.line([(0, y), (width, y)], fill=(c_val - 15, c_val - 10, c_val - 20))
        # Vehicle body (rectangular profile with cabin)
        draw.rectangle([cx - 30, cy - 14, cx + 30, cy + 14], fill=(70, 85, 75), outline=(40, 50, 45))
        draw.rectangle([cx - 18, cy - 10, cx + 10, cy + 10], fill=(130, 150, 140), outline=(50, 60, 55))
        # Wheels
        for wx, wy in [(cx - 22, cy - 16), (cx + 22, cy - 16), (cx - 22, cy + 16), (cx + 22, cy + 16)]:
            draw.rectangle([wx - 4, wy - 3, wx + 4, wy + 3], fill=(30, 30, 30))

    elif target_class == "Civil_Aircraft":
        # Clear altitude atmospheric background
        for y in range(height):
            draw.line([(0, y), (width, y)], fill=(200, 220, 245))
        # Fuselage (long cylinder)
        draw.polygon([(cx - 40, cy), (cx + 35, cy - 6), (cx + 42, cy), (cx + 35, cy + 6)], fill=(245, 245, 250), outline=(80, 90, 110))
        # Wings
        draw.polygon([(cx - 5, cy - 35), (cx + 10, cy), (cx - 5, cy + 35), (cx - 12, cy)], fill=(220, 225, 235), outline=(100, 110, 125))
        # Tail fin
        draw.polygon([(cx - 38, cy - 15), (cx - 28, cy), (cx - 38, cy)], fill=(200, 70, 60))

    elif target_class == "Maritime_Vessel":
        # Oceanic sea texture background
        for y in range(height):
            draw.line([(0, y), (width, y)], fill=(65 + int(y/4), 110 + int(y/3), 145 + int(y/3)))
        # Vessel hull
        draw.polygon([(cx - 35, cy - 10), (cx + 30, cy - 8), (cx + 42, cy), (cx + 30, cy + 8), (cx - 35, cy + 10)], fill=(225, 230, 235), outline=(50, 60, 70))
        # Superstructure / bridge
        draw.rectangle([cx - 15, cy - 6, cx + 5, cy + 6], fill=(160, 175, 185), outline=(70, 80, 90))
        # Wake effect
        draw.line([cx - 35, cy - 12, cx - 55, cy - 20], fill=(220, 240, 255), width=2)
        draw.line([cx - 35, cy + 12, cx - 55, cy + 20], fill=(220, 240, 255), width=2)

    else: # Clutter_Noise
        # Ambient noise background
        for y in range(height):
            draw.line([(0, y), (width, y)], fill=(195 + (y%10)*2, 190 + (y%8)*2, 185 + (y%6)*2))
        for _ in range(35):
            rx = int(np.random.randint(5, width - 5))
            ry = int(np.random.randint(5, height - 5))
            rsize = int(np.random.randint(2, 8))
            draw.ellipse([rx, ry, rx + rsize, ry + rsize], fill=(170, 175, 170), outline=None)

    img = img.filter(ImageFilter.GaussianBlur(radius=0.6))
    img.save(img_path)
    return str(img_path)


def generate_multimodal_dataset(n_samples: int = 500, random_seed: int = RANDOM_SEED) -> pd.DataFrame:
    """
    Generate synthetic multimodal target dataset with realistic physical correlations.
    """
    np.random.seed(random_seed)
    samples_per_class = n_samples // len(TARGET_CLASSES)
    records = []
    sample_id = 0

    for class_idx, class_name in enumerate(TARGET_CLASSES):
        for _ in range(samples_per_class):
            sample_id += 1
            
            # Physical RF parameter generation
            if class_name == "UAV_Drone":
                rssi = np.random.normal(-62.0, 5.5)
                snr = np.random.normal(16.5, 4.0)
                freq = np.random.choice([2.4, 5.8]) + np.random.normal(0, 0.02)
                bw = np.random.choice([20.0, 40.0])
                doppler = np.random.normal(4.8, 1.2) # High micro-Doppler due to propellers
                phase_var = np.random.normal(0.42, 0.08)
                path_loss = np.random.normal(82.0, 6.0)
                spectral_kurt = np.random.normal(5.2, 1.1)
                papr = np.random.normal(8.5, 1.2)
                # Visual features
                edge_density = np.random.normal(0.68, 0.08)
                aspect_ratio = np.random.normal(1.02, 0.12)
                spatial_entropy = np.random.normal(5.8, 0.4)
                cr_mean, cg_mean, cb_mean = np.random.normal(160, 15), np.random.normal(175, 15), np.random.normal(190, 15)
                cr_std, cg_std, cb_std = np.random.normal(42, 6), np.random.normal(45, 6), np.random.normal(48, 6)
                t_contrast = np.random.normal(0.72, 0.1)
                t_homo = np.random.normal(0.48, 0.08)
                t_energy = np.random.normal(0.35, 0.06)

            elif class_name == "Ground_Vehicle":
                rssi = np.random.normal(-54.0, 6.0)
                snr = np.random.normal(21.0, 3.8)
                freq = np.random.choice([0.9, 1.8, 2.1]) + np.random.normal(0, 0.01)
                bw = np.random.choice([10.0, 20.0])
                doppler = np.random.normal(1.2, 0.4) # Low terrestrial Doppler
                phase_var = np.random.normal(0.28, 0.06)
                path_loss = np.random.normal(74.0, 5.5)
                spectral_kurt = np.random.normal(3.8, 0.8)
                papr = np.random.normal(6.8, 0.9)
                # Visual features
                edge_density = np.random.normal(0.58, 0.07)
                aspect_ratio = np.random.normal(1.85, 0.22)
                spatial_entropy = np.random.normal(5.2, 0.35)
                cr_mean, cg_mean, cb_mean = np.random.normal(135, 12), np.random.normal(140, 12), np.random.normal(130, 12)
                cr_std, cg_std, cb_std = np.random.normal(35, 5), np.random.normal(36, 5), np.random.normal(32, 5)
                t_contrast = np.random.normal(0.62, 0.09)
                t_homo = np.random.normal(0.55, 0.07)
                t_energy = np.random.normal(0.42, 0.05)

            elif class_name == "Civil_Aircraft":
                rssi = np.random.normal(-75.0, 6.5)
                snr = np.random.normal(14.0, 3.5)
                freq = np.random.choice([1.09, 2.7, 9.4]) + np.random.normal(0, 0.02)
                bw = np.random.choice([25.0, 50.0])
                doppler = np.random.normal(8.5, 1.8) # High radial velocity Doppler
                phase_var = np.random.normal(0.18, 0.04)
                path_loss = np.random.normal(98.0, 7.0)
                spectral_kurt = np.random.normal(6.1, 1.3)
                papr = np.random.normal(9.2, 1.4)
                # Visual features
                edge_density = np.random.normal(0.52, 0.06)
                aspect_ratio = np.random.normal(2.30, 0.28)
                spatial_entropy = np.random.normal(4.8, 0.32)
                cr_mean, cg_mean, cb_mean = np.random.normal(205, 10), np.random.normal(220, 10), np.random.normal(240, 8)
                cr_std, cg_std, cb_std = np.random.normal(30, 4), np.random.normal(28, 4), np.random.normal(25, 4)
                t_contrast = np.random.normal(0.54, 0.08)
                t_homo = np.random.normal(0.65, 0.06)
                t_energy = np.random.normal(0.51, 0.06)

            elif class_name == "Maritime_Vessel":
                rssi = np.random.normal(-68.0, 5.0)
                snr = np.random.normal(18.0, 4.0)
                freq = np.random.choice([1.56, 3.0, 9.3]) + np.random.normal(0, 0.01)
                bw = np.random.choice([15.0, 30.0])
                doppler = np.random.normal(0.8, 0.3) # Slow marine drift
                phase_var = np.random.normal(0.55, 0.09) # Sea surface multipath phase fluctuation
                path_loss = np.random.normal(86.0, 5.0)
                spectral_kurt = np.random.normal(4.4, 0.9)
                papr = np.random.normal(7.4, 1.1)
                # Visual features
                edge_density = np.random.normal(0.64, 0.07)
                aspect_ratio = np.random.normal(2.65, 0.30)
                spatial_entropy = np.random.normal(5.6, 0.38)
                cr_mean, cg_mean, cb_mean = np.random.normal(90, 15), np.random.normal(135, 15), np.random.normal(170, 15)
                cr_std, cg_std, cb_std = np.random.normal(38, 5), np.random.normal(42, 6), np.random.normal(46, 6)
                t_contrast = np.random.normal(0.68, 0.09)
                t_homo = np.random.normal(0.52, 0.07)
                t_energy = np.random.normal(0.39, 0.05)

            else: # Clutter_Noise
                rssi = np.random.normal(-92.0, 4.0)
                snr = np.random.normal(1.5, 2.5)
                freq = np.random.uniform(0.8, 6.0)
                bw = np.random.choice([10.0, 20.0, 40.0])
                doppler = np.random.normal(0.05, 0.2) # Zero mean noise
                phase_var = np.random.normal(0.95, 0.15) # High random phase noise
                path_loss = np.random.normal(115.0, 6.0)
                spectral_kurt = np.random.normal(1.2, 0.4)
                papr = np.random.normal(4.2, 0.8)
                # Visual features
                edge_density = np.random.normal(0.22, 0.05)
                aspect_ratio = np.random.normal(1.00, 0.15)
                spatial_entropy = np.random.normal(3.5, 0.45)
                cr_mean, cg_mean, cb_mean = np.random.normal(185, 10), np.random.normal(185, 10), np.random.normal(180, 10)
                cr_std, cg_std, cb_std = np.random.normal(18, 3), np.random.normal(18, 3), np.random.normal(16, 3)
                t_contrast = np.random.normal(0.25, 0.05)
                t_homo = np.random.normal(0.82, 0.04)
                t_energy = np.random.normal(0.72, 0.05)

            # Generate synthetic optical image
            img_path = generate_synthetic_image(class_name, sample_id, SAMPLE_IMAGES_DIR)

            record = {
                "sample_id": sample_id,
                "target_class": class_name,
                "class_label": class_idx,
                "image_path": str(img_path),
                # Radio features
                "rssi_dbm": round(float(rssi), 2),
                "snr_db": round(float(snr), 2),
                "carrier_freq_ghz": round(float(freq), 3),
                "bandwidth_mhz": round(float(bw), 1),
                "doppler_shift_khz": round(float(doppler), 3),
                "phase_variance_rad": round(float(max(0.01, phase_var)), 4),
                "path_loss_db": round(float(path_loss), 2),
                "spectral_kurtosis": round(float(spectral_kurt), 3),
                "papr_db": round(float(papr), 2),
                # Image features
                "edge_density": round(float(np.clip(edge_density, 0.0, 1.0)), 4),
                "aspect_ratio": round(float(max(0.2, aspect_ratio)), 3),
                "spatial_entropy": round(float(spatial_entropy), 3),
                "color_moment_r_mean": round(float(cr_mean), 2),
                "color_moment_g_mean": round(float(cg_mean), 2),
                "color_moment_b_mean": round(float(cb_mean), 2),
                "color_moment_r_std": round(float(cr_std), 2),
                "color_moment_g_std": round(float(cg_std), 2),
                "color_moment_b_std": round(float(cb_std), 2),
                "texture_contrast": round(float(np.clip(t_contrast, 0.0, 1.0)), 4),
                "texture_homogeneity": round(float(np.clip(t_homo, 0.0, 1.0)), 4),
                "texture_energy": round(float(np.clip(t_energy, 0.0, 1.0)), 4)
            }
            records.append(record)

    df = pd.DataFrame(records)
    logger.info(f"Generated {len(df)} synthetic multimodal samples across {len(TARGET_CLASSES)} classes.")
    return df
