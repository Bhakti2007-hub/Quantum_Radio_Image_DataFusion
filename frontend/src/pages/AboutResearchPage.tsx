import React from 'react';
import { FileText, Layers, CheckCircle2, ShieldAlert, BookOpen, Cpu, Radio, Image as ImageIcon } from 'lucide-react';
import { ResearchNote } from '../components/ResearchNote';

export const AboutResearchPage: React.FC = () => {
  const METHODOLOGY_STEPS = [
    { step: 1, title: 'Data Acquisition', desc: 'Capture multi-channel RF baseband IQ packets and synchronized optical visual imagery across diverse target categories.' },
    { step: 2, title: 'Data Preprocessing', desc: 'Perform missing-value median imputation, outlier bounds verification, and stratified train/test partitioning.' },
    { step: 3, title: 'Radio Feature Extraction', desc: 'Compute RSSI, SNR, carrier frequency, bandwidth, micro-Doppler spread, phase variance, and spectral kurtosis.' },
    { step: 4, title: 'Image Feature Extraction', desc: 'Extract spatial edge density, bounding aspect ratio, intensity entropy, and RGB color moments.' },
    { step: 5, title: 'Feature Normalization', desc: 'Standardize features via Z-score scaling and map quantum parameters into the bounded [0, π] radian interval.' },
    { step: 6, title: 'Multimodal Feature Fusion', desc: 'Formulate Early (concatenation), Intermediate (latent PCA embeddings), and Late (probabilistic consensus) architectures.' },
    { step: 7, title: 'Classical ML Modeling', desc: 'Train Support Vector Classifiers (RBF), Random Forest ensembles, and Regularized Logistic Regression baselines.' },
    { step: 8, title: 'Quantum Feature Encoding', desc: 'Construct parameterized ZZ-feature map circuits U_Φ(x) projecting data into non-linear Hilbert quantum states.' },
    { step: 9, title: 'Quantum ML Modeling', desc: 'Evaluate Quantum Kernel Gram matrices K(x, x\') = |⟨Φ(x)|Φ(x\')⟩|² and fit Quantum Support Vector Classifiers (QSVC).' },
    { step: 10, title: 'Performance Evaluation', desc: 'Calculate exact Accuracy, Precision, Recall, F1-scores, ROC-AUC, and empirical confusion matrices on test partitions.' },
    { step: 11, title: 'Comparative Synthesis', desc: 'Perform statistical significance analysis comparing single-modality baselines against classical and quantum fusion.' }
  ];

  return (
    <div className="page-body">
      {/* 11-Step Methodology Visualizer */}
      <div className="card" style={{ marginBottom: '22px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <Layers size={18} color="var(--forest-green)" />
              11-Step Research Methodology Pipeline
            </div>
            <div className="card-subtitle">
              Systematic experimental design from raw signal acquisition to quantum-classical evaluation
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {METHODOLOGY_STEPS.map(m => (
            <div
              key={m.step}
              style={{
                padding: '14px 16px',
                backgroundColor: '#FAFAF7',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--forest-green)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  {m.step}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-green)' }}>
                  {m.title}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '4px' }}>
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mathematical Formulations */}
      <div className="grid-2" style={{ marginBottom: '22px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Multimodal Fusion Mathematics</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div>
              <strong style={{ color: 'var(--forest-green)' }}>A. Early Feature Concatenation:</strong>
              <div style={{ padding: '8px 12px', backgroundColor: '#FAFAF7', fontFamily: 'var(--font-mono)', borderRadius: '4px', margin: '4px 0', fontSize: '12px' }}>
                z_early = [ x_rf || x_img ] ∈ ℝ^(d_rf + d_img)
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--forest-green)' }}>B. Intermediate Latent Fusion:</strong>
              <div style={{ padding: '8px 12px', backgroundColor: '#FAFAF7', fontFamily: 'var(--font-mono)', borderRadius: '4px', margin: '4px 0', fontSize: '12px' }}>
                h_rf = W_rf · x_rf,  h_img = W_img · x_img<br/>
                z_inter = [ h_rf || h_img ] ∈ ℝ^(2·d)
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--forest-green)' }}>C. Late Probabilistic Decision Consensus:</strong>
              <div style={{ padding: '8px 12px', backgroundColor: '#FAFAF7', fontFamily: 'var(--font-mono)', borderRadius: '4px', margin: '4px 0', fontSize: '12px' }}>
                P_late(y|x) = α · P_rf(y|x_rf) + (1 - α) · P_img(y|x_img)
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Quantum Kernel Statevector Derivation</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div>
              <strong style={{ color: 'var(--warm-mustard-dark)' }}>1. Quantum Feature Map:</strong>
              <div style={{ padding: '8px 12px', backgroundColor: '#FAFAF7', fontFamily: 'var(--font-mono)', borderRadius: '4px', margin: '4px 0', fontSize: '12px' }}>
                |Φ(x)⟩ = U_Φ(x)|0⟩^(⊗n) = exp( i ∑ φ_j(x) Z_j + i ∑ φ_jk(x) Z_j Z_k ) H^(⊗n)|0⟩^(⊗n)
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--warm-mustard-dark)' }}>2. Quantum Kernel Inner Product:</strong>
              <div style={{ padding: '8px 12px', backgroundColor: '#FAFAF7', fontFamily: 'var(--font-mono)', borderRadius: '4px', margin: '4px 0', fontSize: '12px' }}>
                K(x_i, x_j) = |⟨Φ(x_i)|Φ(x_j)⟩|² = |⟨0| U_Φ^†(x_i) U_Φ(x_j) |0⟩|²
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--warm-mustard-dark)' }}>3. Quantum Support Vector Classifier:</strong>
              <div style={{ padding: '8px 12px', backgroundColor: '#FAFAF7', fontFamily: 'var(--font-mono)', borderRadius: '4px', margin: '4px 0', fontSize: '12px' }}>
                f(x) = sign( ∑ α_i y_i K(x_i, x) + b )
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Practical Applications & Limitations */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Real-World Sensing Applications</div>
          </div>
          <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <li><strong>Counter-UAS &amp; Drone Detection:</strong> Identifying rogue UAVs in low-visibility or urban canyons using joint micro-Doppler radar and infrared/optical cameras.</li>
            <li><strong>Smart Transportation &amp; Autonomous Vehicles:</strong> Enhancing situational awareness through complementary FMCW radar and automotive vision.</li>
            <li><strong>Maritime Vessel Tracking:</strong> Disentangling sea-clutter reflections from commercial ships and surface vessels in maritime straits.</li>
            <li><strong>Wireless Remote Sensing:</strong> High-reliability surveillance in adverse weather where optical sensors experience fog, rain, or thermal obscuration.</li>
          </ul>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Known Limitations &amp; Future Scope</div>
          </div>
          <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <li><strong>Simulation Constraints:</strong> Quantum statevector calculation scales exponentially with qubit count; current experiments are bounded to n &le; 8 qubits.</li>
            <li><strong>Modality Temporal Alignment:</strong> Assumes synchronized temporal sampling between RF receiver timestamps and optical camera shutter triggers.</li>
            <li><strong>Future NISQ Execution:</strong> Porting precomputed kernel evaluations to physical superconducting quantum processors (IBM Quantum via Qiskit Runtime).</li>
          </ul>
        </div>
      </div>

      <ResearchNote title="Citation & Academic Attribution">
        If utilizing this experimental platform in research papers or laboratory benchmarks, please cite: <em>&ldquo;Quantum ML for Radio–Image Data Fusion in Wireless Target Detection: A Multimodal Benchmarking Suite&rdquo;</em> (2026).
      </ResearchNote>
    </div>
  );
};
