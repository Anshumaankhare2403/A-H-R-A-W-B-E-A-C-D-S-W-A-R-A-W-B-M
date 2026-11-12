import React, { useState, useEffect } from 'react';
import { Menu, Bell, Sun, Moon, Shield } from 'lucide-react';
import useAppStore from '../../store/appStore';
import { cn } from '../../utils/cn';

interface TopNavbarProps {
  onOpenMobileNav: () => void;
  pageTitle: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenMobileNav, pageTitle }) => {
  const { theme, toggleTheme, socketStatus, liveAlerts, selectedDeviceId, setSelectedDeviceId } = useAppStore();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentUtc, setCurrentUtc] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentUtc(
        now.toISOString().slice(11, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unacknowledgedCount = liveAlerts.filter((a) => !a.acknowledged).length;

  return (
    <header className="h-14 border-b border-[#1a2233] bg-[#0b0e14] px-4 sm:px-5 flex items-center justify-between sticky top-0 z-10 select-none">
      {/* Left: Mobile Nav & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-[#151c28]"
          aria-label="Open Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>CONSOLE</span>
            <span className="text-slate-400">/</span>
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-slate-100 flex items-center gap-2">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: Technical Telemetry Strip */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Node Selector */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono bg-[#10151f] px-2.5 py-1 rounded border border-[#1d273a]">
          <span className="text-slate-400 text-[10px]">NODE:</span>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer"
          >
            <option value="esp32_dev01" className="bg-[#0b0e14] text-slate-200">esp32_dev01</option>
            <option value="esp32_dev02" className="bg-[#0b0e14] text-slate-200">esp32_dev02</option>
          </select>
        </div>

        {/* Real-time Link Status Pill */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium border',
            socketStatus === 'connected' &&
              'bg-[#081a14] border-[#104d35] text-emerald-400',
            socketStatus === 'connecting' &&
              'bg-[#1e1507] border-[#5e3e0c] text-amber-400',
            socketStatus === 'disconnected' &&
              'bg-[#200b0d] border-[#571920] text-rose-400'
          )}
          title={`Socket connection state: ${socketStatus}`}
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              socketStatus === 'connected' ? 'bg-emerald-400' : socketStatus === 'connecting' ? 'bg-amber-400 animate-ping' : 'bg-rose-500'
            )}
          />
          <span className="tracking-tight uppercase">
            {socketStatus === 'connected' ? 'WS·ONLINE' : socketStatus === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
          </span>
        </div>

        {/* Dual Clocks (Local / UTC) */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-[#10151f] px-2.5 py-1 rounded border border-[#1d273a]">
          <span className="text-slate-300 font-semibold">{currentTime}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-400">{currentUtc}</span>
        </div>

        {/* Unread Alert Bell */}
        <div className="relative p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-[#151c28] transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          {unacknowledgedCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </div>

        {/* Minimal Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-[#151c28] transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
