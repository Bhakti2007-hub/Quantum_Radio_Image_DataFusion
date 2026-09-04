import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  datasetType?: string;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: 'Research Overview',
    subtitle: 'Multimodal learning for accurate target detection in wireless environments'
  },
  dataset: {
    title: 'Multimodal Dataset Explorer',
    subtitle: 'Manage, inspect, and explore paired radio and optical target signatures'
  },
  radio: {
    title: 'Radio-Frequency Signal Analysis',
    subtitle: 'Kinematic micro-Doppler, SNR, and channel propagation feature space'
  },
  image: {
    title: 'Optical Image Analysis',
    subtitle: 'Spatial contour, texture entropy, and color moment visual descriptors'
  },
  fusion: {
    title: 'Multimodal Data Fusion Lab',
    subtitle: 'Benchmark Early (concatenation), Intermediate (embeddings), and Late (consensus) fusion'
  },
  quantum: {
    title: 'Quantum Machine Learning Lab',
    subtitle: 'QSVC Target Classifier with ZZFeatureMap Hilbert space kernel simulation'
  },
  comparison: {
    title: 'Model Benchmark & Comparison',
    subtitle: 'Objective empirical comparison of Single-Modality vs Classical Fusion vs Quantum ML'
  },
  detection: {
    title: 'Interactive Target Detection Console',
    subtitle: 'Test live target classification across RF parameter sliders and visual image inputs'
  },
  experiments: {
    title: 'Experimental Results & History',
    subtitle: 'Archived benchmark logs with confusion matrices, latency, and parameter tracking'
  },
  insights: {
    title: 'Research Insights & Observations',
    subtitle: 'Dynamically synthesized findings regarding multimodal synergy and quantum feasibility'
  },
  about: {
    title: 'Methodology, Theory & References',
    subtitle: 'Comprehensive 11-step research methodology, mathematical derivations, and citations'
  }
};

export const Header: React.FC<HeaderProps> = ({ activeTab, datasetType = 'Synthetic Demonstration Dataset' }) => {
  const current = TAB_TITLES[activeTab] || {
    title: 'Quantum ML for Radio-Image Data Fusion',
    subtitle: 'Multimodal Target Detection Platform'
  };

  const isSynthetic = datasetType.includes('Synthetic');

  return (
    <header className="top-header">
      <div className="header-title-section">
        <h1>{current.title}</h1>
        <p>{current.subtitle}</p>
      </div>

      <div className="header-badges">
        <span className={`badge ${isSynthetic ? 'badge-mustard' : 'badge-green'}`}>
          <ShieldCheck size={13} />
          {datasetType}
        </span>
        <span className="badge badge-simulation">
          <Activity size={13} />
          Quantum Simulation
        </span>
      </div>
    </header>
  );
};
