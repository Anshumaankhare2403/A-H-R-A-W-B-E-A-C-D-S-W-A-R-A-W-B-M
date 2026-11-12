import axios from 'axios';
import type { ApiResponse, HealthResponse } from '../types/api';
import type { Device } from '../types/device';
import type { Telemetry } from '../types/telemetry';
import type { Alert } from '../types/alert';

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  getHealth: async (): Promise<HealthResponse> => {
    const res = await apiClient.get<HealthResponse>('/health');
    return res.data;
  },

  getDevices: async (params?: { page?: number; limit?: number; status?: string; risk?: string }): Promise<ApiResponse<Device[]>> => {
    const res = await apiClient.get<ApiResponse<Device[]>>('/devices', { params });
    return res.data;
  },

  getDeviceById: async (deviceId: string): Promise<ApiResponse<Device>> => {
    const res = await apiClient.get<ApiResponse<Device>>(`/devices/${deviceId}`);
    return res.data;
  },

  getDeviceLatest: async (deviceId: string): Promise<ApiResponse<Telemetry>> => {
    const res = await apiClient.get<ApiResponse<Telemetry>>(`/devices/${deviceId}/latest`);
    return res.data;
  },

  getTelemetry: async (params?: {
    deviceId?: string;
    riskLevel?: string;
    anomaly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Telemetry[]>> => {
    const res = await apiClient.get<ApiResponse<Telemetry[]>>('/telemetry', { params });
    return res.data;
  },

  getDeviceTelemetry: async (deviceId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<Telemetry[]>> => {
    const res = await apiClient.get<ApiResponse<Telemetry[]>>(`/telemetry/${deviceId}`, { params });
    return res.data;
  },

  postTelemetry: async (payload: Partial<Telemetry>): Promise<ApiResponse<{ telemetry: Telemetry }>> => {
    const res = await apiClient.post<ApiResponse<{ telemetry: Telemetry }>>('/telemetry', payload);
    return res.data;
  },

  getAlerts: async (params?: {
    deviceId?: string;
    severity?: string;
    acknowledged?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Alert[]>> => {
    const res = await apiClient.get<ApiResponse<Alert[]>>('/alerts', { params });
    return res.data;
  },

  acknowledgeAlert: async (id: string): Promise<ApiResponse<Alert>> => {
    const res = await apiClient.patch<ApiResponse<Alert>>(`/alerts/${id}/acknowledge`);
    return res.data;
  }
};

export default api;
