import React from 'react';
import { Search, Bell, Radio } from 'lucide-react';

interface HeaderProps {
  title: string;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onSearch }) => {
  return (
    <header className="h-14 border-b border-slate-200/80 bg-white px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-2xs">
      {/* Left: Page Title & Subtitle */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 tracking-tight font-sans leading-tight">{title}</h2>
        <p className="text-[11px] text-slate-500 font-medium">Monitor suspicious money movement.</p>
      </div>

      {/* Center: Small Search Box */}
      <div className="relative w-64 hidden md:block">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search people, transactions or alerts..."
          onChange={(e) => onSearch && onSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors placeholder:text-slate-400 font-sans"
        />
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-3">
        <span className="hidden lg:inline-flex px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-semibold text-slate-600">
          DEMO ENVIRONMENT
        </span>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700">
          <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
          <span className="font-semibold text-[10px]">Connected</span>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200/80 pl-3">
          <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 relative hover:bg-slate-100 transition-colors cursor-pointer">
            <Bell className="w-3.5 h-3.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1 right-1" />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[11px] text-white shadow-2xs">
              FA
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
