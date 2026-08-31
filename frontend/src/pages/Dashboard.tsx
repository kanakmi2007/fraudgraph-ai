import React, { useEffect, useState } from 'react';
import { dashboardService, alertService } from '../services/api';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { Alert } from '../types/alert';
import { Transaction } from '../types/transaction';
import { MOCK_DASHBOARD_STATS, MOCK_ALERTS, MOCK_TRANSACTIONS } from '../data/mockData';
import { 
  ArrowLeftRight, 
  DollarSign, 
  AlertTriangle, 
  ShieldAlert, 
  Network, 
  Activity,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

interface DashboardProps {
  onNavigate: (path: string) => void;
  onSelectAccount: (accountId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectAccount }) => {
  const [data, setData] = useState<any>(MOCK_DASHBOARD_STATS);
  const [topAlerts, setTopAlerts] = useState<Alert[]>(MOCK_ALERTS.slice(0, 1));

  const fetchStats = () => {
    Promise.all([
      dashboardService.getStats(),
      alertService.list({ severity: 'CRITICAL', limit: 1 })
    ])
      .then(([statsRes, alertsRes]) => {
        if (statsRes) setData(statsRes);
        if (alertsRes && alertsRes.length > 0) setTopAlerts(alertsRes.slice(0, 1));
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const { kpis, risk_distribution, alerts_by_pattern, recent_feed } = data;

  const lightRiskDist = [
    { name: 'Low', value: risk_distribution[0]?.value || 420, color: '#10B981' },
    { name: 'Medium', value: risk_distribution[1]?.value || 48, color: '#D97706' },
    { name: 'High', value: risk_distribution[2]?.value || 26, color: '#EA580C' },
    { name: 'Critical', value: risk_distribution[3]?.value || 6, color: '#DC2626' }
  ];

  return (
    <div className="p-5 space-y-4 max-w-7xl mx-auto">
      {/* ROW 1: 4 SMALL KPI CARDS IN ONE ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Transactions Monitored"
          value="1,247"
          subtitle="+12% this week"
          icon={<ArrowLeftRight className="w-3.5 h-3.5" />}
          trend="+12%"
          trendType="positive"
        />
        <StatCard
          title="Suspicious Activity"
          value="32"
          subtitle="8 need attention"
          icon={<DollarSign className="w-3.5 h-3.5 text-amber-600" />}
          trend="8 priority"
          trendType="neutral"
        />
        <StatCard
          title="Active Alerts"
          value={kpis.active_alerts || 8}
          subtitle="3 critical"
          icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
          trend="3 critical"
          trendType="negative"
        />
        <StatCard
          title="High-Risk Networks"
          value={kpis.suspicious_networks || 4}
          subtitle="2 critical"
          icon={<Network className="w-3.5 h-3.5 text-rose-600" />}
          trend="2 critical"
          trendType="negative"
        />
      </div>

      {/* ROW 2: TWO MEDIUM CHARTS SIDE-BY-SIDE (HEIGHT ~220px) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Chart Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between h-[210px]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 font-sans flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Suspicious Activity</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Unusual activity over time</span>
          </div>

          <div className="h-36 my-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alerts_by_pattern} margin={{ top: 5, right: 10, left: -25, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="pattern" stroke="#64748B" fontSize={8} tickLine={false} interval={0} angle={-10} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={8} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '6px', color: '#0F172A', fontSize: '10px' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between h-[210px]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 font-sans flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
              <span>Risk Overview</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Account risk level breakdown</span>
          </div>

          <div className="h-36 my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lightRiskDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {lightRiskDist.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '6px', color: '#0F172A', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600 font-medium">
            {lightRiskDist.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: <strong className="font-bold text-slate-900">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3: RECENT SUSPICIOUS ACTIVITY (LEFT 2/3) + SUSPICIOUS NETWORK (RIGHT 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT / LARGER CARD: Recent Suspicious Activity */}
        <div className="lg:col-span-2 p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 font-sans">Recent Suspicious Activity</h3>
            <button
              onClick={() => onNavigate('/transactions')}
              className="text-[10px] font-semibold text-blue-600 hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-2 px-3">From → To</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Risk</th>
                  <th className="py-2 px-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {recent_feed.slice(0, 3).map((tx: Transaction) => (
                  <tr
                    key={tx.transaction_id}
                    onClick={() => onSelectAccount(tx.receiver_account)}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      <span>{tx.sender_account}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span>{tx.receiver_account}</span>
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">₹{tx.amount.toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3">
                      <RiskBadge level={tx.risk_level} score={tx.risk_score} />
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[10px] text-slate-400">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT / SMALLER CARD: Suspicious Network */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Suspicious Network</span>
              <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[9px] font-bold">
                94 / 100 CRITICAL
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-1">Vikram Malhotra</h4>
            <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
              6 people • 8 transactions • ₹87,400 total
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              "Several people sent money to Vikram and the money moved again within minutes."
            </p>
          </div>

          <button
            onClick={() => onNavigate('/investigation/ALT-DEMO-001')}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Investigate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ROW 4: OPTIONAL SMALL DETECTION SUMMARY */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs text-slate-700 font-medium">
        <span className="text-[10px] font-bold uppercase text-slate-400">Detection Summary</span>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Several people → One account</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Money moved quickly</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Money returned to origin</span>
          </span>
        </div>
      </div>
    </div>
  );
};
