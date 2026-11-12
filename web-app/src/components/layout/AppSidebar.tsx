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
  ChevronLeft,
  ChevronRight,
  Terminal,
  Activity,
  Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';
import useAppStore from '../../store/appStore';

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { socketStatus, selectedDeviceId } = useAppStore();

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
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-[#1a2233] bg-[#0b0e14] transition-all duration-200 select-none z-20 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-[#1a2233] bg-[#0e121a]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded border border-[#2d3a52] bg-[#141b27] flex items-center justify-center flex-shrink-0 text-cyan-400">
            <Terminal className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-xs font-bold tracking-wider text-slate-100 uppercase truncate">
                SPECTRA<span className="text-cyan-400">·SOC</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
                HYBRID RF/Wi-Fi
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#182130] transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Telemetry Modules
          </div>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-colors group relative',
                isActive
                  ? 'bg-[#141c2a] text-cyan-300 font-semibold border-l-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#111722]'
              )
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && (
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="truncate">{item.label}</span>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-400">
                  {item.code}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>

      {/* Hardware Node Status Footer */}
      {!collapsed ? (
        <div className="p-3 border-t border-[#1a2233] bg-[#0c1017]">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  socketStatus === 'connected' ? 'bg-emerald-400' : 'bg-rose-500'
                )}
              />
              NODE LINK
            </span>
            <span className="text-slate-300 font-bold">{selectedDeviceId}</span>
          </div>
          <div className="space-y-1 text-[10px] font-mono text-slate-400 bg-[#080b10] p-2 rounded border border-[#171e2c]">
            <div className="flex justify-between">
              <span>MQTT Broker:</span>
              <span className="text-slate-300">127.0.0.1:1883</span>
            </div>
            <div className="flex justify-between">
              <span>Sampling:</span>
              <span className="text-slate-300">5000 ms</span>
            </div>
            <div className="flex justify-between">
              <span>Threshold:</span>
              <span className="text-amber-400 font-semibold">2000 ADC</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-[#1a2233] flex justify-center">
          <Activity
            className={cn(
              'w-4 h-4',
              socketStatus === 'connected' ? 'text-emerald-400' : 'text-rose-400'
            )}
          />
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
