import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/environment.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { initSocketIO } from './sockets/socketHandler.js';
import { startMqttSubscriber, stopMqttSubscriber } from './services/mqttService.js';
import deviceRoutes from './routes/deviceRoutes.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.cors.origin }));
  if (config.env !== 'test') {
    app.use(morgan('dev'));
  }
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Backend is running',
      environment: config.env,
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/devices', deviceRoutes);
  app.use('/api/telemetry', telemetryRoutes);
  app.use('/api/alerts', alertRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export async function createServer(options = {}) {
  const app = createApp();
  const server = http.createServer(app);
  const io = initSocketIO(server);

  return { app, server, io };
}

let runningServer = null;

export async function startServer(customPort = null, customMongoUri = null, customMqttUrl = null) {
  const port = customPort || config.port;

  await connectDatabase(customMongoUri);

  const { app, server, io } = await createServer();

  await new Promise((resolve) => {
    runningServer = server.listen(port, () => {
      console.log(`[Server] Anti-Camera Backend running in ${config.env} mode on http://localhost:${port}`);
      resolve();
    });
  });

  if (config.env !== 'test') {
    try {
      startMqttSubscriber(customMqttUrl);
    } catch (mqttErr) {
      console.warn(`[Server] MQTT Subscriber failed to start: ${mqttErr.message}`);
    }
  }

  return { app, server: runningServer, io };
}

export async function stopServer() {
  if (runningServer) {
    await new Promise((resolve) => runningServer.close(resolve));
    runningServer = null;
    console.log('[Server] HTTP server stopped');
  }
  await stopMqttSubscriber();
  await disconnectDatabase();
}

const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('server.js') ||
  process.argv[1].endsWith('server')
);

if (isDirectExecution) {
  startServer().catch((err) => {
    console.error(`[Server] Fatal startup error: ${err.message}`);
    process.exit(1);
  });

  const handleShutdown = async (signal) => {
    console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
    await stopServer();
    process.exit(0);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

export default { createApp, createServer, startServer, stopServer };
