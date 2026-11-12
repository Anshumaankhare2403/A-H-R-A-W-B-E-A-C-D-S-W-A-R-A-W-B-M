import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import TopNavbar from './TopNavbar';
import MobileNavigation from './MobileNavigation';
import { useSocketIntegration } from '../../hooks/useSocket';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Operations Overview',
  '/monitoring': 'Live RF Telemetry & Wi-Fi Reconnaissance',
  '/devices': 'Connected Sensor Nodes',
  '/history': 'Telemetry Audit Log',
  '/alerts': 'Incident Response & Alerts',
  '/analytics': 'Signal Analytics & Spectra',
  '/simulator': 'Wokwi Simulator & Attack Injection Lab',
  '/settings': 'Calibration & Node Configuration'
};

export const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  // Activate WebSocket connection lifecycle
  useSocketIntegration();

  const currentTitle = PAGE_TITLES[location.pathname] || 'System Console';

  return (
    <div className="min-h-screen flex bg-[#080a0f] text-slate-200 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Desktop Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile Drawer */}
      <MobileNavigation
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-grid-pattern">
        <TopNavbar
          onOpenMobileNav={() => setMobileNavOpen(true)}
          pageTitle={currentTitle}
        />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6">
          <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
