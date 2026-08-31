import React, { useEffect, useState, useRef } from 'react';
import { simulationService } from '../services/api';
import { wsService } from '../services/websocket';
import { TransactionTable } from '../components/TransactionTable';
import { AlertCard } from '../components/AlertCard';
import { Transaction } from '../types/transaction';
import { Alert } from '../types/alert';
import { MOCK_TRANSACTIONS, MOCK_ALERTS } from '../data/mockData';
import { Play, Pause, RotateCcw, Zap, Radio, ShieldAlert } from 'lucide-react';

interface LiveMonitoringProps {
  onInvestigate: (alertId: string) => void;
  onSelectAccount: (accId: string) => void;
}

export const LiveMonitoring: React.FC<LiveMonitoringProps> = ({ onInvestigate, onSelectAccount }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [liveStream, setLiveStream] = useState<Transaction[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const timerRef = useRef<any>(null);
  const demoIndexRef = useRef<number>(0);

  useEffect(() => {
    wsService.connect();

    const unsubscribe = wsService.subscribe((event) => {
      if (event.type === 'LIVE_TRANSACTION') {
        if (event.transaction) {
          setLiveStream((prev) => [event.transaction, ...prev.slice(0, 49)]);
        }
        if (event.alert) {
          setLiveAlerts((prev) => [event.alert, ...prev.slice(0, 19)]);
        }
        if (event.processed_count !== undefined) setProcessedCount(event.processed_count);
        if (event.alert_count !== undefined) setAlertCount(event.alert_count);
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStart = async () => {
    setIsRunning(true);
    simulationService.start(1.0).catch(() => {});

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const idx = demoIndexRef.current % MOCK_TRANSACTIONS.length;
      const nextTx = {
        ...MOCK_TRANSACTIONS[idx],
        timestamp: new Date().toISOString(),
        transaction_id: `TX-LIVE-${Math.floor(100 + Math.random() * 900)}`
      };

      demoIndexRef.current += 1;
      setProcessedCount((prev) => prev + 1);
      setLiveStream((prev) => [nextTx, ...prev.slice(0, 49)]);

      if (nextTx.receiver_account === 'Vikram Malhotra' || nextTx.risk_score >= 75) {
        setAlertCount((prev) => prev + 1);
        setLiveAlerts((prev) => [MOCK_ALERTS[0], ...prev.slice(0, 19)]);
      }
    }, 1500);
  };

  const handlePause = async () => {
    setIsRunning(false);
    simulationService.stop().catch(() => {});
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleReset = async () => {
    setIsRunning(false);
    simulationService.reset().catch(() => {});
    if (timerRef.current) clearInterval(timerRef.current);
    demoIndexRef.current = 0;
    setLiveStream([]);
    setLiveAlerts([]);
    setProcessedCount(0);
    setAlertCount(0);
  };

  const handleInjectDemo = async () => {
    try {
      const res = await simulationService.injectDemo();
      if (res.primary_alert) {
        setLiveAlerts((prev) => [res.primary_alert, ...prev]);
        onInvestigate(res.primary_alert.alert_id);
      } else {
        setLiveAlerts((prev) => [MOCK_ALERTS[0], ...prev]);
        onInvestigate('ALT-DEMO-001');
      }
    } catch {
      setLiveAlerts((prev) => [MOCK_ALERTS[0], ...prev]);
      onInvestigate('ALT-DEMO-001');
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Control Console Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight font-sans">Live Monitoring</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Watch transactions as they arrive. Suspicious activity will be highlighted automatically.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-2xs"
            >
              <Play className="w-4 h-4" />
              <span>▶ Start Demo</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-2xs"
            >
              <Pause className="w-4 h-4" />
              <span>⏸ Pause</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>↻ Reset</span>
          </button>

          <button
            onClick={handleInjectDemo}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-2xs"
          >
            <Zap className="w-4 h-4" />
            <span>Inject Demo Fraud</span>
          </button>
        </div>
      </div>

      {/* Real-time Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Transactions Processed</span>
          <span className="block text-2xl font-bold font-mono text-slate-900 mt-1">{processedCount}</span>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Suspicious Alerts</span>
          <span className="block text-2xl font-bold font-mono text-rose-600 mt-1">{alertCount}</span>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Analysis Speed</span>
          <span className="block text-2xl font-bold font-mono text-emerald-600 mt-1">&lt; 15 ms / tx</span>
        </div>
      </div>

      {/* 2 Column Layout: Real-Time Stream & Triggered Live Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Stream */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>LIVE INCOMING TRANSACTION STREAM</span>
          </h3>

          {liveStream.length > 0 ? (
            <TransactionTable transactions={liveStream} onSelectAccount={onSelectAccount} />
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <p>No transactions are currently streaming.</p>
              <button
                onClick={handleStart}
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Demo</span>
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Column: Triggered Live Alerts */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>REAL-TIME DETECTED ALERTS</span>
          </h3>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {liveAlerts.map((al) => (
              <AlertCard key={al.alert_id} alert={al} onInvestigate={onInvestigate} />
            ))}
            {liveAlerts.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                <p>No suspicious activity detected yet.</p>
                <p className="mt-1 text-[11px] text-slate-400">Click "Start Demo" to stream transactions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
