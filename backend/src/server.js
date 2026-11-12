import http from 'http';
import createApp from './app.js';
import config from './config/environment.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { disconnectMqtt } from './config/mqtt.js';
import { initSocket } from './sockets/socketHandler.js';
import { startMqttService } from './services/mqttService.js';

async function startServer() {
  console.log('====================================================');
  console.log(' Starting Hybrid Anti-Camera Detection Backend...  ');
  console.log('====================================================');

  // 1. Connect MongoDB
  try {
    await connectDatabase();
  } catch (dbErr) {
    console.error('[Startup Warning] MongoDB connection failed:', dbErr.message);
    console.warn('[Startup Warning] Server will start, but database-dependent operations will fail until MongoDB is available.');
  }

  // 2. Create Express App & HTTP Server
  const app = createApp();
  const server = http.createServer(app);

  // 3. Initialize Socket.IO
  initSocket(server, config.corsOrigin);
  console.log('[Socket.IO] Server initialized and listening for events.');

  // 4. Start MQTT Subscriber Service
  try {
    startMqttService();
  } catch (mqttErr) {
    console.error('[Startup Warning] MQTT initialization warning:', mqttErr.message);
  }

  // 5. Start HTTP Server Listening
  server.listen(config.port, () => {
    console.log(`[HTTP Server] Backend API running at http://localhost:${config.port}`);
    console.log(`[HTTP Server] Health check available at http://localhost:${config.port}/api/health`);
    console.log(`[Configuration] RF Threshold: ${config.rfThreshold}`);
    console.log(`[Configuration] Environment: ${config.nodeEnv}`);
  });

  // Graceful Shutdown
  const handleShutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Commencing graceful shutdown...`);

    server.close(() => {
      console.log('[HTTP Server] HTTP connections closed.');
    });

    try {
      await disconnectMqtt();
      await disconnectDatabase();
      console.log('[Server] Graceful shutdown completed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('[Server] Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  return { app, server };
}

// Start if executed directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  startServer().catch((err) => {
    console.error('[Fatal Error] Failed to start server:', err);
    process.exit(1);
  });
}

export { startServer };
export default startServer;

