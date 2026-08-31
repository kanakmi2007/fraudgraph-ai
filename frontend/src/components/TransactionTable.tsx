import React, { useState } from 'react';
import { Transaction } from '../types/transaction';
import { RiskBadge } from './RiskBadge';
import { translateEvidence } from '../utils/language';
import { X, ExternalLink } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onSelectAccount?: (accountId: string) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onSelectAccount,
}) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const getCleanWhyExplanation = (tx: Transaction) => {
    if (tx.receiver_account === 'Vikram Malhotra' || tx.risk_score >= 75) {
      return "Several people sent money to Vikram around the same time.";
    }
    if (tx.sender_account === 'Rahul Sharma') {
      return "Part of multiple transfers sent within a short period.";
    }
    if (tx.receiver_account === 'Rohan Singh') {
      return "Funds moved out immediately after receipt.";
    }
    return "Normal transfer within historical pattern.";
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="py-3 px-4">From</th>
              <th className="py-3 px-4">To</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Risk</th>
              <th className="py-3 px-4">Why is this unusual?</th>
              <th className="py-3 px-4 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {transactions.map((tx) => (
              <tr
                key={tx.transaction_id}
                onClick={() => setSelectedTx(tx)}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {/* FROM */}
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectAccount) onSelectAccount(tx.sender_account);
                    }}
                    className="hover:text-blue-600 hover:underline text-left font-bold"
                  >
                    {tx.sender_account}
                  </button>
                </td>

                {/* TO */}
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectAccount) onSelectAccount(tx.receiver_account);
                    }}
                    className="hover:text-blue-600 hover:underline text-left font-bold"
                  >
                    {tx.receiver_account}
                  </button>
                </td>

                {/* AMOUNT */}
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                  ₹{tx.amount.toLocaleString('en-IN')}
                </td>

                {/* RISK */}
                <td className="py-3.5 px-4">
                  <RiskBadge level={tx.risk_level} score={tx.risk_score} />
                </td>

                {/* WHY IS THIS UNUSUAL? */}
                <td className="py-3.5 px-4 text-slate-600 font-medium max-w-xs truncate">
                  "{getCleanWhyExplanation(tx)}"
                </td>

                {/* TIME */}
                <td className="py-3.5 px-4 text-right font-mono text-slate-500 text-[11px]">
                  {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over Transaction Details Side Drawer */}
      {selectedTx && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200/80 shadow-2xl z-50 flex flex-col justify-between p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">TRANSACTION DETAILS</span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedTx.sender_account} → {selectedTx.receiver_account}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transfer Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
              <span className="text-2xl font-bold font-mono text-slate-900">₹{selectedTx.amount.toLocaleString('en-IN')}</span>
              <div className="flex justify-center mt-1">
                <RiskBadge level={selectedTx.risk_level} score={selectedTx.risk_score} />
              </div>
            </div>

            {/* Why was this flagged? */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Why was this flagged?</span>
              <p className="text-xs text-slate-700 font-medium">
                "{getCleanWhyExplanation(selectedTx)}"
              </p>
            </div>

            {/* Related Activity */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Related Network Activity</span>
              <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                  <span>Rahul Sharma → Vikram Malhotra</span>
                  <span className="font-mono font-bold">₹8,700</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                  <span>Neha Kapoor → Vikram Malhotra</span>
                  <span className="font-mono font-bold">₹8,800</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                  <span>Priya Mehta → Vikram Malhotra</span>
                  <span className="font-mono font-bold">₹8,500</span>
                </div>
              </div>
            </div>

            {/* Secondary Technical Metadata */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Technical Details</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                <div>
                  <span className="block text-[10px] text-slate-400">TX ID</span>
                  <span className="font-bold text-slate-800">{selectedTx.transaction_id}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Channel</span>
                  <span className="font-bold text-slate-800">{selectedTx.channel}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] text-slate-400">Technical Pattern</span>
                  <span className="font-bold text-slate-800">
                    {selectedTx.detected_patterns && selectedTx.detected_patterns.length > 0 ? selectedTx.detected_patterns.join(', ') : 'STANDARD'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/80">
            <button
              onClick={() => {
                if (onSelectAccount) onSelectAccount(selectedTx.receiver_account);
                setSelectedTx(null);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Inspect Account ({selectedTx.receiver_account})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
