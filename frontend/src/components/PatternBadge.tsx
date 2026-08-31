import React from 'react';
import { Layers, RefreshCw, Zap, ShieldAlert, AlertTriangle, Moon } from 'lucide-react';
import { translatePattern } from '../utils/language';

interface PatternBadgeProps {
  pattern: string;
  showTechnical?: boolean;
}

export const PatternBadge: React.FC<PatternBadgeProps> = ({ pattern, showTechnical = false }) => {
  const info = translatePattern(pattern);

  let icon = <AlertTriangle className="w-3 h-3" />;
  let color = 'bg-slate-100 text-slate-700 border-slate-200';

  if (info.iconType === 'fan_in') {
    icon = <Layers className="w-3 h-3 rotate-180 text-blue-600" />;
    color = 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (info.iconType === 'fan_out') {
    icon = <Layers className="w-3 h-3 text-purple-600" />;
    color = 'bg-purple-50 text-purple-800 border-purple-200';
  } else if (info.iconType === 'circular') {
    icon = <RefreshCw className="w-3 h-3 text-rose-600" />;
    color = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (info.iconType === 'rapid') {
    icon = <Zap className="w-3 h-3 text-amber-600" />;
    color = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (info.iconType === 'structuring') {
    icon = <ShieldAlert className="w-3 h-3 text-indigo-600" />;
    color = 'bg-indigo-50 text-indigo-800 border-indigo-200';
  } else if (info.iconType === 'dormant') {
    icon = <Moon className="w-3 h-3 text-emerald-600" />;
    color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }

  return (
    <span
      title={`${info.humanDescription} (Technical name: ${info.technicalName})`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${color} shadow-2xs cursor-help`}
    >
      {icon}
      <span>{showTechnical ? info.technicalName : info.humanName}</span>
    </span>
  );
};
