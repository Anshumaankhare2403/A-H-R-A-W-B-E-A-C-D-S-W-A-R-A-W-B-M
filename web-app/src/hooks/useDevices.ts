import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useDevices(params?: { page?: number; limit?: number; status?: string; risk?: string }) {
  return useQuery({
    queryKey: ['devices', params],
    queryFn: () => api.getDevices(params),
    refetchInterval: 10000 // Polling fallback in case sockets are quiet
  });
}

export function useDevice(deviceId: string) {
  return useQuery({
    queryKey: ['device', deviceId],
    queryFn: () => api.getDeviceById(deviceId),
    enabled: Boolean(deviceId)
  });
}

export function useDeviceLatest(deviceId: string) {
  return useQuery({
    queryKey: ['device-latest', deviceId],
    queryFn: () => api.getDeviceLatest(deviceId),
    enabled: Boolean(deviceId),
    refetchInterval: 5000
  });
}

