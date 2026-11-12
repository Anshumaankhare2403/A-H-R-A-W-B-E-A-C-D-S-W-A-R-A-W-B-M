import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useTelemetry(params?: {
  deviceId?: string;
  riskLevel?: string;
  anomaly?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['telemetry', params],
    queryFn: () => api.getTelemetry(params),
    refetchInterval: 15000
  });
}

export function useDeviceTelemetry(deviceId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['device-telemetry', deviceId, params],
    queryFn: () => api.getDeviceTelemetry(deviceId, params),
    enabled: Boolean(deviceId)
  });
}

