import React, { useState, useEffect } from 'react';
import { GitMerge, Play, CheckCircle2, Sliders, Layers, BarChart2, Zap } from 'lucide-react';
import { ModelMetrics } from '../types';
import { trainFusionModels } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { ConfusionMatrix } from '../components/ConfusionMatrix';
import { ResearchNote } from '../components/ResearchNote';

export const DataFusionLabPage: React.FC = () => {
  const [strategy, setStrategy] = useState<string>('all');
  const [classifier, setClassifier] = useState<string>('random_forest');
  const [rfWeight, setRfWeight] = useState<number>(0.5);
  const [latentDim, setLatentDim] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Record<string, ModelMetrics> | null>(null);
  const [activeStrategyView, setActiveStrategyView] = useState<'early' | 'intermediate' | 'late'>('early');

  const TARGET_CLASSES = ['UAV Drone', 'Ground Vehicle', 'Civil Aircraft', 'Maritime Vessel', 'Clutter Noise'];

  const runTraining = async () => {
    setLoading(true);
    try {
      const res = await trainFusionModels({
        strategy,
        classifier,
        rf_weight: rfWeight,
        latent_dim: latentDim
      });
      setResults(res.results);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run initial benchmark on page mount
    runTraining();
  }, []);

  const activeModelMetrics =
    activeStrategyView === 'early' ? results?.early_fusion :
    activeStrategyView === 'intermediate' ? results?.intermediate_fusion :
    results?.late_fusion;

  return (
    <div className="page-body">
      {/* Interactive Controls Bar */}
      <div className="card" style={{ marginBottom: '22px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <GitMerge size={18} color="var(--forest-green)" />
              Multimodal Fusion Laboratory
            </div>
            <div className="card-subtitle">
              Benchmark Early (concatenation), Intermediate (latent embeddings), and Late (consensus) fusion
            </div>
          </div>
          <button className="btn btn-primary" onClick={runTraining} disabled={loading}>
            <Play size={14} />
            {loading ? 'Training Pipeline...' : 'Train & Benchmark Fusion Pipeline'}
          </button>
        </div>

        <div className="grid-4">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Fusion Strategy</label>
            <select
              className="form-select"
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
            >
              <option value="all">All Strategies (Compare All)</option>
              <option value="early">Early Fusion (Feature-Level)</option>
              <option value="intermediate">Intermediate Fusion (Embeddings)</option>
              <option value="late">Late Fusion (Decision-Level)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Base Classifier</label>
            <select
              className="form-select"
              value={classifier}
              onChange={e => setClassifier(e.target.value)}
            >
              <option value="random_forest">Random Forest (Ensemble)</option>
              <option value="svm">Support Vector Machine (RBF)</option>
              <option value="logistic_regression">Logistic Regression (Linear)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <div className="range-header">
              <label className="form-label">Late Fusion Weight (RF / Optics)</label>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{Math.round(rfWeight * 100)}% RF</span>
            </div>
            <input
              type="range"
              className="range-slider"
              min="0.1"
              max="0.9"
              step="0.05"
              value={rfWeight}
              onChange={e => setRfWeight(parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Intermediate Latent Dim (d)</label>
            <select
              className="form-select"
              value={latentDim}
              onChange={e => setLatentDim(Number(e.target.value))}
            >
              <option value={2}>2D per Modality (4D Total)</option>
              <option value={4}>4D per Modality (8D Total)</option>
              <option value={6}>6D per Modality (12D Total)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Multimodal Fusion Comparative Metrics */}
      <div className="grid-4" style={{ marginBottom: '22px' }}>
        <MetricCard
          label="Radio Baseline (RF)"
          value={results?.radio_baseline ? `${(results.radio_baseline.f1 * 100).toFixed(1)}%` : '---'}
          subtext={`Accuracy: ${results?.radio_baseline ? (results.radio_baseline.accuracy * 100).toFixed(1) : 0}%`}
          badge="Radio Only"
          badgeType="green"
        />
        <MetricCard
          label="Image Baseline (Optics)"
          value={results?.image_baseline ? `${(results.image_baseline.f1 * 100).toFixed(1)}%` : '---'}
          subtext={`Accuracy: ${results?.image_baseline ? (results.image_baseline.accuracy * 100).toFixed(1) : 0}%`}
          badge="Image Only"
          badgeType="sage"
        />
        <MetricCard
          label="Early Fusion F1"
          value={results?.early_fusion ? `${(results.early_fusion.f1 * 100).toFixed(1)}%` : '---'}
          subtext={`Latency: ${results?.early_fusion?.inference_time_ms} ms`}
          badge="Early Fused"
          badgeType="terracotta"
        />
        <MetricCard
          label="Intermediate Fusion F1"
          value={results?.intermediate_fusion ? `${(results.intermediate_fusion.f1 * 100).toFixed(1)}%` : '---'}
          subtext={`Latency: ${results?.intermediate_fusion?.inference_time_ms} ms`}
          badge="Latent Fused"
          badgeType="mustard"
        />
      </div>

      {/* Comparative Performance Chart & Confusion Matrix */}
      <div className="grid-2" style={{ marginBottom: '22px' }}>
        {/* Comparative Strategy Bars */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BarChart2 size={18} color="var(--forest-green)" />
              Modality Performance Comparison
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Radio Modality (RF Only)', metrics: results?.radio_baseline, color: 'var(--muted-sage)' },
              { label: 'Optical Modality (Image Only)', metrics: results?.image_baseline, color: 'var(--muted-sage-light)' },
              { label: 'Early Fusion [X_rf || X_img]', metrics: results?.early_fusion, color: 'var(--forest-green)', highlight: true },
              { label: 'Intermediate Fusion [H_rf || H_img]', metrics: results?.intermediate_fusion, color: 'var(--warm-mustard-dark)' },
              { label: 'Late Fusion (Soft Consensus)', metrics: results?.late_fusion, color: 'var(--soft-terracotta)' }
            ].map((item, idx) => {
              const f1 = item.metrics ? item.metrics.f1 * 100 : 0;
              const acc = item.metrics ? item.metrics.accuracy * 100 : 0;

              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: item.highlight ? 600 : 500, color: item.highlight ? 'var(--forest-green)' : 'var(--text-primary)' }}>
                      {item.label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>
                      F1: {f1.toFixed(1)}% | Acc: {acc.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ height: '9px', backgroundColor: 'var(--bg-card-muted)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${f1}%`,
                        backgroundColor: item.color,
                        borderRadius: 'var(--radius-pill)',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confusion Matrix Viewer with Strategy Tabs */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Empirical Confusion Matrix</div>
              <div className="card-subtitle">True targets vs predicted classification on test partition</div>
            </div>
            <div className="tabs-nav" style={{ margin: 0 }}>
              <button
                className={`tab-btn ${activeStrategyView === 'early' ? 'active' : ''}`}
                onClick={() => setActiveStrategyView('early')}
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                Early
              </button>
              <button
                className={`tab-btn ${activeStrategyView === 'intermediate' ? 'active' : ''}`}
                onClick={() => setActiveStrategyView('intermediate')}
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                Intermediate
              </button>
              <button
                className={`tab-btn ${activeStrategyView === 'late' ? 'active' : ''}`}
                onClick={() => setActiveStrategyView('late')}
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                Late
              </button>
            </div>
          </div>

          {activeModelMetrics && (
            <ConfusionMatrix
              matrix={activeModelMetrics.confusion_matrix}
              classes={TARGET_CLASSES}
              title={`${activeModelMetrics.model_name} (Accuracy: ${(activeModelMetrics.accuracy * 100).toFixed(1)}%)`}
            />
          )}
        </div>
      </div>

      <ResearchNote title="Fusion Architecture Finding">
        Early Fusion directly preserves fine-grained RF and visual correlations, resulting in robust target boundary discrimination. Intermediate fusion reduces dimensional noise via latent PCA projection, while Late Fusion provides soft probabilistic consensus when one sensor experiences localized interference.
      </ResearchNote>
    </div>
  );
};
