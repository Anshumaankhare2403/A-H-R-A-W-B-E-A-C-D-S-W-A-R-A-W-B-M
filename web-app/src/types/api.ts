export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationMeta;
  message?: string;
  error?: {
    message: string;
    statusCode: number;
  };
}

export interface HealthResponse {
  success: boolean;
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
  dependencies: {
    database: {
      type: string;
      status: 'connected' | 'disconnected';
    };
    mqttBroker: {
      url: string;
      status: 'connected' | 'disconnected';
    };
  };
  configuration: {
    rfThreshold: number;
    environment: string;
  };
}

