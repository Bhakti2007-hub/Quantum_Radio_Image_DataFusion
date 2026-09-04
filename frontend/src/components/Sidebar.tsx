import React from 'react';
import {
  BookOpen,
  Database,
  Radio,
  Image as ImageIcon,
  GitMerge,
  Cpu,
  BarChart3,
  Crosshair,
  History,
  Lightbulb,
  FileText
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { section: 'FOUNDATION' },
    { id: 'overview', label: 'Research Overview', icon: BookOpen },
    { id: 'dataset', label: 'Dataset Explorer', icon: Database },

    { section: 'MODALITY ANALYSIS' },
    { id: 'radio', label: 'Radio Analysis', icon: Radio },
    { id: 'image', label: 'Image Analysis', icon: ImageIcon },

    { section: 'MULTIMODAL FUSION & QML' },
    { id: 'fusion', label: 'Data Fusion Lab', icon: GitMerge, badge: 'Core' },
    { id: 'quantum', label: 'Quantum ML Lab', icon: Cpu, badge: 'QML' },

    { section: 'BENCHMARK & INFERENCE' },
    { id: 'comparison', label: 'Model Comparison', icon: BarChart3 },
    { id: 'detection', label: 'Target Detection', icon: Crosshair, highlight: true },
    { id: 'experiments', label: 'Experiment Results', icon: History },

    { section: 'RESEARCH SYNTHESIS' },
    { id: 'insights', label: 'Research Insights', icon: Lightbulb },
    { id: 'about', label: 'About the Research', icon: FileText }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="lab-brand">
          <div className="lab-icon">Ψ</div>
          <div>
            <div className="lab-title">Quantum ML Fusion</div>
            <div className="lab-subtitle">Wireless Sensing Lab</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, idx) => {
          if (item.section) {
            return (
              <div key={idx} className="nav-section-title">
                {item.section}
              </div>
            );
          }

          const IconComponent = item.icon!;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id!)}
            >
              <IconComponent size={17} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--forest-green-subtle)',
                    color: isActive ? '#FFF' : 'var(--forest-green)',
                    fontWeight: 600
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div>Quantum Simulation Engine: <strong>Qiskit 2.5</strong></div>
        <div style={{ marginTop: '2px', color: 'var(--text-muted)' }}>Radio-Optical Target Detection</div>
      </div>
    </aside>
  );
};
