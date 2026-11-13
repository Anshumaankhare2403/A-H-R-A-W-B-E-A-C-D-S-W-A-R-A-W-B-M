import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/anticamera_db'
  },
  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    clientId: process.env.MQTT_CLIENT_ID || `anticamera_backend_${Math.random().toString(16).slice(2, 8)}`,
    telemetryTopic: process.env.MQTT_TELEMETRY_TOPIC || 'anticamera/+/telemetry',
    reconnectPeriod: 5000,
    connectTimeout: 30000
  },
  risk: {
    rfThreshold: parseInt(process.env.RF_THRESHOLD || '2000', 10),
    suspiciousKeywords: (process.env.SUSPICIOUS_SSID_KEYWORDS || 'spycam,camera,hidden,surveillance,monitor')
      .split(',')
      .map(kw => kw.trim().toLowerCase())
      .filter(Boolean)
  },
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*'
  }
};

export default config;
