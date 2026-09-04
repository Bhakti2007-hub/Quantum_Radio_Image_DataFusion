import React, { useState } from 'react';
import { Crosshair, Play, Radio, Image as ImageIcon, Cpu, GitMerge, CheckCircle2, AlertTriangle, Sparkles, Upload } from 'lucide-react';
import { PredictionResponse } from '../types';
import { executeLivePrediction, analyzeUploadedImage } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { ResearchNote } from '../components/ResearchNote';

export const TargetDetectionPage: React.FC = () => {
  const [rfFeatures, setRfFeatures] = useState<Record<string, number>>({
    rssi_dbm: -62.0,
    snr_db: 16.5,
    carrier_freq_ghz: 2.4,
    bandwidth_mhz: 20.0,
    doppler_shift_khz: 4.8,
    phase_variance_rad: 0.42,
    path_loss_db: 82.0,
    spectral_kurtosis: 5.2,
    papr_db: 8.5
  });

  const [imgFeatures, setImgFeatures] = useState<Record<string, number>>({
    edge_density: 0.68,
    aspect_ratio: 1.05,
    spatial_entropy: 5.8,
    color_moment_r_mean: 160.0,
    color_moment_g_mean: 175.0,
    color_moment_b_mean: 190.0,
    color_moment_r_std: 42.0,
    color_moment_g_std: 45.0,
    color_moment_b_std: 48.0,
    texture_contrast: 0.72,
    texture_homogeneity: 0.48,
    texture_energy: 0.35
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const TARGET_PRESETS: Record<string, { rf: Record<string, number>; img: Record<string, number> }> = {
    'UAV Drone': {
      rf: { rssi_dbm: -62.0, snr_db: 16.5, carrier_freq_ghz: 2.4, bandwidth_mhz: 20.0, doppler_shift_khz: 4.8, phase_variance_rad: 0.42, path_loss_db: 82.0, spectral_kurtosis: 5.2, papr_db: 8.5 },
      img: { edge_density: 0.68, aspect_ratio: 1.02, spatial_entropy: 5.8, color_moment_r_mean: 160, color_moment_g_mean: 175, color_moment_b_mean: 190, color_moment_r_std: 42, color_moment_g_std: 45, color_moment_b_std: 48, texture_contrast: 0.72, texture_homogeneity: 0.48, texture_energy: 0.35 }
    },
    'Ground Vehicle': {
      rf: { rssi_dbm: -54.0, snr_db: 21.0, carrier_freq_ghz: 1.8, bandwidth_mhz: 10.0, doppler_shift_khz: 1.2, phase_variance_rad: 0.28, path_loss_db: 74.0, spectral_kurtosis: 3.8, papr_db: 6.8 },
      img: { edge_density: 0.58, aspect_ratio: 1.85, spatial_entropy: 5.2, color_moment_r_mean: 135, color_moment_g_mean: 140, color_moment_b_mean: 130, color_moment_r_std: 35, color_moment_g_std: 36, color_moment_b_std: 32, texture_contrast: 0.62, texture_homogeneity: 0.55, texture_energy: 0.42 }
    },
    'Civil Aircraft': {
      rf: { rssi_dbm: -75.0, snr_db: 14.0, carrier_freq_ghz: 2.7, bandwidth_mhz: 25.0, doppler_shift_khz: 8.5, phase_variance_rad: 0.18, path_loss_db: 98.0, spectral_kurtosis: 6.1, papr_db: 9.2 },
      img: { edge_density: 0.52, aspect_ratio: 2.30, spatial_entropy: 4.8, color_moment_r_mean: 205, color_moment_g_mean: 220, color_moment_b_mean: 240, color_moment_r_std: 30, color_moment_g_std: 28, color_moment_b_std: 25, texture_contrast: 0.54, texture_homogeneity: 0.65, texture_energy: 0.51 }
    },
    'Maritime Vessel': {
      rf: { rssi_dbm: -68.0, snr_db: 18.0, carrier_freq_ghz: 3.0, bandwidth_mhz: 15.0, doppler_shift_khz: 0.8, phase_variance_rad: 0.55, path_loss_db: 86.0, spectral_kurtosis: 4.4, papr_db: 7.4 },
      img: { edge_density: 0.64, aspect_ratio: 2.65, spatial_entropy: 5.6, color_moment_r_mean: 90, color_moment_g_mean: 135, color_moment_b_mean: 170, color_moment_r_std: 38, color_moment_g_std: 42, color_moment_b_std: 46, texture_contrast: 0.68, texture_homogeneity: 0.52, texture_energy: 0.39 }
    },
    'Clutter Noise': {
      rf: { rssi_dbm: -92.0, snr_db: 1.5, carrier_freq_ghz: 2.4, bandwidth_mhz: 20.0, doppler_shift_khz: 0.05, phase_variance_rad: 0.95, path_loss_db: 115.0, spectral_kurtosis: 1.2, papr_db: 4.2 },
      img: { edge_density: 0.22, aspect_ratio: 1.00, spatial_entropy: 3.5, color_moment_r_mean: 185, color_moment_g_mean: 185, color_moment_b_mean: 180, color_moment_r_std: 18, color_moment_g_std: 18, color_moment_b_std: 16, texture_contrast: 0.25, texture_homogeneity: 0.82, texture_energy: 0.72 }
    }
  };

  const applyPreset = (presetName: string) => {
    const p = TARGET_PRESETS[presetName];
    if (p) {
      setRfFeatures({ ...p.rf });
      setImgFeatures({ ...p.img });
    }
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setPreviewImage(URL.createObjectURL(file));

    try {
      const res = await analyzeUploadedImage(formData);
      setImgFeatures(res.features);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDetect = async () => {
    setLoading(true);
    try {
      const res = await executeLivePrediction({
        radio_features: rfFeatures,
        image_features: imgFeatures
      });
      setResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      {/* Preset Quick Selectors */}
      <div className="card" style={{ marginBottom: '20px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-green)' }}>
            Preset Signal Profiles:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.keys(TARGET_PRESETS).map(name => (
              <button
                key={name}
                className="btn btn-secondary btn-sm"
                onClick={() => applyPreset(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Sliders & Image Extractor Console */}
      <div className="grid-2" style={{ marginBottom: '22px' }}>
        {/* Radio Input Parameters */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Radio size={17} color="var(--forest-green)" />
              Radio Signal Parameters
            </div>
            <span className="badge badge-green">RF Channel</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="range-slider-group">
              <div className="range-header">
                <span>Doppler Shift / Spread (kHz)</span>
                <span className="code-mono">{rfFeatures.doppler_shift_khz} kHz</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="0.0"
                max="12.0"
                step="0.1"
                value={rfFeatures.doppler_shift_khz}
                onChange={e => setRfFeatures({ ...rfFeatures, doppler_shift_khz: parseFloat(e.target.value) })}
              />
            </div>

            <div className="range-slider-group">
              <div className="range-header">
                <span>RSSI (dBm)</span>
                <span className="code-mono">{rfFeatures.rssi_dbm} dBm</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="-100.0"
                max="-40.0"
                step="1.0"
                value={rfFeatures.rssi_dbm}
                onChange={e => setRfFeatures({ ...rfFeatures, rssi_dbm: parseFloat(e.target.value) })}
              />
            </div>

            <div className="range-slider-group">
              <div className="range-header">
                <span>Signal-to-Noise Ratio (SNR dB)</span>
                <span className="code-mono">{rfFeatures.snr_db} dB</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="-5.0"
                max="30.0"
                step="0.5"
                value={rfFeatures.snr_db}
                onChange={e => setRfFeatures({ ...rfFeatures, snr_db: parseFloat(e.target.value) })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Carrier Freq (GHz)</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.1"
                  value={rfFeatures.carrier_freq_ghz}
                  onChange={e => setRfFeatures({ ...rfFeatures, carrier_freq_ghz: parseFloat(e.target.value) })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Spectral Kurtosis</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.1"
                  value={rfFeatures.spectral_kurtosis}
                  onChange={e => setRfFeatures({ ...rfFeatures, spectral_kurtosis: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Optical Image Input & Descriptors */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ImageIcon size={17} color="var(--muted-sage)" />
              Optical Target Imagery &amp; Descriptors
            </div>
            <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
              <Upload size={13} />
              Upload Image
              <input type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="range-slider-group">
              <div className="range-header">
                <span>Aspect Ratio (Width / Height)</span>
                <span className="code-mono">{imgFeatures.aspect_ratio}</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="0.5"
                max="3.5"
                step="0.05"
                value={imgFeatures.aspect_ratio}
                onChange={e => setImgFeatures({ ...imgFeatures, aspect_ratio: parseFloat(e.target.value) })}
              />
            </div>

            <div className="range-slider-group">
              <div className="range-header">
                <span>Edge Density (Spatial Contour)</span>
                <span className="code-mono">{imgFeatures.edge_density}</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="0.05"
                max="0.95"
                step="0.01"
                value={imgFeatures.edge_density}
                onChange={e => setImgFeatures({ ...imgFeatures, edge_density: parseFloat(e.target.value) })}
              />
            </div>

            <div className="range-slider-group">
              <div className="range-header">
                <span>Spatial Entropy (bits)</span>
                <span className="code-mono">{imgFeatures.spatial_entropy}</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="2.0"
                max="7.0"
                step="0.1"
                value={imgFeatures.spatial_entropy}
                onChange={e => setImgFeatures({ ...imgFeatures, spatial_entropy: parseFloat(e.target.value) })}
              />
            </div>

            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px 20px', fontSize: '15px' }}
                onClick={handleDetect}
                disabled={loading}
              >
                <Crosshair size={18} />
                {loading ? 'Evaluating Multimodal Models...' : 'Detect Wireless Target'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detection Results Showcase */}
      {result && (
        <div style={{ marginBottom: '22px' }}>
          {/* Primary Consensus Verdict Card */}
          <div className="card" style={{ padding: '24px 28px', backgroundColor: '#FAF8F3', borderColor: 'var(--forest-green)', marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span className="badge badge-green" style={{ marginBottom: '6px' }}>Primary Multimodal Verdict</span>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--forest-green)' }}>
                  Detected Target: {result.detection_result.target_class.replace('_', ' ')}
                </h2>
                <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                  Classification Confidence: <strong>{result.detection_result.confidence_percent}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span className="badge badge-sage">
                  <CheckCircle2 size={13} />
                  Multimodal Consensus
                </span>
                <span className="badge badge-simulation">
                  Quantum State Validated
                </span>
              </div>
            </div>
          </div>

          {/* 4-Paradigm Side-by-Side Model Comparison */}
          <div className="grid-4">
            {/* 1. Radio Only */}
            <div className="card">
              <div className="card-header">
                <div className="card-title" style={{ fontSize: '13.5px' }}>
                  <Radio size={15} color="var(--forest-green)" />
                  Radio-Only Model
                </div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--forest-green)', marginBottom: '4px' }}>
                {result.modality_comparisons.radio_only.predicted_class.replace('_', ' ')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Confidence: {(result.modality_comparisons.radio_only.confidence * 100).toFixed(1)}%
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--bg-card-muted)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${result.modality_comparisons.radio_only.confidence * 100}%`, backgroundColor: 'var(--forest-green)' }} />
              </div>
            </div>

            {/* 2. Image Only */}
            <div className="card">
              <div className="card-header">
                <div className="card-title" style={{ fontSize: '13.5px' }}>
                  <ImageIcon size={15} color="var(--muted-sage)" />
                  Image-Only Model
                </div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--forest-green)', marginBottom: '4px' }}>
                {result.modality_comparisons.image_only.predicted_class.replace('_', ' ')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Confidence: {(result.modality_comparisons.image_only.confidence * 100).toFixed(1)}%
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--bg-card-muted)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${result.modality_comparisons.image_only.confidence * 100}%`, backgroundColor: 'var(--muted-sage)' }} />
              </div>
            </div>

            {/* 3. Classical Fusion */}
            <div className="card" style={{ borderColor: 'var(--soft-terracotta)' }}>
              <div className="card-header">
                <div className="card-title" style={{ fontSize: '13.5px' }}>
                  <GitMerge size={15} color="var(--soft-terracotta-dark)" />
                  Classical Fusion
                </div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--soft-terracotta-dark)', marginBottom: '4px' }}>
                {result.modality_comparisons.classical_fusion.predicted_class.replace('_', ' ')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Confidence: {(result.modality_comparisons.classical_fusion.confidence * 100).toFixed(1)}%
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--bg-card-muted)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${result.modality_comparisons.classical_fusion.confidence * 100}%`, backgroundColor: 'var(--soft-terracotta)' }} />
              </div>
            </div>

            {/* 4. Quantum ML Fusion */}
            <div className="card" style={{ borderColor: 'var(--warm-mustard)' }}>
              <div className="card-header">
                <div className="card-title" style={{ fontSize: '13.5px' }}>
                  <Cpu size={15} color="var(--warm-mustard-dark)" />
                  Quantum ML (QSVC)
                </div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--warm-mustard-dark)', marginBottom: '4px' }}>
                {result.modality_comparisons.quantum_fusion.predicted_class.replace('_', ' ')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Confidence: {(result.modality_comparisons.quantum_fusion.confidence * 100).toFixed(1)}%
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--bg-card-muted)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${result.modality_comparisons.quantum_fusion.confidence * 100}%`, backgroundColor: 'var(--warm-mustard-dark)' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <ResearchNote title="Live Inference Methodology">
        When target detection is executed, raw radio parameters and optical descriptors undergo joint normalization, PCA dimensionality projection, and simultaneous classification across classical and quantum statevector models.
      </ResearchNote>
    </div>
  );
};
