import React, { useState, useEffect } from 'react';
import { Database, Upload, RefreshCw, Layers, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { DatasetSummary } from '../types';
import { fetchDatasetSummary, resetSyntheticDataset, uploadDatasetFile } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { ResearchNote } from '../components/ResearchNote';

interface DatasetExplorerPageProps {
  onDatasetUpdated?: (summary: DatasetSummary) => void;
}

export const DatasetExplorerPage: React.FC<DatasetExplorerPageProps> = ({ onDatasetUpdated }) => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDataTab, setActiveDataTab] = useState<'radio' | 'image' | 'fused'>('radio');
  const [sampleCount, setSampleCount] = useState<number>(500);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchDatasetSummary();
      setSummary(data);
      if (onDatasetUpdated) onDatasetUpdated(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await resetSyntheticDataset(sampleCount);
      setSummary(res);
      if (onDatasetUpdated) onDatasetUpdated(res);
      setUploadStatus(`Regenerated synthetic dataset with ${sampleCount} samples.`);
    } catch (e: any) {
      setUploadStatus(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_real_data', 'true');

    setLoading(true);
    try {
      const res = await uploadDatasetFile(formData);
      setSummary(res);
      if (onDatasetUpdated) onDatasetUpdated(res);
      setUploadStatus(`Successfully uploaded: ${file.name}`);
    } catch (e: any) {
      setUploadStatus(`Upload failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ color: 'var(--forest-green)', fontSize: '16px' }}>Loading dataset repository...</div>
      </div>
    );
  }

  const isSynthetic = summary?.dataset_type.includes('Synthetic');

  return (
    <div className="page-body">
      {/* Overview Cards */}
      <div className="grid-4" style={{ marginBottom: '22px' }}>
        <MetricCard
          label="Total Samples"
          value={summary?.total_samples || 0}
          subtext="Balanced multi-class distribution"
          badge={summary?.dataset_type.includes('Synthetic') ? 'Synthetic' : 'Real'}
          badgeType={isSynthetic ? 'mustard' : 'green'}
          icon={<Database size={15} color="var(--forest-green)" />}
        />
        <MetricCard
          label="RF Signal Features"
          value={summary?.radio_features_count || 9}
          subtext="RSSI, SNR, Doppler, PAPR, Phase"
          badge="Radio"
          badgeType="green"
        />
        <MetricCard
          label="Visual Descriptors"
          value={summary?.image_features_count || 12}
          subtext="Edge density, moments, entropy"
          badge="Optical"
          badgeType="sage"
        />
        <MetricCard
          label="Target Classes"
          value={summary?.classes.length || 5}
          subtext="Drone, Vehicle, Aircraft, Vessel, Clutter"
          badge="Classes"
          badgeType="terracotta"
        />
      </div>

      {/* Dataset Controls & Management */}
      <div className="card" style={{ marginBottom: '22px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <FileSpreadsheet size={18} color="var(--forest-green)" />
              Dataset Management &amp; Ingestion
            </div>
            <div className="card-subtitle">
              Current Source: <strong>{summary?.dataset_name}</strong> &bull; Status: <span className={`badge ${isSynthetic ? 'badge-mustard' : 'badge-green'}`}>{summary?.dataset_type}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Samples:</label>
              <select
                className="form-select"
                value={sampleCount}
                onChange={e => setSampleCount(Number(e.target.value))}
                style={{ width: '100px', padding: '4px 8px', fontSize: '12px' }}
              >
                <option value={250}>250</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleReset} disabled={loading}>
              <RefreshCw size={13} />
              Regenerate Synthetic Data
            </button>
            <label className="btn btn-primary btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
              <Upload size={13} />
              Upload Custom CSV
              <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {uploadStatus && (
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-panel-sage)', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', marginBottom: '14px', color: 'var(--forest-green)' }}>
            {uploadStatus}
          </div>
        )}

        {/* Missing Values & Class Breakdown */}
        <div className="grid-2">
          <div style={{ padding: '12px 16px', backgroundColor: '#FAFAF7', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--forest-green)', marginBottom: '6px' }}>
              Data Quality &amp; Missing Values
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="var(--forest-green)" />
              <span>Missing Values: <strong>{summary?.missing_values_count || 0}</strong> (Pristine clean tabular vectors)</span>
            </div>
          </div>

          <div style={{ padding: '12px 16px', backgroundColor: '#FAFAF7', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--forest-green)', marginBottom: '6px' }}>
              Class Distribution
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {summary && Object.entries(summary.class_distribution).map(([cls, count]) => (
                <span key={cls} className="badge badge-sage" style={{ fontSize: '11px' }}>
                  {cls.replace('_', ' ')}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Feature Tabs & Table */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '10px' }}>
          <div className="card-title">Dataset Feature Explorer</div>
          <div className="tabs-nav" style={{ margin: 0 }}>
            <button
              className={`tab-btn ${activeDataTab === 'radio' ? 'active' : ''}`}
              onClick={() => setActiveDataTab('radio')}
            >
              Radio Data ({summary?.radio_features_count} Features)
            </button>
            <button
              className={`tab-btn ${activeDataTab === 'image' ? 'active' : ''}`}
              onClick={() => setActiveDataTab('image')}
            >
              Image Data ({summary?.image_features_count} Features)
            </button>
            <button
              className={`tab-btn ${activeDataTab === 'fused' ? 'active' : ''}`}
              onClick={() => setActiveDataTab('fused')}
            >
              Fused Multimodal Data ({summary?.total_features_count} Features)
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="research-table">
            <thead>
              <tr>
                <th>Sample ID</th>
                <th>Target Class</th>
                {activeDataTab === 'radio' && (
                  <>
                    <th>RSSI (dBm)</th>
                    <th>SNR (dB)</th>
                    <th>Freq (GHz)</th>
                    <th>BW (MHz)</th>
                    <th>Doppler (kHz)</th>
                    <th>Phase Var</th>
                    <th>Path Loss</th>
                  </>
                )}
                {activeDataTab === 'image' && (
                  <>
                    <th>Edge Density</th>
                    <th>Aspect Ratio</th>
                    <th>Spatial Entropy</th>
                    <th>R Moment</th>
                    <th>G Moment</th>
                    <th>B Moment</th>
                    <th>Texture Energy</th>
                  </>
                )}
                {activeDataTab === 'fused' && (
                  <>
                    <th>RSSI</th>
                    <th>Doppler</th>
                    <th>Edge Dens</th>
                    <th>Aspect Ratio</th>
                    <th>Entropy</th>
                    <th>Kurtosis</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {summary?.sample_records.map((sample: any, idx: number) => (
                <tr key={idx}>
                  <td className="code-mono">#{sample.sample_id}</td>
                  <td>
                    <span className="badge badge-green">
                      {sample.target_class?.replace('_', ' ')}
                    </span>
                  </td>
                  {activeDataTab === 'radio' && (
                    <>
                      <td className="code-mono">{sample.rssi_dbm} dBm</td>
                      <td className="code-mono">{sample.snr_db} dB</td>
                      <td className="code-mono">{sample.carrier_freq_ghz} GHz</td>
                      <td className="code-mono">{sample.bandwidth_mhz} MHz</td>
                      <td className="code-mono">{sample.doppler_shift_khz} kHz</td>
                      <td className="code-mono">{sample.phase_variance_rad} rad</td>
                      <td className="code-mono">{sample.path_loss_db} dB</td>
                    </>
                  )}
                  {activeDataTab === 'image' && (
                    <>
                      <td className="code-mono">{sample.edge_density}</td>
                      <td className="code-mono">{sample.aspect_ratio}</td>
                      <td className="code-mono">{sample.spatial_entropy}</td>
                      <td className="code-mono">{sample.color_moment_r_mean}</td>
                      <td className="code-mono">{sample.color_moment_g_mean}</td>
                      <td className="code-mono">{sample.color_moment_b_mean}</td>
                      <td className="code-mono">{sample.texture_energy}</td>
                    </>
                  )}
                  {activeDataTab === 'fused' && (
                    <>
                      <td className="code-mono">{sample.rssi_dbm}</td>
                      <td className="code-mono">{sample.doppler_shift_khz}</td>
                      <td className="code-mono">{sample.edge_density}</td>
                      <td className="code-mono">{sample.aspect_ratio}</td>
                      <td className="code-mono">{sample.spatial_entropy}</td>
                      <td className="code-mono">{sample.spectral_kurtosis}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ResearchNote title="Modality Alignment Note">
        Radio-frequency channels provide signal-to-noise ratio, Doppler velocity signatures, and multi-path reflections. Optical images provide spatial boundary contours, color moments, and texture distributions. In this lab, both modalities are synchronized per target instance.
      </ResearchNote>
    </div>
  );
};
