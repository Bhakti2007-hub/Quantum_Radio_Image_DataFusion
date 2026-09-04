import React, { useState, useEffect } from 'react';
import { Radio, BarChart2, Activity, Zap, Info } from 'lucide-react';
import { RadioAnalysisData } from '../types';
import { fetchRadioAnalysis } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { ScatterPlot } from '../components/ScatterPlot';
import { ResearchNote } from '../components/ResearchNote';

export const RadioAnalysisPage: React.FC = () => {
  const [data, setData] = useState<RadioAnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFeature, setSelectedFeature] = useState<string>('doppler_shift_khz');

  useEffect(() => {
    fetchRadioAnalysis()
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ color: 'var(--forest-green)' }}>Analyzing radio-frequency signal feature space...</div>
      </div>
    );
  }

  const dist = data.distributions[selectedFeature];

  return (
    <div className="page-body">
      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '22px' }}>
        <MetricCard
          label="Top RF Discriminator"
          value={data.feature_importance[0]?.feature.replace('_', ' ') || 'Doppler Shift'}
          subtext={`Importance: ${(data.feature_importance[0]?.importance * 100).toFixed(1)}%`}
          badge="Feature #1"
          badgeType="green"
          icon={<Zap size={15} color="var(--forest-green)" />}
        />
        <MetricCard
          label="Mean RSSI Level"
          value={`${data.distributions.rssi_dbm?.mean} dBm`}
          subtext={`Std: ±${data.distributions.rssi_dbm?.std} dBm`}
          badge="Signal Power"
          badgeType="sage"
          icon={<Radio size={15} color="var(--muted-sage)" />}
        />
        <MetricCard
          label="Mean SNR"
          value={`${data.distributions.snr_db?.mean} dB`}
          subtext={`Range: ${data.distributions.snr_db?.min} to ${data.distributions.snr_db?.max} dB`}
          badge="Channel"
          badgeType="terracotta"
          icon={<Activity size={15} color="var(--soft-terracotta)" />}
        />
        <MetricCard
          label="2D Manifold Variance"
          value={`${(data.pca_projection.total_variance * 100).toFixed(1)}%`}
          subtext="Preserved by first 2 Principal Components"
          badge="PCA Space"
          badgeType="mustard"
          icon={<BarChart2 size={15} color="var(--warm-mustard-dark)" />}
        />
      </div>

      {/* 2D PCA Radio Feature Space & Feature Distributions */}
      <div className="grid-2" style={{ marginBottom: '22px' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Radio Feature Space (2D PCA)</div>
              <div className="card-subtitle">Orthogonal projection of 9-dimensional RF signal observations</div>
            </div>
          </div>
          <ScatterPlot
            points={data.pca_projection.points}
            xLabel="PC1: Doppler Shift & Kinematics"
            yLabel="PC2: RSSI & Path Loss Variance"
            explainedVariance={data.pca_projection.explained_variance}
            title="RF Kinematic Clustering"
          />
        </div>

        {/* Feature Distribution Inspector */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">RF Parameter Distribution</div>
              <div className="card-subtitle">Empirical histogram and summary statistics</div>
            </div>
            <select
              className="form-select"
              value={selectedFeature}
              onChange={e => setSelectedFeature(e.target.value)}
              style={{ width: '180px', fontSize: '12px' }}
            >
              {data.features.map(f => (
                <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {dist && (
            <div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', fontSize: '12.5px' }}>
                <div><strong>Mean:</strong> {dist.mean}</div>
                <div><strong>Std:</strong> {dist.std}</div>
                <div><strong>Min:</strong> {dist.min}</div>
                <div><strong>Max:</strong> {dist.max}</div>
                <div><strong>Median:</strong> {dist.median}</div>
              </div>

              {/* Histogram Visualization */}
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '6px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                {dist.histogram.map((bin, i) => {
                  const maxCount = Math.max(...dist.histogram.map(h => h.count)) || 1;
                  const heightPct = (bin.count / maxCount) * 100;

                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                      title={`${bin.bin}: ${bin.count} samples`}
                    >
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>{bin.count}</div>
                      <div
                        style={{
                          width: '100%',
                          height: `${Math.max(4, heightPct)}%`,
                          backgroundColor: 'var(--forest-green)',
                          borderRadius: '3px 3px 0 0',
                          opacity: 0.85
                        }}
                      />
                      <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '35px' }}>
                        {bin.mid}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Correlation Heatmap & Importance */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">RF Feature Correlation Matrix</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '11px', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '6px', color: 'var(--text-muted)' }}></th>
                  {data.correlation_matrix.features.map((f, j) => (
                    <th key={j} style={{ padding: '6px 4px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                      {f.slice(0, 5)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.correlation_matrix.matrix.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '6px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {data.correlation_matrix.features[i].slice(0, 9)}
                    </td>
                    {row.map((val, j) => {
                      const isPositive = val >= 0;
                      const alpha = Math.abs(val);
                      const bg = isPositive
                        ? `rgba(40, 72, 58, ${alpha * 0.7})`
                        : `rgba(201, 130, 104, ${alpha * 0.7})`;
                      const textColor = alpha > 0.5 ? '#FFFFFF' : 'var(--text-primary)';

                      return (
                        <td
                          key={j}
                          style={{
                            padding: '6px 4px',
                            textAlign: 'center',
                            backgroundColor: bg,
                            color: textColor,
                            fontFamily: 'var(--font-mono)'
                          }}
                          title={`${data.correlation_matrix.features[i]} vs ${data.correlation_matrix.features[j]}: ${val}`}
                        >
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">RF Gini Feature Importance</div>
            <div className="card-subtitle">Relative contribution to target classification</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.feature_importance.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.feature.replace(/_/g, ' ')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--forest-green)', fontWeight: 600 }}>
                    {(item.importance * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ height: '7px', backgroundColor: 'var(--bg-card-muted)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.importance * 100}%`,
                      backgroundColor: idx === 0 ? 'var(--forest-green)' : 'var(--muted-sage)',
                      borderRadius: 'var(--radius-pill)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ResearchNote title="Radio Kinematic Observation">
        {data.research_note}
      </ResearchNote>
    </div>
  );
};
