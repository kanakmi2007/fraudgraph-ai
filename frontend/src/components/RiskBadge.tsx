import React from 'react';

interface RiskBadgeProps {
  score?: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, level, showScore = true }) => {
  const normalizedLevel = level?.toUpperCase() || 'LOW';

  let colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotColor = 'bg-emerald-500';

  if (normalizedLevel === 'CRITICAL') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (normalizedLevel === 'HIGH') {
    colorClasses = 'bg-orange-50 text-orange-700 border-orange-200';
    dotColor = 'bg-orange-500';
  } else if (normalizedLevel === 'MEDIUM') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{normalizedLevel}</span>
      {showScore && score !== undefined && (
        <span className="font-mono text-[11px] opacity-80">({score})</span>
      )}
    </span>
  );
};
