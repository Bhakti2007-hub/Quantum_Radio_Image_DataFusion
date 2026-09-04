"""Configuration settings for Quantum ML for Radio-Image Data Fusion."""
import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent
WORKSPACE_DIR = BASE_DIR.parent
DATA_DIR = BASE_DIR / "data_storage"
DATA_DIR.mkdir(exist_ok=True)
SAMPLE_IMAGES_DIR = DATA_DIR / "sample_images"
SAMPLE_IMAGES_DIR.mkdir(exist_ok=True)
UPLOAD_DIR = DATA_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Target Classes
TARGET_CLASSES = [
    "UAV_Drone",
    "Ground_Vehicle",
    "Civil_Aircraft",
    "Maritime_Vessel",
    "Clutter_Noise"
]

# Radio Features Definition
RADIO_FEATURE_NAMES = [
    "rssi_dbm",           # Received Signal Strength Indicator (dBm)
    "snr_db",             # Signal-to-Noise Ratio (dB)
    "carrier_freq_ghz",   # Center Frequency (GHz)
    "bandwidth_mhz",      # Channel Bandwidth (MHz)
    "doppler_shift_khz",  # Doppler Shift / Spread (kHz)
    "phase_variance_rad", # Phase Variance across packets (rad)
    "path_loss_db",       # Estimated Path Loss (dB)
    "spectral_kurtosis",  # Spectral Non-Gaussianity metric
    "papr_db"             # Peak-to-Average Power Ratio (dB)
]

# Image Feature Dimensions
IMAGE_FEATURE_NAMES = [
    "edge_density",
    "aspect_ratio",
    "spatial_entropy",
    "color_moment_r_mean",
    "color_moment_g_mean",
    "color_moment_b_mean",
    "color_moment_r_std",
    "color_moment_g_std",
    "color_moment_b_std",
    "texture_contrast",
    "texture_homogeneity",
    "texture_energy"
]

# Quantum Configuration
DEFAULT_QUANTUM_QUBITS = 4      # 4 qubits for fast, accurate simulation
MAX_QUANTUM_QUBITS = 8
DEFAULT_QUANTUM_SHOTS = 1024
DEFAULT_FEATURE_MAP = "ZZFeatureMap" # ZZFeatureMap, PauliFeatureMap, AngleEncoding

# ML Settings
DEFAULT_TEST_SIZE = 0.25
RANDOM_SEED = 42

# Server config
PORT = int(os.environ.get("PORT", 5000))
HOST = os.environ.get("HOST", "127.0.0.1")
DEBUG = os.environ.get("DEBUG", "False").lower() in ("true", "1")
