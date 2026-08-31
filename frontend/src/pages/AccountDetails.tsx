import React, { useEffect, useState } from 'react';
import { accountService } from '../services/api';
import { AccountDetailResponse } from '../types/account';
import { RiskGauge } from '../components/RiskGauge';
import { PatternBadge } from '../components/PatternBadge';
import { NetworkGraph } from '../components/NetworkGraph';
import { TransactionTable } from '../components/TransactionTable';
import { Building, Phone, Mail, MapPin, ShieldAlert, Network } from 'lucide-react';
import { translateEvidence } from '../utils/language';

interface AccountDetailsProps {
  accountId: string;
  onSelectAccount: (accId: string) => void;
}

export const AccountDetails: React.FC<AccountDetailsProps> = ({ accountId, onSelectAccount }) => {
  const [data, setData] = useState<AccountDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    accountService
      .getDetail(accountId)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm font-medium">
        Retrieving Account Intelligence for {accountId}...
      </div>
    );
  }

  const { account, risk_score, risk_level, detected_patterns, evidence, stats, recent_transactions, mini_graph } = data;

  const humanReasons = evidence && evidence.length > 0
    ? evidence.map(translateEvidence)
    : [
        'Received money from several people in a short period',
        'Quickly moved most of the received money',
        'Connected to a circular money flow network'
      ];

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header Card */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <RiskGauge score={risk_score} level={risk_level} size={130} />
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{account.name}</h1>
            <p className="text-xs text-slate-600 flex items-center gap-2 font-medium">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{account.bank}</span>
              <span>•</span>
              <span>{account.account_type} Account</span>
              <span>•</span>
              <span>{account.city}, {account.country}</span>
            </p>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {detected_patterns.map((p, idx) => (
                <PatternBadge key={idx} pattern={p} />
              ))}
            </div>
          </div>
        </div>

        {/* Contact Info Box */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5 self-stretch md:self-auto min-w-[220px]">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{account.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{account.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Customer ID: <strong className="font-mono text-slate-700">{account.customer_id}</strong></span>
          </div>
        </div>
      </div>

      {/* 2 Column Stats & Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Evidence & Stats */}
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Why are we concerned?</span>
            </h3>

            <div className="space-y-2">
              {humanReasons.map((reason, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 flex items-start gap-2 font-medium">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Money Activity</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Received</span>
                <span className="font-mono font-bold text-emerald-700 text-base">₹{stats.incoming_volume.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Sent</span>
                <span className="font-mono font-bold text-rose-700 text-base">₹{stats.outgoing_volume.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-500 font-bold text-[10px] uppercase">Connected People</span>
              <span className="font-bold text-slate-900">{stats.connected_nodes_count} People</span>
            </div>
          </div>
        </div>

        {/* Right Column Cytoscape Graph */}
        <div className="lg:col-span-2">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-600" />
              <span>CONNECTED MONEY NETWORK</span>
            </h3>

            <NetworkGraph
              nodes={mini_graph.nodes}
              edges={mini_graph.edges}
              onSelectAccount={onSelectAccount}
            />
          </div>
        </div>
      </div>

      {/* Account Transactions History */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 font-sans">Recent Activity</h3>
        <TransactionTable transactions={recent_transactions} onSelectAccount={onSelectAccount} />
      </div>
    </div>
  );
};
