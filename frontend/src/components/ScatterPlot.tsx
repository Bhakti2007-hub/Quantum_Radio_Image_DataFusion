import React, { useState } from 'react';

interface Point {
  sample_id: number;
  x: number;
  y: number;
  target_class: string;
  [key: string]: any;
}

interface ScatterPlotProps {
  points: Point[];
  xLabel?: string;
  yLabel?: string;
  title?: string;
  explainedVariance?: number[];
}

const CLASS_COLORS: Record<string, string> = {
  UAV_Drone: '#28483A',
  Ground_Vehicle: '#7D9A86',
  Civil_Aircraft: '#C6A15B',
  Maritime_Vessel: '#C98268',
  Clutter_Noise: '#8A948C'
};

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  points,
  xLabel = 'Principal Component 1',
  yLabel = 'Principal Component 2',
  title = '2D Manifold Feature Space',
  explainedVariance
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);

  if (!points || points.length === 0) {
    return <div className="text-muted" style={{ padding: '24px' }}>No projection data available.</div>;
  }

  // Calculate bounding box
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const padding = 40;
  const width = 580;
  const height = 340;

  const scaleX = (val: number) => padding + ((val - minX) / (maxX - minX || 1)) * (width - 2 * padding);
  const scaleY = (val: number) => height - padding - ((val - minY) / (maxY - minY || 1)) * (height - 2 * padding);

  const uniqueClasses = Array.from(new Set(points.map(p => p.target_class)));

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--forest-green)' }}>
          {title}
        </div>
        {explainedVariance && (
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Variance Explained: PC1 ({(explainedVariance[0] * 100).toFixed(1)}%), PC2 ({(explainedVariance[1] * 100).toFixed(1)}%)
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
        {uniqueClasses.map(cls => (
          <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: CLASS_COLORS[cls] || '#555'
            }} />
            <span style={{ color: 'var(--text-secondary)' }}>{cls.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ backgroundColor: '#FAFAF7', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        {/* Grid lines */}
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#E5E0D5" strokeDasharray="3 3" />
        <line x1={width / 2} y1={padding} x2={width / 2} y2={height - padding} stroke="#E5E0D5" strokeDasharray="3 3" />

        {/* Axis Labels */}
        <text x={width / 2} y={height - 10} textAnchor="middle" fontSize="11" fill="var(--text-muted)">{xLabel}</text>
        <text x={12} y={height / 2} textAnchor="middle" fontSize="11" fill="var(--text-muted)" transform={`rotate(-90 12 ${height / 2})`}>{yLabel}</text>

        {/* Points */}
        {points.map((p, idx) => {
          const cx = scaleX(p.x);
          const cy = scaleY(p.y);
          const color = CLASS_COLORS[p.target_class] || '#555';
          const isHovered = hoveredPoint?.sample_id === p.sample_id;

          return (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={isHovered ? 6 : 4}
              fill={color}
              opacity={0.8}
              stroke={isHovered ? '#FFF' : 'transparent'}
              strokeWidth={1.5}
              style={{ cursor: 'pointer', transition: 'r 0.15s' }}
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          boxShadow: 'var(--shadow-md)',
          fontSize: '12px',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <div style={{ fontWeight: 600, color: CLASS_COLORS[hoveredPoint.target_class] || 'var(--forest-green)' }}>
            {hoveredPoint.target_class.replace('_', ' ')}
          </div>
          <div style={{ color: 'var(--text-muted)' }}>Sample #{hoveredPoint.sample_id}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', marginTop: '3px' }}>
            x: {hoveredPoint.x.toFixed(2)}, y: {hoveredPoint.y.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};
