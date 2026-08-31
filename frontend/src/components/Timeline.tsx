import React from 'react';
import { Transaction } from '../types/transaction';
import { RiskBadge } from './RiskBadge';
import { ArrowRight, Clock } from 'lucide-react';

interface TimelineProps {
  transactions: Transaction[];
  onSelectAccount?: (accId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ transactions, onSelectAccount }) => {
  return (
    <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-4 py-2">
      {transactions.map((tx, idx) => (
        <div key={tx.transaction_id || idx} className="relative group">
          {/* Timeline Dot */}
          <div className="absolute -left-[31px] top-2 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs group-hover:scale-125 transition-transform" />

          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                <span className="font-mono text-slate-400">({tx.transaction_id})</span>
              </div>
              <RiskBadge level={tx.risk_level} score={tx.risk_score} showScore={false} />
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => onSelectAccount && onSelectAccount(tx.sender_account)}
                  className="text-slate-900 font-semibold hover:text-blue-600 hover:underline"
                >
                  {tx.sender_account}
                </button>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => onSelectAccount && onSelectAccount(tx.receiver_account)}
                  className="text-slate-900 font-semibold hover:text-blue-600 hover:underline"
                >
                  {tx.receiver_account}
                </button>
              </div>

              <span className="font-mono font-bold text-sm text-slate-900">
                ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      ))}
      {transactions.length === 0 && (
        <p className="text-xs text-slate-500 py-4">No chronological events found.</p>
      )}
    </div>
  );
};
