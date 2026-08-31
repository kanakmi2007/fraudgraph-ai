import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'neutral',
}) => {
  return (
    <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between h-[105px]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{title}</span>
        {icon && (
          <div className="p-1 bg-slate-50 rounded-md text-slate-500 border border-slate-100">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <span className="text-xl font-bold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${
            trendType === 'positive' ? 'text-emerald-600' : trendType === 'negative' ? 'text-rose-600' : 'text-slate-500'
          }`}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[10px] text-slate-500 font-medium truncate">{subtitle}</p>
      )}
    </div>
  );
};
