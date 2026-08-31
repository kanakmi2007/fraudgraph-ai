import React, { useEffect, useState } from 'react';
import { alertService } from '../services/api';
import { Alert } from '../types/alert';
import { MOCK_ALERTS } from '../data/mockData';
import { AlertCard } from '../components/AlertCard';
import { Search } from 'lucide-react';

interface AlertsProps {
  onInvestigate: (alertId: string) => void;
}

export const Alerts: React.FC<AlertsProps> = ({ onInvestigate }) => {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    alertService
      .list()
      .then((res) => {
        if (res && res.length > 0) setAlerts(res);
      })
      .catch(() => {});
  }, []);

  const filteredAlerts = alerts.filter((al) => {
    if (severityFilter !== 'ALL' && al.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = al.alert_id.toLowerCase().includes(q);
      const matchTitle = al.title.toLowerCase().includes(q);
      const matchPrimary = al.primary_account.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchPrimary) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header Subtitle */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Alerts</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Review transactions and accounts that may need your attention.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                severityFilter === sev
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search people, transactions or alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredAlerts.map((alert) => (
          <AlertCard key={alert.alert_id} alert={alert} onInvestigate={onInvestigate} />
        ))}
        {filteredAlerts.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm font-medium">
            No suspicious activity alerts match the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
};
