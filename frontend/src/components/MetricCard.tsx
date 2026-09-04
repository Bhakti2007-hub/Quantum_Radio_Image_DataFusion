import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  badge?: string;
  badgeType?: 'green' | 'sage' | 'terracotta' | 'mustard';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  badge,
  badgeType = 'green',
  icon
}) => {
  return (
    <div className="metric-card">
      <div className="metric-label">
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {icon}
          {label}
        </span>
        {badge && <span className={`badge badge-${badgeType}`}>{badge}</span>}
      </div>
      <div className="metric-value">{value}</div>
      {subtext && <div className="metric-subtext">{subtext}</div>}
    </div>
  );
};
