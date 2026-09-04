import React from 'react';
import { Info } from 'lucide-react';

interface ResearchNoteProps {
  children: React.ReactNode;
  variant?: 'sage' | 'warm' | 'terracotta';
  title?: string;
}

export const ResearchNote: React.FC<ResearchNoteProps> = ({
  children,
  variant = 'sage',
  title = 'Research Observation'
}) => {
  return (
    <div className={`research-note ${variant}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px' }}>
        <Info size={14} />
        <span>{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
};
