import React, { useEffect, useState } from 'react';
import { alertService, graphService } from '../services/api';
import { RiskGauge } from '../components/RiskGauge';
import { RiskBadge } from '../components/RiskBadge';
import { NetworkGraph } from '../components/NetworkGraph';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Briefcase, 
  Network, 
  Clock, 
  Layers, 
  RefreshCw, 
  Zap, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  ExternalLink 
} from 'lucide-react';

interface InvestigationProps {
  alertId: string;
  onSelectAccount: (accId: string) => void;
  onNavigateToCases: () => void;
  onNavigateToTransactions?: () => void;
  onNavigateToAlerts?: () => void;
}

const DEMO_GRAPH_NODES = [
  { id: 'Rahul Sharma', name: 'Rahul Sharma', risk_score: 85, risk_level: 'HIGH', bank: 'HDFC Bank', is_primary: false },
  { id: 'Priya Mehta', name: 'Priya Mehta', risk_score: 65, risk_level: 'MEDIUM', bank: 'ICICI Bank', is_primary: false },
  { id: 'Aman Verma', name: 'Aman Verma', risk_score: 60, risk_level: 'MEDIUM', bank: 'Axis Bank', is_primary: false },
  { id: 'Neha Kapoor', name: 'Neha Kapoor', risk_score: 55, risk_level: 'MEDIUM', bank: 'SBI', is_primary: false },
  { id: 'Vikram Malhotra', name: 'Vikram Malhotra', risk_score: 94, risk_level: 'CRITICAL', bank: 'HDFC Bank', is_primary: true },
  { id: 'Rohan Singh', name: 'Rohan Singh', risk_score: 80, risk_level: 'HIGH', bank: 'Kotak Bank', is_primary: false }
];

const DEMO_GRAPH_EDGES = [
  { id: 'E1', source: 'Rahul Sharma', target: 'Priya Mehta', amount: 8900 },
  { id: 'E2', source: 'Rahul Sharma', target: 'Aman Verma', amount: 9100 },
  { id: 'E3', source: 'Rahul Sharma', target: 'Neha Kapoor', amount: 8700 },
  { id: 'E4', source: 'Priya Mehta', target: 'Vikram Malhotra', amount: 8500 },
  { id: 'E5', source: 'Aman Verma', target: 'Vikram Malhotra', amount: 8900 },
  { id: 'E6', source: 'Neha Kapoor', target: 'Vikram Malhotra', amount: 8400 },
  { id: 'E7', source: 'Vikram Malhotra', target: 'Rohan Singh', amount: 25000 },
  { id: 'E8', source: 'Rohan Singh', target: 'Rahul Sharma', amount: 20000 }
];

const DEMO_TIMELINE = [
  { time: '10:01 AM', sender: 'Rahul Sharma', receiver: 'Priya Mehta', amount: 8900, risk: 'MEDIUM' },
  { time: '10:02 AM', sender: 'Rahul Sharma', receiver: 'Aman Verma', amount: 9100, risk: 'MEDIUM' },
  { time: '10:03 AM', sender: 'Rahul Sharma', receiver: 'Neha Kapoor', amount: 8700, risk: 'MEDIUM' },
  { time: '10:05 AM', sender: 'Priya Mehta', receiver: 'Vikram Malhotra', amount: 8500, risk: 'HIGH' },
  { time: '10:06 AM', sender: 'Aman Verma', receiver: 'Vikram Malhotra', amount: 8900, risk: 'HIGH' },
  { time: '10:07 AM', sender: 'Neha Kapoor', receiver: 'Vikram Malhotra', amount: 8400, risk: 'HIGH' },
  { time: '10:09 AM', sender: 'Vikram Malhotra', receiver: 'Rohan Singh', amount: 25000, risk: 'CRITICAL' },
  { time: '10:12 AM', sender: 'Rohan Singh', receiver: 'Rahul Sharma', amount: 20000, risk: 'HIGH' }
];

const ACCOUNT_PROFILE_MAP: Record<string, {
  name: string;
  risk_score: number;
  risk_level: string;
  received: number;
  sent: number;
  connections: number;
  reasons: string[];
}> = {
  'Vikram Malhotra': {
    name: 'Vikram Malhotra',
    risk_score: 94,
    risk_level: 'CRITICAL',
    received: 25800,
    sent: 25000,
    connections: 6,
    reasons: ['Several people sent money here', 'Money moved out quickly', 'Part of a circular money flow']
  },
  'Rahul Sharma': {
    name: 'Rahul Sharma',
    risk_score: 85,
    risk_level: 'HIGH',
    received: 20000,
    sent: 26700,
    connections: 5,
    reasons: ['Initiated transfers to multiple people', 'Received funds completing a circular loop']
  },
  'Priya Mehta': {
    name: 'Priya Mehta',
    risk_score: 65,
    risk_level: 'MEDIUM',
    received: 8900,
    sent: 8500,
    connections: 2,
    reasons: ['Passed funds through immediately after receipt']
  },
  'Aman Verma': {
    name: 'Aman Verma',
    risk_score: 60,
    risk_level: 'MEDIUM',
    received: 9100,
    sent: 8900,
    connections: 2,
    reasons: ['Passed funds through immediately after receipt']
  },
  'Neha Kapoor': {
    name: 'Neha Kapoor',
    risk_score: 55,
    risk_level: 'MEDIUM',
    received: 8700,
    sent: 8400,
    connections: 2,
    reasons: ['Passed funds through immediately after receipt']
  },
  'Rohan Singh': {
    name: 'Rohan Singh',
    risk_score: 80,
    risk_level: 'HIGH',
    received: 25000,
    sent: 20000,
    connections: 2,
    reasons: ['Acted as a high-volume transit layer']
  }
};

export const Investigation: React.FC<InvestigationProps> = ({
  alertId,
  onSelectAccount,
  onNavigateToCases,
  onNavigateToTransactions,
  onNavigateToAlerts
}) => {
  const [nodes, setNodes] = useState(DEMO_GRAPH_NODES);
  const [edges, setEdges] = useState(DEMO_GRAPH_EDGES);
  const [selectedPersonNode, setSelectedPersonNode] = useState<string | null>(null);
  const [creatingCase, setCreatingCase] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      alertService.getDetail(alertId),
      graphService.getAlertGraph(alertId)
    ])
      .then(([detailRes, graphRes]) => {
        if (!isMounted) return;
        if (graphRes && graphRes.nodes && graphRes.nodes.length > 0) {
          setNodes(graphRes.nodes);
          setEdges(graphRes.edges || []);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [alertId]);

  const handleCreateCase = async () => {
    setCreatingCase(true);
    try {
      await alertService.convertToCase(alertId);
      onNavigateToCases();
    } catch {
      onNavigateToCases();
    } finally {
      setCreatingCase(false);
    }
  };

  const handleNodeClick = (accountId: string) => {
    setSelectedPersonNode(accountId);
  };

  const selectedAccountInfo = selectedPersonNode ? (
    ACCOUNT_PROFILE_MAP[selectedPersonNode] || {
      name: selectedPersonNode,
      risk_score: 75,
      risk_level: 'HIGH',
      received: 15000,
      sent: 12000,
      connections: 3,
      reasons: ['Connected to suspicious money network flow']
    }
  ) : null;

  const cycleHighlightPath = ['Rahul Sharma', 'Priya Mehta', 'Vikram Malhotra', 'Rohan Singh', 'Rahul Sharma'];

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header Controls */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight font-sans">Investigate Network</h1>
          <p className="text-[11px] text-slate-500 font-medium">See how money moved between connected people.</p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToAlerts && (
            <button
              onClick={onNavigateToAlerts}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Alerts</span>
            </button>
          )}
          <button
            onClick={handleCreateCase}
            disabled={creatingCase}
            className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{creatingCase ? 'Creating Case...' : 'Create Case'}</span>
          </button>
        </div>
      </div>

      {/* 4 Small KPI Cards in ONE Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Risk</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-lg font-bold text-slate-900 font-mono">94 / 100</span>
            <RiskBadge level="CRITICAL" score={94} showScore={false} />
          </div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase">People</span>
          <span className="block text-lg font-bold text-slate-900 font-mono mt-0.5">6</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Transactions</span>
          <span className="block text-lg font-bold text-slate-900 font-mono mt-0.5">8</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Amount</span>
          <span className="block text-lg font-bold text-emerald-700 font-mono mt-0.5">₹87,400</span>
        </div>
      </div>

      {/* Large White Graph Card + Explanation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Columns: Large Graph Card */}
        <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 font-sans flex items-center gap-1.5">
              <Network className="w-4 h-4 text-blue-600" />
              <span>CONNECTED MONEY NETWORK</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Click node to inspect person</span>
          </div>

          <NetworkGraph
            nodes={nodes}
            edges={edges}
            onSelectAccount={handleNodeClick}
            highlightCycle={cycleHighlightPath}
          />
        </div>

        {/* Right 1 Column: Why is this suspicious? */}
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 font-sans flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Why is this suspicious?</span>
            </h3>

            <div className="space-y-2 text-xs font-medium text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Several people sent money to Vikram</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Similar amounts were transferred</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Money moved again within minutes</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Money eventually returned to Rahul</span>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-900">Risk Score:</span>
              <span className="text-xs font-bold text-rose-700 font-mono">94 / 100 Critical Risk</span>
            </div>

            <button
              onClick={handleCreateCase}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Create Case</span>
            </button>
          </div>
        </div>
      </div>

      {/* Node Click Side Drawer */}
      {selectedAccountInfo && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-200/80 shadow-2xl z-50 flex flex-col justify-between p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-400">PERSON DETAILS</span>
                <h3 className="text-sm font-bold text-slate-900">{selectedAccountInfo.name}</h3>
              </div>
              <button
                onClick={() => setSelectedPersonNode(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <RiskGauge score={selectedAccountInfo.risk_score} level={selectedAccountInfo.risk_level} size={110} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="block text-[9px] text-slate-400 uppercase font-bold">Received</span>
                <span className="font-mono font-bold text-emerald-700">₹{selectedAccountInfo.received.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="block text-[9px] text-slate-400 uppercase font-bold">Sent</span>
                <span className="font-mono font-bold text-rose-700">₹{selectedAccountInfo.sent.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Why flagged?</span>
              {selectedAccountInfo.reasons.map((r, i) => (
                <div key={i} className="p-2 bg-slate-50 rounded-md border border-slate-200/80 flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              onSelectAccount(selectedAccountInfo.name);
              setSelectedPersonNode(null);
            }}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors shadow-2xs"
          >
            <span>View Network</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
