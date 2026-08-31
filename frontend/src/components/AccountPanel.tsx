import React, { useEffect, useState } from 'react';
import { X, ExternalLink, ShieldAlert, Building, Phone, Mail, MapPin } from 'lucide-react';
import { accountService } from '../services/api';
import { AccountDetailResponse } from '../types/account';
import { RiskGauge } from './RiskGauge';
import { PatternBadge } from './PatternBadge';

interface AccountPanelProps {
  accountId: string | null;
  onClose: () => void;
  onNavigateToAccount: (accId: string) => void;
}

export const AccountPanel: React.FC<AccountPanelProps> = ({
  accountId,
  onClose,
  onNavigateToAccount
}) => {
  const [data, setData] = useState<AccountDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    accountService
      .getDetail(accountId)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (!accountId) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col justify-between">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase text-slate-500 font-bold">Account Intelligence Drawer</span>
          <h2 className="text-base font-bold text-slate-900">{accountId}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500 text-xs">
            Loading Account Intelligence...
          </div>
        ) : data ? (
          <>
            {/* Risk Gauge & Profile Header */}
            <div className="flex flex-col items-center p-5 bg-slate-50 rounded-xl border border-slate-200">
              <RiskGauge score={data.risk_score} level={data.risk_level} size={140} />
              <h3 className="text-sm font-bold text-slate-900 mt-3">{data.account.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-medium">
                <Building className="w-3.5 h-3.5" />
                <span>{data.account.bank}</span>
                <span>•</span>
                <span>{data.account.city}</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Incoming Volume</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">₹{data.stats.incoming_volume.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Outgoing Volume</span>
                <span className="font-mono font-bold text-rose-700 text-sm">₹{data.stats.outgoing_volume.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Total Transfers</span>
                <span className="font-semibold text-slate-800">{data.stats.transaction_count}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Network Degree</span>
                <span className="font-semibold text-slate-800">{data.stats.connected_nodes_count} Nodes</span>
              </div>
            </div>

            {/* Flagged Patterns */}
            {data.detected_patterns && data.detected_patterns.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detected Risk Patterns</h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.detected_patterns.map((p, idx) => (
                    <PatternBadge key={idx} pattern={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Explainable AI Evidence */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Explainable Risk Evidence</h4>
              <div className="space-y-2">
                {data.evidence.map((reason, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{data.account.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{data.account.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{data.account.city}, {data.account.country}</span>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => {
            onNavigateToAccount(accountId);
            onClose();
          }}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <span>Open Full Intelligence Profile</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
