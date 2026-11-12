import mqtt from 'mqtt';
import config from './environment.js';

let mqttClient = null;
let isConnected = false;

export function getMqttClient() {
  return mqttClient;
}

export function isMqttConnected() {
  return isConnected;
}

export function connectMqtt(options = {}) {
  const brokerUrl = options.brokerUrl || config.mqtt.brokerUrl;
  const clientOptions = {
    clientId: options.clientId || config.mqtt.clientId,
    clean: true,
    connectTimeout: 5000,
    reconnectPeriod: 3000,
    keepalive: 60,
    ...options
  };

  if (config.mqtt.username) {
    clientOptions.username = config.mqtt.username;
    clientOptions.password = config.mqtt.password;
  }

  console.log(`[MQTT] Connecting to broker at ${brokerUrl} with Client ID: ${clientOptions.clientId}...`);

  mqttClient = mqtt.connect(brokerUrl, clientOptions);

  mqttClient.on('connect', () => {
    isConnected = true;
    console.log(`[MQTT] Successfully connected to broker at ${brokerUrl}`);
  });

  mqttClient.on('reconnect', () => {
    console.log('[MQTT] Attempting reconnection to MQTT broker...');
  });

  mqttClient.on('close', () => {
    isConnected = false;
    console.warn('[MQTT] Connection closed to MQTT broker.');
  });

  mqttClient.on('offline', () => {
    isConnected = false;
    console.warn('[MQTT] Client went offline.');
  });

  mqttClient.on('error', (err) => {
    isConnected = false;
    console.error(`[MQTT] Error: ${err.message}`);
  });

  return mqttClient;
}

export async function disconnectMqtt() {
  if (mqttClient) {
    return new Promise((resolve) => {
      mqttClient.end(false, () => {
        isConnected = false;
        console.log('[MQTT] Gracefully disconnected from broker.');
        resolve();
      });
    });
  }
}

export default {
  connectMqtt,
  disconnectMqtt,
  getMqttClient,
  isMqttConnected
};

