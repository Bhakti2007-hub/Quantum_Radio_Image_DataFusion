import React, { useState, useEffect } from 'react';
import { Cpu, Play, Layers, Activity, Zap, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { ModelMetrics, CircuitInfo } from '../types';
import { trainQuantumModel, fetchCircuitDetails } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { ConfusionMatrix } from '../components/ConfusionMatrix';
import { CircuitViewer } from '../components/CircuitViewer';
import { ResearchNote } from '../components/ResearchNote';

export const QuantumMLLabPage: React.FC = () => {
  const [nQubits, setNQubits] = useState<number>(4);
  const [reps, setReps] = useState<number>(2);
  const [featureMap, setFeatureMap] = useState<string>('ZZFeatureMap');
  const [cParam, setCParam] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [circuit, setCircuit] = useState<CircuitInfo | null>(null);

  const TARGET_CLASSES = ['UAV Drone', 'Ground Vehicle', 'Civil Aircraft', 'Maritime Vessel', 'Clutter Noise'];

  const runQuantumTraining = async () => {
    setLoading(true);
    try {
      const res = await trainQuantumModel({
        n_qubits: nQubits,
        reps,
        feature_map: featureMap,
        C: cParam
      });
      setMetrics(res.metrics);
      setCircuit(res.circuit_info);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runQuantumTraining();
  }, []);

  const sampleHeatmap = metrics?.quantum_metadata?.sample_kernel_heatmap;

  return (
    <div className="page-body">
      {/* Quantum Pipeline Flow Diagram */}
      <div className="card" style={{ marginBottom: '22px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <Cpu size={18} color="var(--warm-mustard-dark)" />
              Quantum Feature Encoding &amp; Kernel Pipeline
            </div>
            <div className="card-subtitle">
              High-dimensional multimodal features transformed into bounded quantum state rotations
            </div>
          </div>
          <span className="badge badge-simulation">Quantum Simulation Mode</span>
        </div>

        <div className="pipeline-flow">
          <div className="pipeline-node">
            <div className="pipeline-node-title">Raw RF &amp; Image Features</div>
            <div className="pipeline-node-sub">21 Tabular Dimensions</div>
          </div>

          <div className="pipeline-arrow">&rarr;</div>

          <div className="pipeline-node">
            <div className="pipeline-node-title">Feature Normalization</div>
            <div className="pipeline-node-sub">Bounded in [0, &pi;] Radians</div>
          </div>

          <div className="pipeline-arrow">&rarr;</div>

          <div className="pipeline-node active">
            <div className="pipeline-node-title">PCA Dimension Reduction</div>
            <div className="pipeline-node-sub">Projected to {nQubits} Qubit Basis</div>
          </div>

          <div className="pipeline-arrow">&rarr;</div>

          <div className="pipeline-node" style={{ borderColor: 'var(--warm-mustard)' }}>
            <div className="pipeline-node-title">ZZ-Feature Map Circuit</div>
            <div className="pipeline-node-sub">Hilbert Space State Mapping</div>
          </div>

          <div className="pipeline-arrow">&rarr;</div>

          <div className="pipeline-node" style={{ borderColor: 'var(--forest-green)', backgroundColor: 'var(--forest-green-subtle)' }}>
            <div className="pipeline-node-title">QSVC Kernel Classifier</div>
            <div className="pipeline-node-sub">Target Classification</div>
          </div>
        </div>
      </div>

      {/* Quantum Experiment Configuration Controls */}
      <div className="card" style={{ marginBottom: '22px' }}>
        <div className="card-header">
          <div className="card-title">Quantum ML Hyperparameters &amp; Simulation Engine</div>
          <button className="btn btn-mustard" onClick={runQuantumTraining} disabled={loading}>
            <Play size={14} />
            {loading ? 'Simulating Quantum Kernel...' : 'Train Quantum ML Model (QSVC)'}
          </button>
        </div>

        <div className="grid-4">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Number of Qubits (n)</label>
            <select
              className="form-select"
              value={nQubits}
              onChange={e => setNQubits(Number(e.target.value))}
            >
              <option value={2}>2 Qubits (Fast Demo)</option>
              <option value={4}>4 Qubits (Recommended)</option>
              <option value={6}>6 Qubits (High Precision)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Circuit Repetitions (r)</label>
            <select
              className="form-select"
              value={reps}
              onChange={e => setReps(Number(e.target.value))}
            >
              <option value={1}>1 Repetition (Shallower)</option>
              <option value={2}>2 Repetitions (Standard ZZ)</option>
              <option value={3}>3 Repetitions (Deep Entanglement)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Quantum Feature Map</label>
            <select
              className="form-select"
              value={featureMap}
              onChange={e => setFeatureMap(e.target.value)}
            >
              <option value="ZZFeatureMap">ZZFeatureMap (Non-linear Parity)</option>
              <option value="PauliFeatureMap">PauliFeatureMap (Z + ZZ)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">QSVC Regularization (C)</label>
            <select
              className="form-select"
              value={cParam}
              onChange={e => setCParam(parseFloat(e.target.value))}
            >
              <option value={0.5}>C = 0.5 (Wider Margin)</option>
              <option value={1.0}>C = 1.0 (Standard)</option>
              <option value={2.0}>C = 2.0 (Strict)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quantum Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '22px' }}>
        <MetricCard
          label="Quantum Model Accuracy"
          value={metrics ? `${(metrics.accuracy * 100).toFixed(1)}%` : '---'}
          subtext={`Test Partition (N = ${metrics?.sample_count || 125})`}
          badge="Accuracy"
          badgeType="mustard"
          icon={<Cpu size={15} color="var(--warm-mustard-dark)" />}
        />
        <MetricCard
          label="Quantum Macro F1"
          value={metrics ? `${(metrics.f1 * 100).toFixed(1)}%` : '---'}
          subtext={`Precision: ${metrics ? (metrics.precision * 100).toFixed(1) : 0}%`}
          badge="F1-Score"
          badgeType="green"
        />
        <MetricCard
          label="Quantum Kernel Time"
          value={metrics?.quantum_metadata ? `${metrics.quantum_metadata.kernel_computation_time_sec}s` : '---'}
          subtext="Gram Matrix Statevector Overlap"
          badge="Statevector"
          badgeType="sage"
        />
        <MetricCard
          label="Circuit Depth"
          value={circuit?.circuit_depth || 8}
          subtext={`Total Gates: ${circuit?.total_gates || 18}`}
          badge={`${nQubits} Qubits`}
          badgeType="terracotta"
        />
      </div>

      {/* Circuit Viewer Component */}
      <div style={{ marginBottom: '22px' }}>
        <CircuitViewer circuit={circuit} />
      </div>

      {/* Quantum Kernel Heatmap & Confusion Matrix */}
      <div className="grid-2">
        {/* Sample Kernel Matrix Heatmap */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Quantum Kernel Gram Matrix Heatmap (K_ij)</div>
              <div className="card-subtitle">
                Hilbert space inner product |⟨Φ(x_i)|Φ(x_j)⟩|² for training subset
              </div>
            </div>
          </div>

          {sampleHeatmap && sampleHeatmap.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: '10px', margin: '0 auto' }}>
                <tbody>
                  {sampleHeatmap.map((row, i) => (
                    <tr key={i}>
                      {row.map((val, j) => {
                        const alpha = Math.max(0.05, Math.min(1.0, val));
                        const bg = `rgba(198, 161, 91, ${alpha})`;
                        const textColor = alpha > 0.65 ? '#FFFFFF' : 'var(--text-primary)';

                        return (
                          <td
                            key={j}
                            style={{
                              width: '28px',
                              height: '28px',
                              textAlign: 'center',
                              backgroundColor: bg,
                              color: textColor,
                              border: '1px solid rgba(0,0,0,0.06)',
                              fontFamily: 'var(--font-mono)'
                            }}
                            title={`K[${i}, ${j}] = ${val.toFixed(3)}`}
                          >
                            {val.toFixed(1)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Values range from 0.0 (orthogonal quantum states) to 1.0 (identical quantum states).
              </div>
            </div>
          ) : (
            <div className="text-muted" style={{ padding: '20px' }}>Train model to generate kernel Gram matrix.</div>
          )}
        </div>

        {/* Quantum Confusion Matrix */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">QSVC Test Confusion Matrix</div>
              <div className="card-subtitle">Target classification across all 5 classes</div>
            </div>
          </div>

          {metrics && (
            <ConfusionMatrix
              matrix={metrics.confusion_matrix}
              classes={TARGET_CLASSES}
              title={`Quantum Target Classifier (F1: ${(metrics.f1 * 100).toFixed(1)}%)`}
            />
          )}
        </div>
      </div>

      <ResearchNote variant="warm" title="Quantum ML Research Integrity Statement">
        This experiment executes under <strong>Simulated Quantum Processing</strong> utilizing exact quantum statevector linear algebra. Quantum kernel methods project data into a $2^n$-dimensional Hilbert space without evaluating explicit state coordinates. No unsupported claims of NISQ hardware supremacy are made.
      </ResearchNote>
    </div>
  );
};
