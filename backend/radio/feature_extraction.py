"""Radio feature extraction and RF signal parameter utilities."""
import numpy as np
from typing import Dict, Any, List

def compute_rf_signal_features(
    rssi_dbm: float,
    snr_db: float,
    carrier_freq_ghz: float,
    bandwidth_mhz: float,
    doppler_shift_khz: float,
    phase_variance_rad: float = 0.35,
    path_loss_db: float = 80.0,
    spectral_kurtosis: float = 3.5,
    papr_db: float = 7.0
) -> Dict[str, float]:
    """Package and validate radio frequency features."""
    return {
        "rssi_dbm": float(rssi_dbm),
        "snr_db": float(snr_db),
        "carrier_freq_ghz": float(carrier_freq_ghz),
        "bandwidth_mhz": float(bandwidth_mhz),
        "doppler_shift_khz": float(doppler_shift_khz),
        "phase_variance_rad": float(phase_variance_rad),
        "path_loss_db": float(path_loss_db),
        "spectral_kurtosis": float(spectral_kurtosis),
        "papr_db": float(papr_db)
    }

def calculate_iq_statistics(iq_samples: np.ndarray) -> Dict[str, float]:
    """Calculate statistical RF metrics from complex baseband IQ timeseries samples."""
    i_vals = np.real(iq_samples)
    q_vals = np.imag(iq_samples)
    magnitude = np.abs(iq_samples)
    power = magnitude ** 2
    
    mean_power = np.mean(power)
    peak_power = np.max(power)
    papr = 10 * np.log10((peak_power / (mean_power + 1e-12)) + 1e-12)
    
    phase = np.angle(iq_samples)
    phase_var = np.var(phase)
    
    # Kurtosis
    m4 = np.mean((magnitude - np.mean(magnitude))**4)
    m2 = np.mean((magnitude - np.mean(magnitude))**2)
    kurt = m4 / (m2**2 + 1e-12)
    
    return {
        "papr_db": float(papr),
        "phase_variance_rad": float(phase_var),
        "spectral_kurtosis": float(kurt),
        "mean_power_db": float(10 * np.log10(mean_power + 1e-12))
    }
