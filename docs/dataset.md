# Dataset Specification & Modality Details

## 1. Modality Breakdown

### Radio-Frequency (RF) Features (9 Dimensions)
1. **RSSI (dBm)**: Received Signal Strength Indicator reflecting path attenuation and transmission power.
2. **SNR (dB)**: Signal-to-Noise Ratio indicating channel clarity and noise level.
3. **Carrier Frequency (GHz)**: Center RF carrier frequency (e.g. 2.4 GHz ISM, 5.8 GHz, 10 GHz X-band).
4. **Bandwidth (MHz)**: Channel occupancy bandwidth (10 MHz, 20 MHz, 40 MHz).
5. **Doppler Shift (kHz)**: Target velocity Doppler shift and micro-Doppler spread caused by rotating machinery or rotor blades.
6. **Phase Variance (rad)**: Packet-to-packet phase fluctuation induced by multipath channel fading.
7. **Path Loss (dB)**: Log-distance path attenuation estimate.
8. **Spectral Kurtosis**: Fourth standardized moment of the spectral amplitude distribution indicating non-Gaussian transients.
9. **PAPR (dB)**: Peak-to-Average Power Ratio of baseband signal envelopes.

### Optical Visual Features (12 Dimensions)
1. **Edge Density**: Ratio of high-gradient edge pixels to total area (Sobel filtering).
2. **Aspect Ratio**: Width-to-height ratio of the target's bounding contour.
3. **Spatial Entropy**: Shannon entropy of pixel intensity distributions.
4. **Color Moments**: Mean and standard deviation across Red, Green, and Blue color channels (6 features).
5. **Texture Contrast**: Local intensity variation and roughness metric.
6. **Texture Homogeneity**: Closeness of element distribution to diagonal.
7. **Texture Energy**: Sum of squared element probabilities.

## 2. Ingestion & Custom Dataset Adapter

The platform includes a robust dataset manager (`backend/data/dataset_loader.py`):
- Supports custom user-uploaded CSV files.
- Automatically maps `target_class`, `label`, or `class` columns.
- Tags datasets explicitly as **Synthetic Demonstration Dataset** or **Real Dataset**.
