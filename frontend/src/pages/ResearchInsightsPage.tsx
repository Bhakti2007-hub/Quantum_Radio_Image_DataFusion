import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, Cpu, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { ResearchInsightsResponse } from '../types';
import { fetchInsights } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { ResearchNote } from '../components/ResearchNote';

export const ResearchInsightsPage: React.FC = () => {
  const [data, setData] = useState<ResearchInsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await fetchInsights();
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <div className="page-body">
      {/* Dynamic Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '22px' }}>
        <MetricCard
          label="Multimodal Synergy Gain"
          value={data?.fusion_gain_f1 !== undefined ? `+${(data.fusion_gain_f1 * 100).toFixed(1)}%` : '---'}
          subtext="F1 gain over best single modality"
          badge="Synergy"
          badgeType="green"
          icon={<TrendingUp size={16} color="var(--forest-green)" />}
        />
        <MetricCard
          label="Best Standalone RF F1"
          value={data?.best_radio_f1 ? `${(data.best_radio_f1 * 100).toFixed(1)}%` : '---'}
          subtext="Radio Kinematic Baseline"
          badge="RF Modality"
          badgeType="sage"
        />
        <MetricCard
          label="Best Standalone Image F1"
          value={data?.best_image_f1 ? `${(data.best_image_f1 * 100).toFixed(1)}%` : '---'}
          subtext="Optical Spatial Baseline"
          badge="Optics"
          badgeType="terracotta"
        />
        <MetricCard
          label="Quantum Kernel F1"
          value={data?.best_quantum_f1 ? `${(data.best_quantum_f1 * 100).toFixed(1)}%` : '---'}
          subtext="ZZFeatureMap Statevector Model"
          badge="Simulation"
          badgeType="mustard"
          icon={<Cpu size={16} color="var(--warm-mustard-dark)" />}
        />
      </div>

      {/* Dynamic Insights Showcase */}
      <div className="card" style={{ marginBottom: '22px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <Lightbulb size={18} color="var(--warm-mustard-dark)" />
              Empirical Research Observations &amp; Synthesis
            </div>
            <div className="card-subtitle">
              Derived automatically from active benchmark metrics and mathematical evaluations
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadInsights} disabled={loading}>
            <RefreshCw size={13} />
            Recompute Synthesis
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {data?.insights.map((insight, idx) => {
            let badgeClass = 'badge-green';
            if (insight.type === 'quantum') badgeClass = 'badge-mustard';
            else if (insight.type === 'tradeoff') badgeClass = 'badge-sage';
            else if (insight.type === 'analysis') badgeClass = 'badge-terracotta';

            return (
              <div
                key={idx}
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#FAFAF7',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--forest-green)' }}>
                    {insight.title}
                  </div>
                  <span className={`badge ${badgeClass}`}>{insight.category}</span>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {insight.statement}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <ResearchNote title="Research Integrity & Objective Validation">
        These synthesized observations are generated dynamically by comparing the highest achieved test F1 scores. When radio and optical modalities exhibit orthogonal discriminatory power, joint fusion mathematically minimizes the Bayesian error bound.
      </ResearchNote>
    </div>
  );
};
