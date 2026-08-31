import React, { useState } from 'react';
import { Alert } from '../types/alert';
import { RiskBadge } from './RiskBadge';
import { ArrowRight, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { translateEvidence } from '../utils/language';

interface AlertCardProps {
  alert: Alert;
  onInvestigate: (alertId: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onInvestigate }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold text-slate-400">{alert.alert_id}</span>
        <RiskBadge level={alert.severity} score={alert.risk_score} />
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{alert.title}</h4>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Primary: {alert.primary_account}</p>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
        <span>{alert.involved_accounts?.length || 6} people</span>
        <span>{alert.transaction_count} txs</span>
        <span className="font-bold text-slate-900">₹{alert.total_amount.toLocaleString('en-IN')}</span>
      </div>

      <div className="pt-1 flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <span>{expanded ? 'Hide details' : 'Why flagged?'}</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          onClick={() => onInvestigate(alert.alert_id)}
          className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors shadow-2xs"
        >
          <span>Investigate</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {expanded && (
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1 text-[11px] text-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Evidence Checklist</span>
          {alert.evidence?.map((ev, i) => (
            <div key={i} className="flex items-start gap-1 font-medium">
              <span className="text-emerald-600 font-bold">•</span>
              <span>{translateEvidence(ev)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
