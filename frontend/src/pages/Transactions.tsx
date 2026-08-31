import React, { useEffect, useState } from 'react';
import { transactionService } from '../services/api';
import { Transaction } from '../types/transaction';
import { MOCK_TRANSACTIONS } from '../data/mockData';
import { TransactionTable } from '../components/TransactionTable';
import { Search } from 'lucide-react';

interface TransactionsProps {
  onSelectAccount: (accId: string) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ onSelectAccount }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    transactionService
      .list()
      .then((res) => {
        if (res && res.length > 0) setTransactions(res);
      })
      .catch(() => {});
  }, []);

  const filtered = transactions.filter((t) => {
    if (riskFilter !== 'ALL' && t.risk_level !== riskFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const senderMatch = t.sender_account.toLowerCase().includes(q);
      const receiverMatch = t.receiver_account.toLowerCase().includes(q);
      const txMatch = t.transaction_id.toLowerCase().includes(q);
      if (!senderMatch && !receiverMatch && !txMatch) return false;
    }
    return true;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Transactions</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Review money transfers and identify unusual activity.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setRiskFilter(lvl)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                riskFilter === lvl
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search people or transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* 6-Column Main Table Container */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        <TransactionTable transactions={filtered} onSelectAccount={onSelectAccount} />
      </div>
    </div>
  );
};
