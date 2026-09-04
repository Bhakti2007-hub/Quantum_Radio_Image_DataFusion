import React from 'react';

interface ConfusionMatrixProps {
  matrix: number[][];
  classes: string[];
  title?: string;
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({
  matrix,
  classes,
  title = 'Empirical Confusion Matrix'
}) => {
  if (!matrix || matrix.length === 0) {
    return <div className="text-muted" style={{ padding: '16px' }}>No confusion matrix data available.</div>;
  }

  // Calculate totals per row for shading
  const rowTotals = matrix.map(row => row.reduce((a, b) => a + b, 0));

  return (
    <div style={{ margin: '14px 0' }}>
      {title && <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-green)', marginBottom: '8px' }}>{title}</div>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '12px', margin: '0 auto' }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--text-muted)' }}>True \ Pred</th>
              {classes.slice(0, matrix[0].length).map((cls, j) => (
                <th key={j} style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {cls.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => {
              const rowSum = rowTotals[i] || 1;
              return (
                <tr key={i}>
                  <td style={{ padding: '6px 10px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {classes[i] ? classes[i].replace('_', ' ') : `Class ${i}`}
                  </td>
                  {row.map((val, j) => {
                    const ratio = val / rowSum;
                    const isDiagonal = i === j;
                    const bg = isDiagonal
                      ? `rgba(40, 72, 58, ${0.12 + ratio * 0.55})`
                      : val > 0 ? `rgba(201, 130, 104, ${0.1 + (val / rowSum) * 0.3})` : '#FAFAF7';
                    const textColor = (isDiagonal && ratio > 0.6) ? '#FFFFFF' : 'var(--text-primary)';

                    return (
                      <td
                        key={j}
                        style={{
                          padding: '10px 14px',
                          textAlign: 'center',
                          backgroundColor: bg,
                          color: textColor,
                          border: '1px solid var(--border-subtle)',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: isDiagonal ? 600 : 400
                        }}
                        title={`True: ${classes[i]} | Pred: ${classes[j]} | Count: ${val} (${(ratio * 100).toFixed(1)}%)`}
                      >
                        <div>{val}</div>
                        <div style={{ fontSize: '10px', opacity: 0.8 }}>{(ratio * 100).toFixed(0)}%</div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
