import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import socketService from '../services/socket';
import useAppStore from '../store/appStore';
import type { Telemetry } from '../types/telemetry';
import type { Alert } from '../types/alert';

export function useSocketIntegration() {
  const queryClient = useQueryClient();
  const setSocketStatus = useAppStore((s) => s.setSocketStatus);
  const addTelemetry = useAppStore((s) => s.addTelemetry);
  const addLiveAlert = useAppStore((s) => s.addLiveAlert);

  useEffect(() => {
    // 1. Establish connection
    socketService.connect();

    // 2. Track connection status
    const unsubStatus = socketService.onStatusChange((status) => {
      setSocketStatus(status);
    });

    // 3. Listen to incoming live telemetry
    const unsubTelemetry = socketService.onTelemetry((telemetry: Telemetry) => {
      addTelemetry(telemetry);
      queryClient.setQueryData(['device-latest', telemetry.deviceId], {
        success: true,
        data: telemetry
      });
    });

    // 4. Listen to alerts
    const unsubAlert = socketService.onAlert((alert: Alert) => {
      addLiveAlert(alert);
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    });

    // 5. Cleanup on unmount
    return () => {
      unsubStatus();
      unsubTelemetry();
      unsubAlert();
    };
  }, [setSocketStatus, addTelemetry, addLiveAlert, queryClient]);
}

export default useSocketIntegration;
