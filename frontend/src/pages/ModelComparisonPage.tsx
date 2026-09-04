import React, { useState, useEffect } from 'react';
import { BarChart3, Award, Trophy, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ExperimentEntry } from '../types';
import { fetchModelComparison } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { ResearchNote } from '../components/ResearchNote';

export const ModelComparisonPage: React.FC = () => {
  const [comparisonTable, setComparisonTable] = useState<ExperimentEntry[]>([]);
  const [bestModelId, setBestModelId] = useState<string | null>(null);
  const [bestF1, setBestF1] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchModelComparison();
      setComparisonTable(res.comparison_table);
      setBestModelId(res.best_model_id);
      setBestF1(res.best_f1);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const bestModel = comparisonTable.find(m => m.experiment_id === bestModelId);

  return (
    <div className="page-body">
      {/* Overview Cards */}
      <div className="grid-4" style={{ marginBottom: '22px' }}>
        <MetricCard
          label="Top Performing Model"
          value={bestModel?.model_name || '---'}
          subtext={`Modality: ${bestModel?.modality || '---'}`}
          badge="Leader"
          badgeType="green"
          icon={<Trophy size={16} color="var(--forest-green)" />}
        />
        <MetricCard
          label="Peak F1-Score"
          value={bestF1 > 0 ? `${(bestF1 * 100).toFixed(1)}%` : '---'}
          subtext="Harmonic mean of precision & recall"
          badge="F1 Metric"
          badgeType="sage"
        />
        <MetricCard
          label="Evaluated Paradigms"
          value={comparisonTable.length}
          subtext="Radio, Optical, Fused, & Quantum"
          badge="Benchmarked"
          badgeType="terracotta"
        />
        <MetricCard
          label="Fastest Inference"
          value={
            comparisonTable.length > 0
              ? `${Math.min(...comparisonTable.map(m => m.inference_time_ms || 1.0)).toFixed(2)} ms`
              : '---'
          }
          subtext="Per-sample evaluation latency"
          badge="Latency"
          badgeType="mustard"
          icon={<Zap size={16} color="var(--warm-mustard-dark)" />}
        />
      </div>

      {/* Unified Benchmark Comparison Table */}
      <div className="card" style={{ marginBottom: '22px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <BarChart3 size={18} color="var(--forest-green)" />
              Multimodal Benchmark Matrix
            </div>
            <div className="card-subtitle">
              Unified cross-paradigm evaluation generated from live model executions
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadData} disabled={loading}>
            <RefreshCw size={13} />
            Refresh Benchmarks
          </button>
        </div>

        <div className="table-container">
          <table className="research-table">
            <thead>
              <tr>
                <th>Model Architecture</th>
                <th>Sensing Modality</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1-Score</th>
                <th>Latency (ms)</th>
                <th>Execution Mode</th>
              </tr>
            </thead>
            <tbody>
              {comparisonTable.map((model, idx) => {
                const isBest = model.experiment_id === bestModelId;
                const isQuantum = model.execution_mode.includes('Quantum');

                return (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: isBest ? 'rgba(40, 72, 58, 0.04)' : undefined,
                      fontWeight: isBest ? 600 : 400
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isBest && <Award size={15} color="var(--forest-green)" />}
                        <span style={{ color: isBest ? 'var(--forest-green)' : 'var(--text-primary)' }}>
                          {model.model_name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        model.modality.includes('Radio + Image') ? 'badge-terracotta' :
                        model.modality.includes('Radio') ? 'badge-green' : 'badge-sage'
                      }`}>
                        {model.modality}
                      </span>
                    </td>
                    <td className="code-mono">{(model.accuracy * 100).toFixed(1)}%</td>
                    <td className="code-mono">{(model.precision * 100).toFixed(1)}%</td>
                    <td className="code-mono">{(model.recall * 100).toFixed(1)}%</td>
                    <td className="code-mono" style={{ color: isBest ? 'var(--forest-green)' : undefined, fontWeight: 600 }}>
                      {(model.f1 * 100).toFixed(1)}%
                    </td>
                    <td className="code-mono">{model.inference_time_ms.toFixed(2)} ms</td>
                    <td>
                      <span className={`badge ${isQuantum ? 'badge-simulation' : 'badge-sage'}`}>
                        {model.execution_mode}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Comparative Metric Bars */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Accuracy Comparison</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comparisonTable.map((m, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '3px' }}>
                  <span>{m.model_name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {(m.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-card-muted)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${m.accuracy * 100}%`,
                      backgroundColor: m.experiment_id === bestModelId ? 'var(--forest-green)' : 'var(--muted-sage)',
                      borderRadius: 'var(--radius-pill)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">F1-Score Comparison</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comparisonTable.map((m, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '3px' }}>
                  <span>{m.model_name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {(m.f1 * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-card-muted)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${m.f1 * 100}%`,
                      backgroundColor: m.modality.includes('Quantum') ? 'var(--warm-mustard-dark)' :
                                       m.modality.includes('Early') ? 'var(--forest-green)' : 'var(--soft-terracotta)',
                      borderRadius: 'var(--radius-pill)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ResearchNote title="Benchmark Synthesis">
        Multimodal data fusion models consistently outperform single-modality baselines across accuracy, precision, and recall. Radio Doppler features resolve visual ambiguities during occlusion, while optical spatial moments provide fine geometric resolution.
      </ResearchNote>
    </div>
  );
};
