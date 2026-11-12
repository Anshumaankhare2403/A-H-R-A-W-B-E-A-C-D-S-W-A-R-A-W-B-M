import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/anti_camera',
  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://127.0.0.1:1883',
    clientId: process.env.MQTT_CLIENT_ID || `anticamera_backend_${Math.random().toString(16).substring(2, 10)}`,
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    topics: {
      telemetry: process.env.MQTT_TOPIC_TELEMETRY || 'anticamera/+/telemetry',
      status: process.env.MQTT_TOPIC_STATUS || 'anticamera/+/status',
      alerts: process.env.MQTT_TOPIC_ALERTS || 'anticamera/+/alerts',
      commands: process.env.MQTT_TOPIC_COMMANDS || 'anticamera/+/commands'
    }
  },
  rfThreshold: parseInt(process.env.RF_THRESHOLD, 10) || 2000,
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

export default config;

