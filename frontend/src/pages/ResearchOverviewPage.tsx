import React from 'react';
import { Radio, Image as ImageIcon, GitMerge, Cpu, ArrowRight, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { ResearchNote } from '../components/ResearchNote';

interface ResearchOverviewPageProps {
  onNavigate: (tab: string) => void;
  datasetStats?: any;
}

export const ResearchOverviewPage: React.FC<ResearchOverviewPageProps> = ({ onNavigate, datasetStats }) => {
  return (
    <div className="page-body">
      {/* Hero Section */}
      <div className="card" style={{ padding: '32px 36px', marginBottom: '24px', backgroundColor: '#FCFAF6' }}>
        <div style={{ display: 'inline-block', marginBottom: '8px' }}>
          <span className="badge badge-sage">Research Investigation</span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 600, color: 'var(--forest-green)', marginBottom: '10px' }}>
          Quantum ML for Radio–Image Data Fusion
        </h1>
        <h2 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--soft-terracotta-dark)', marginBottom: '16px' }}>
          Multimodal learning for accurate target detection in wireless environments
        </h2>
        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', maxWidth: '920px', lineHeight: 1.7, marginBottom: '20px' }}>
          &ldquo;This research investigates how complementary information from radio-frequency signals and visual imagery can be combined using classical and quantum machine learning techniques for improved wireless target detection.&rdquo;
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('fusion')}>
            <GitMerge size={16} />
            Launch Data Fusion Lab
          </button>
          <button className="btn btn-mustard" onClick={() => onNavigate('quantum')}>
            <Cpu size={16} />
            Explore Quantum ML Lab
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('detection')}>
            Interactive Target Detection
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Four Research Metrics */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <MetricCard
          label="Radio Modality"
          value="9 Features"
          subtext="RSSI, SNR, Doppler, PAPR, Kurtosis"
          badge="Kinematics"
          badgeType="green"
          icon={<Radio size={16} color="var(--forest-green)" />}
        />
        <MetricCard
          label="Image Modality"
          value="12 Features"
          subtext="Spatial entropy, edge density, moments"
          badge="Optics"
          badgeType="sage"
          icon={<ImageIcon size={16} color="var(--muted-sage)" />}
        />
        <MetricCard
          label="Fusion Models"
          value="3 Strategies"
          subtext="Early, Intermediate, Late Consensus"
          badge="Multimodal"
          badgeType="terracotta"
          icon={<GitMerge size={16} color="var(--soft-terracotta)" />}
        />
        <MetricCard
          label="Quantum ML"
          value="4–8 Qubits"
          subtext="ZZFeatureMap + QSVC Classifier"
          badge="Simulation"
          badgeType="mustard"
          icon={<Cpu size={16} color="var(--warm-mustard-dark)" />}
        />
      </div>

      {/* Visual Workflow Flowchart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Multimodal Target Detection Workflow</div>
            <div className="card-subtitle">End-to-end signal processing, feature fusion, and classification pipeline</div>
          </div>
        </div>

        <div className="pipeline-flow">
          <div className="pipeline-node">
            <Radio size={20} color="var(--forest-green)" style={{ margin: '0 auto 6px' }} />
            <div className="pipeline-node-title">Radio Signal (RF)</div>
            <div className="pipeline-node-sub">Micro-Doppler &amp; Channel IQ</div>
          </div>

          <div className="pipeline-arrow">&rarr;</div>

          <div className="pipeline-node">
            <ImageIcon size={20} color="var(--muted-sage)" style={{ margin: '0 auto 6px' }} />
            <div className="pipeline-node-title">Optical Image</div>
            <div className="pipeline-node-sub">Spatial &amp; Texture Moments</div>
          </div>

          <div className="pipeline-arrow">&rarr;</div>

          <div className="pipeline-node active">
            <GitMerge size={20} color="var(--forest-green)" style={{ margin: '0 auto 6px' }} />
            <div className="pipeline-node-title">Multimodal Fusion</div>
            <div className="pipeline-node-sub">Early / Intermediate / Late</div>
          </div>

          <div className="pipeline-arrow">&rarr;</div>

          <div className="pipeline-node" style={{ borderColor: 'var(--warm-mustard)' }}>
            <Cpu size={20} color="var(--warm-mustard-dark)" style={{ margin: '0 auto 6px' }} />
            <div className="pipeline-node-title">Classical &amp; Quantum ML</div>
            <div className="pipeline-node-sub">SVM / RF &bull; QSVC Kernel</div>
          </div>

          <div className="pipeline-arrow">&rarr;</div>

          <div className="pipeline-node" style={{ borderColor: 'var(--soft-terracotta)', backgroundColor: 'var(--soft-terracotta-subtle)' }}>
            <CheckCircle2 size={20} color="var(--soft-terracotta-dark)" style={{ margin: '0 auto 6px' }} />
            <div className="pipeline-node-title">Target Detection</div>
            <div className="pipeline-node-sub">Drone &bull; Vehicle &bull; Aircraft &bull; Vessel</div>
          </div>
        </div>
      </div>

      {/* Research Questions & Objectives */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Core Research Questions</div>
          </div>
          <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
            <li>
              <strong>1. Modality Complementarity:</strong> Does combining RF electromagnetic Doppler with optical contours yield higher detection F1 than either sensor alone in noisy clutter?
            </li>
            <li>
              <strong>2. Optimal Fusion Architecture:</strong> Is Feature Concatenation (Early), Latent Embedding (Intermediate), or Decision Consensus (Late) most resilient to RF fading?
            </li>
            <li>
              <strong>3. Quantum Feasibility:</strong> Can a parameterized $ZZ$-feature map quantum kernel separate fused multimodal representations on a low-qubit quantum state simulator?
            </li>
          </ul>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Scientific Target Classes</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--forest-green-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(40, 72, 58, 0.15)' }}>
              <strong>UAV_Drone:</strong> High micro-Doppler spread from rotors (4.8 kHz), distinct square aspect ratio, compact optical signature.
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--muted-sage-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(125, 154, 134, 0.2)' }}>
              <strong>Ground_Vehicle:</strong> Terrestrial low Doppler (1.2 kHz), elongated spatial aspect ratio, high ground multipath loss.
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--warm-mustard-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(198, 161, 91, 0.25)' }}>
              <strong>Civil_Aircraft:</strong> High velocity Doppler shift (8.5 kHz), line-of-sight high SNR, streamlined aerodynamic profile.
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--soft-terracotta-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(201, 130, 104, 0.2)' }}>
              <strong>Maritime_Vessel &amp; Clutter:</strong> Oceanic multipath phase fluctuations, sea texture contrast, and ambient clutter noise.
            </div>
          </div>
        </div>
      </div>

      <ResearchNote title="Research Integrity & Experimental Protocol">
        All performance numbers and confusion matrices in this application are dynamically produced by actual execution of Scikit-Learn classifiers and Qiskit quantum kernel simulation. Simulated quantum processing is explicitly designated to uphold academic standards.
      </ResearchNote>
    </div>
  );
};
