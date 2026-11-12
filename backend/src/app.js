import express from 'express';
import cors from 'cors';
import config from './config/environment.js';
import { isDatabaseConnected } from './config/database.js';
import { isMqttConnected } from './config/mqtt.js';
import deviceRoutes from './routes/deviceRoutes.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Global Middleware
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root Welcome & Discovery Route
  app.get('/', (req, res) => {
    res.json({
      success: true,
      service: 'Hybrid Anti-Camera Detection Backend API',
      version: '1.0.0',
      status: 'operational',
      endpoints: {
        health: '/api/health',
        devices: '/api/devices',
        telemetry: '/api/telemetry',
        alerts: '/api/alerts'
      }
    });
  });

  // Health Check Endpoint
  app.get('/api/health', (req, res) => {
    const mongoStatus = isDatabaseConnected() ? 'connected' : 'disconnected';
    const mqttStatus = isMqttConnected() ? 'connected' : 'disconnected';

    res.json({
      success: true,
      service: 'Hybrid Anti-Camera Detection Backend',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      dependencies: {
        database: {
          type: 'MongoDB',
          status: mongoStatus
        },
        mqttBroker: {
          url: config.mqtt.brokerUrl,
          status: mqttStatus
        }
      },
      configuration: {
        rfThreshold: config.rfThreshold,
        environment: config.nodeEnv
      }
    });
  });

  // Mount API Endpoints
  app.use('/api/devices', deviceRoutes);
  app.use('/api/telemetry', telemetryRoutes);
  app.use('/api/alerts', alertRoutes);

  // Fallback 404 and Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;

