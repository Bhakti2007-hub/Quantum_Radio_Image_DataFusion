import React, { useState } from 'react';
import { CircuitInfo } from '../types';
import { Layers, Cpu, Code2 } from 'lucide-react';

interface CircuitViewerProps {
  circuit: CircuitInfo | null;
}

export const CircuitViewer: React.FC<CircuitViewerProps> = ({ circuit }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'ascii'>('visual');

  if (!circuit) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No quantum circuit information loaded. Train Quantum ML Model to view circuit diagram.
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <Cpu size={18} color="var(--warm-mustard-dark)" />
            Quantum Circuit Architecture ({circuit.feature_map_type})
          </div>
          <div className="card-subtitle">
            {circuit.n_qubits} Qubits &bull; {circuit.repetitions} Repetitions &bull; Circuit Depth: {circuit.circuit_depth} &bull; Total Gates: {circuit.total_gates}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-simulation">Quantum Simulation</span>
          <div className="tabs-nav" style={{ margin: 0, padding: '2px' }}>
            <button
              className={`tab-btn ${viewMode === 'visual' ? 'active' : ''}`}
              onClick={() => setViewMode('visual')}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              <Layers size={13} style={{ marginRight: '4px' }} />
              Gate Wires
            </button>
            <button
              className={`tab-btn ${viewMode === 'ascii' ? 'active' : ''}`}
              onClick={() => setViewMode('ascii')}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              <Code2 size={13} style={{ marginRight: '4px' }} />
              ASCII
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="circuit-container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {circuit.wires.map((wire, qIdx) => {
              // Find gates for this qubit
              const qubitGates = circuit.gates.filter(g =>
                g.qubit === qIdx || g.control === qIdx || g.target === qIdx
              );

              return (
                <div key={qIdx} className="circuit-wire">
                  <div className="qubit-label">|0⟩ {wire.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px', zIndex: 2 }}>
                    {qubitGates.map((gate, gIdx) => {
                      let gateClass = 'gate-badge';
                      if (gate.type === 'H') gateClass += ' h-gate';
                      else if (gate.type === 'Rz') gateClass += ' rz-gate';
                      else if (gate.type === 'CX') gateClass += ' cx-gate';

                      return (
                        <div
                          key={gIdx}
                          className={gateClass}
                          title={`${gate.name}: ${gate.description}`}
                        >
                          {gate.type === 'CX' ? (gate.control === qIdx ? '●' : '⊕') : gate.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '14px', fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
            <span><strong style={{ color: 'var(--forest-green)' }}>H:</strong> Hadamard Superposition</span>
            <span><strong style={{ color: 'var(--warm-mustard-dark)' }}>Rz(φ):</strong> Phase Parameterization</span>
            <span><strong style={{ color: 'var(--soft-terracotta)' }}>CX (●/⊕):</strong> Entanglement Coupler</span>
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#232A26',
          color: '#E0EDE3',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          overflowX: 'auto',
          whiteSpace: 'pre'
        }}>
          {circuit.ascii_diagram || 'ASCII circuit output generated via Qiskit.'}
        </div>
      )}
    </div>
  );
};
