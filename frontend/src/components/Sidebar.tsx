import React from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Network, 
  Users, 
  ArrowLeftRight, 
  Briefcase, 
  Activity, 
  Play, 
  ShieldCheck,
  Settings,
  HelpCircle
} from 'lucide-react';
import { simulationService } from '../services/api';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onDemoInjected?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, onDemoInjected }) => {
  const navItems = [
    { id: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: '/alerts', label: 'Alerts', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: '/investigation/ALT-DEMO-001', label: 'Investigate', icon: <Network className="w-3.5 h-3.5" /> },
    { id: '/accounts', label: 'Accounts', icon: <Users className="w-3.5 h-3.5" /> },
    { id: '/transactions', label: 'Transactions', icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
    { id: '/cases', label: 'Cases', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: '/live', label: 'Live Monitoring', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  const handleStartDemo = async () => {
    try {
      const res = await simulationService.injectDemo();
      if (onDemoInjected) onDemoInjected();
      if (res.primary_alert) {
        onNavigate(`/investigation/${res.primary_alert.alert_id}`);
      } else {
        onNavigate('/investigation/ALT-DEMO-001');
      }
    } catch {
      onNavigate('/investigation/ALT-DEMO-001');
    }
  };

  return (
    <aside className="w-52 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 z-40 select-none shadow-2xs">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-600">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-slate-900 font-sans flex items-center gap-1">
              FraudGraph <span className="text-blue-600 text-[10px] font-semibold px-1 py-0.2 bg-blue-50 rounded">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Financial Intelligence</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = currentPath === item.id || currentPath.startsWith(item.id.split('/')[1] ? `/${item.id.split('/')[1]}` : '---');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-slate-100 font-bold text-slate-900'
                    : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-slate-200/80 space-y-2">
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
            <Play className="w-3 h-3 text-blue-600 fill-blue-600" />
            <span>Demo Mode</span>
          </div>
          <button
            onClick={handleStartDemo}
            className="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] rounded-md flex items-center justify-center gap-1 transition-colors shadow-2xs"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Start Demo</span>
          </button>
        </div>

        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
          <button className="flex items-center gap-1 hover:text-slate-900 transition-colors">
            <Settings className="w-3 h-3" />
            <span>Settings</span>
          </button>
          <button className="flex items-center gap-1 hover:text-slate-900 transition-colors">
            <HelpCircle className="w-3 h-3" />
            <span>Help</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
