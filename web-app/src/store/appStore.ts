import { create } from 'zustand';
import type { Telemetry } from '../types/telemetry';
import type { Alert } from '../types/alert';
import type { SocketStatus } from '../services/socket';

interface AppState {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  socketStatus: SocketStatus;
  setSocketStatus: (status: SocketStatus) => void;

  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;

  latestTelemetry: Record<string, Telemetry>;
  telemetryStream: Telemetry[];
  addTelemetry: (data: Telemetry) => void;

  liveAlerts: Alert[];
  addLiveAlert: (alert: Alert) => void;
  clearLiveAlerts: () => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('anticamera_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  }
  return 'dark';
};

export const useAppStore = create<AppState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem('anticamera_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('anticamera_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: nextTheme };
    }),

  socketStatus: 'disconnected',
  setSocketStatus: (socketStatus) => set({ socketStatus }),

  selectedDeviceId: 'esp32_dev01',
  setSelectedDeviceId: (selectedDeviceId) => set({ selectedDeviceId }),

  latestTelemetry: {},
  telemetryStream: [],
  addTelemetry: (data) =>
    set((state) => {
      const updatedLatest = {
        ...state.latestTelemetry,
        [data.deviceId]: data
      };

      const nextStream = [...state.telemetryStream, data].slice(-35);

      return {
        latestTelemetry: updatedLatest,
        telemetryStream: nextStream
      };
    }),

  liveAlerts: [],
  addLiveAlert: (alert) =>
    set((state) => ({
      liveAlerts: [alert, ...state.liveAlerts].slice(0, 20)
    })),
  clearLiveAlerts: () => set({ liveAlerts: [] })
}));

export default useAppStore;
