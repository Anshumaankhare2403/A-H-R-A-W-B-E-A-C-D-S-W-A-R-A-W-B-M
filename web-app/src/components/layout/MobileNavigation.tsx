import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  Cpu,
  History,
  ShieldAlert,
  BarChart3,
  Settings,
  X,
  Terminal,
  Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const navItems = [
    { to: '/', label: 'Overview', code: '01', icon: LayoutDashboard },
    { to: '/monitoring', label: 'Live RF & Wi-Fi', code: '02', icon: Radio },
    { to: '/devices', label: 'Sensor Nodes', code: '03', icon: Cpu },
    { to: '/history', label: 'Audit History', code: '04', icon: History },
    { to: '/alerts', label: 'Threat Incidents', code: '05', icon: ShieldAlert },
    { to: '/analytics', label: 'Signal Analytics', code: '06', icon: BarChart3 },
    { to: '/simulator', label: 'Wokwi & Attack Lab', code: '07', icon: Zap },
    { to: '/settings', label: 'Calibration & Config', code: '08', icon: Settings }
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000000]/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-64 max-w-[80vw] h-full bg-[#0b0e14] border-r border-[#1a2233] p-4 flex flex-col z-10 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-[#1a2233] mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded border border-[#2d3a52] bg-[#141b27] flex items-center justify-center text-cyan-400">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold text-slate-100">
                SPECTRA<span className="text-cyan-400">·SOC</span>
              </span>
              <span className="text-[9px] text-slate-400 tracking-tight">
                HYBRID RF/Wi-Fi
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#151c28]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 rounded text-xs transition-colors',
                  isActive
                    ? 'bg-[#141c2a] text-cyan-300 font-bold border-l-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111722]'
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
              <span className="text-[10px] text-slate-400">{item.code}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-3 border-t border-[#1a2233] text-[10px] text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Broker:</span>
            <span className="text-slate-300">127.0.0.1:1883</span>
          </div>
          <div className="flex justify-between">
            <span>Threshold:</span>
            <span className="text-amber-400">2000 ADC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
