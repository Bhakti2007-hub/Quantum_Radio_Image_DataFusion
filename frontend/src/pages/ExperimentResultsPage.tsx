import React, { useState, useEffect } from 'react';
import { History, Download, Trash2, Filter, RefreshCw, Eye } from 'lucide-react';
import { ExperimentEntry } from '../types';
import { fetchExperiments, clearExperiments } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { ConfusionMatrix } from '../components/ConfusionMatrix';
import { ResearchNote } from '../components/ResearchNote';

export const ExperimentResultsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<ExperimentEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterModality, setFilterModality] = useState<string>('all');
  const [selectedExp, setSelectedExp] = useState<ExperimentEntry | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchExperiments();
      setExperiments(res.experiments);
      if (res.experiments.length > 0 && !selectedExp) {
        setSelectedExp(res.experiments[res.experiments.length - 1]);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClear = async () => {
    if (window.confirm('Clear all recorded experiment logs?')) {
      await clearExperiments();
      setExperiments([]);
      setSelectedExp(null);
    }
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(experiments, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `research_experiments_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filtered = experiments.filter(e => {
    if (filterModality === 'all') return true;
    return e.modality.toLowerCase().includes(filterModality.toLowerCase());
  });

  const TARGET_CLASSES = ['UAV Drone', 'Ground Vehicle', 'Civil Aircraft', 'Maritime Vessel', 'Clutter Noise'];

  return (
    <div className="page-body">
      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '22px' }}>
        <MetricCard
          label="Logged Runs"
          value={experiments.length}
          subtext="Total tracked model executions"
          badge="Experiments"
          badgeType="green"
          icon={<History size={16} color="var(--forest-green)" />}
        />
        <MetricCard
          label="Highest Benchmark F1"
          value={
            experiments.length > 0
              ? `${(Math.max(...experiments.map(e => e.f1 || 0)) * 100).toFixed(1)}%`
              : '---'
          }
          subtext="Achieved across test splits"
          badge="Peak Score"
          badgeType="sage"
        />
        <MetricCard
          label="Average Latency"
          value={
            experiments.length > 0
              ? `${(experiments.reduce((a, b) => a + (b.inference_time_ms || 0), 0) / experiments.length).toFixed(2)} ms`
              : '---'
          }
          subtext="Inference latency per target"
          badge="Inference"
          badgeType="mustard"
        />
        <MetricCard
          label="Execution Modes"
          value="Classical & QML"
          subtext="CPU / Exact Statevector Simulator"
          badge="Simulated"
          badgeType="terracotta"
        />
      </div>

      {/* Experiment Controls & Log Table */}
      <div className="card" style={{ marginBottom: '22px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Research Experiment Registry</div>
            <div className="card-subtitle">Empirical logs with reproducible parameters and confusion matrices</div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              className="form-select"
              value={filterModality}
              onChange={e => setFilterModality(e.target.value)}
              style={{ width: '160px', fontSize: '12px' }}
            >
              <option value="all">All Modalities</option>
              <option value="radio">Radio Only</option>
              <option value="image">Image Only</option>
              <option value="early">Early Fusion</option>
              <option value="intermediate">Intermediate Fusion</option>
              <option value="late">Late Fusion</option>
              <option value="quantum">Quantum Fusion</option>
            </select>

            <button className="btn btn-secondary btn-sm" onClick={exportJSON} disabled={experiments.length === 0}>
              <Download size={13} />
              Export JSON
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleClear} disabled={experiments.length === 0}>
              <Trash2 size={13} />
              Clear
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="research-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Timestamp</th>
                <th>Model Architecture</th>
                <th>Modality</th>
                <th>Accuracy</th>
                <th>F1-Score</th>
                <th>Train Time</th>
                <th>Latency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp, idx) => {
                const isSelected = selectedExp?.experiment_id === exp.experiment_id;

                return (
                  <tr
                    key={idx}
                    style={{ backgroundColor: isSelected ? 'rgba(40, 72, 58, 0.05)' : undefined }}
                  >
                    <td className="code-mono">{exp.experiment_id}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{exp.timestamp}</td>
                    <td style={{ fontWeight: 500 }}>{exp.model_name}</td>
                    <td>
                      <span className={`badge ${
                        exp.modality.includes('Quantum') ? 'badge-mustard' :
                        exp.modality.includes('Early') ? 'badge-green' :
                        exp.modality.includes('Late') ? 'badge-terracotta' : 'badge-sage'
                      }`}>
                        {exp.modality}
                      </span>
                    </td>
                    <td className="code-mono">{(exp.accuracy * 100).toFixed(1)}%</td>
                    <td className="code-mono" style={{ fontWeight: 600, color: 'var(--forest-green)' }}>
                      {(exp.f1 * 100).toFixed(1)}%
                    </td>
                    <td className="code-mono">{exp.train_time_sec.toFixed(3)}s</td>
                    <td className="code-mono">{exp.inference_time_ms.toFixed(2)} ms</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedExp(exp)}
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                      >
                        <Eye size={12} />
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Experiment Detailed Breakdown */}
      {selectedExp && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                Detailed Inspection: {selectedExp.experiment_id} ({selectedExp.model_name})
              </div>
              <div className="card-subtitle">
                Executed on {selectedExp.timestamp} &bull; Mode: <strong>{selectedExp.execution_mode}</strong>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-green)', marginBottom: '8px' }}>
                Per-Class Precision, Recall &amp; F1
              </div>
              <div className="table-container">
                <table className="research-table" style={{ fontSize: '12.5px' }}>
                  <thead>
                    <tr>
                      <th>Class Name</th>
                      <th>Precision</th>
                      <th>Recall</th>
                      <th>F1-Score</th>
                      <th>Support</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedExp.per_class && Object.entries(selectedExp.per_class).map(([cls, m]: [string, any]) => (
                      <tr key={cls}>
                        <td style={{ fontWeight: 500 }}>{cls.replace('_', ' ')}</td>
                        <td className="code-mono">{(m.precision * 100).toFixed(1)}%</td>
                        <td className="code-mono">{(m.recall * 100).toFixed(1)}%</td>
                        <td className="code-mono" style={{ fontWeight: 600 }}>{(m.f1 * 100).toFixed(1)}%</td>
                        <td className="code-mono">{m.support}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <ConfusionMatrix
                matrix={selectedExp.confusion_matrix}
                classes={TARGET_CLASSES}
                title={`Confusion Matrix (${selectedExp.model_name})`}
              />
            </div>
          </div>
        </div>
      )}

      <ResearchNote title="Experiment Provenance">
        Each experiment record is appended immediately following model training on the test partition. Experiments preserve full hyperparameter configurations, enabling seamless tracking and academic auditability.
      </ResearchNote>
    </div>
  );
};
