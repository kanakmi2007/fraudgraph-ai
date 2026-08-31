import React, { useEffect, useState } from 'react';
import { accountService } from '../services/api';
import { Account } from '../types/account';
import { MOCK_PEOPLE_ACCOUNTS } from '../data/mockData';
import { RiskBadge } from '../components/RiskBadge';
import { Search, ExternalLink, ShieldAlert, ArrowRight, Building } from 'lucide-react';

interface AccountsProps {
  onSelectAccount: (accId: string) => void;
}

export const Accounts: React.FC<AccountsProps> = ({ onSelectAccount }) => {
  const [accounts, setAccounts] = useState<Account[]>(MOCK_PEOPLE_ACCOUNTS);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  useEffect(() => {
    accountService
      .list()
      .then((res) => {
        if (res && res.length > 0) setAccounts(res);
      })
      .catch(() => {});
  }, []);

  const filtered = accounts.filter((a) => {
    if (riskFilter !== 'ALL' && a.risk_level !== riskFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.account_id.toLowerCase().includes(q) && !a.name.toLowerCase().includes(q) && !a.bank.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const getWhyConcerned = (acc: Account) => {
    if (acc.risk_score >= 80) {
      return [
        'Received money from several people',
        'Quickly moved most of the money',
        'Connected to a circular flow'
      ];
    }
    if (acc.risk_score >= 50) {
      return [
        'Passed funds through immediately after receipt',
        'Connected to high-risk person accounts'
      ];
    }
    return [
      'Standard direct personal account',
      'Normal transfer velocity'
    ];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Accounts</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Understand the people and accounts involved in suspicious activity.
        </p>
      </div>

      {/* Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
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
            placeholder="Search people, banks or accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Profile-Style Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((acc) => (
          <div
            key={acc.account_id}
            onClick={() => onSelectAccount(acc.account_id)}
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{acc.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{acc.bank}</span>
                    <span>•</span>
                    <span>{acc.city}</span>
                  </p>
                </div>
                <RiskBadge level={acc.risk_level} score={acc.risk_score} />
              </div>

              <div className="grid grid-cols-2 gap-2 my-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Received</span>
                  <span className="font-mono font-bold text-emerald-700">₹{acc.risk_score >= 80 ? '25,800' : '8,900'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Sent</span>
                  <span className="font-mono font-bold text-rose-700">₹{acc.risk_score >= 80 ? '25,000' : '8,500'}</span>
                </div>
              </div>

              <div className="space-y-1.5 my-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Why are we concerned?</span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {getWhyConcerned(acc).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 font-medium">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectAccount(acc.account_id);
              }}
              className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>View Network</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
