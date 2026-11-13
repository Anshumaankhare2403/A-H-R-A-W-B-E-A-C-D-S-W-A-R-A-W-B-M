import mqtt from 'mqtt';
import config from './environment.js';

let client = null;

export function getMqttClient(customBrokerUrl = null, options = {}) {
  if (client && client.connected) {
    return client;
  }

  const brokerUrl = customBrokerUrl || config.mqtt.brokerUrl;
  const clientOptions = {
    clientId: config.mqtt.clientId,
    clean: true,
    connectTimeout: config.mqtt.connectTimeout,
    reconnectPeriod: config.mqtt.reconnectPeriod,
    ...options
  };

  console.log(`[MQTT] Connecting to broker at ${brokerUrl}...`);
  client = mqtt.connect(brokerUrl, clientOptions);

  client.on('connect', () => {
    console.log(`[MQTT] Successfully connected to broker (${brokerUrl})`);
  });

  client.on('reconnect', () => {
    console.warn('[MQTT] Attempting to reconnect to broker...');
  });

  client.on('offline', () => {
    console.warn('[MQTT] Broker connection went offline');
  });

  client.on('error', (err) => {
    console.error(`[MQTT] Broker error: ${err.message}`);
  });

  return client;
}

export function closeMqttClient() {
  return new Promise((resolve) => {
    if (!client) return resolve();
    client.end(false, () => {
      console.log('[MQTT] Client disconnected cleanly');
      client = null;
      resolve();
    });
  });
}

export default { getMqttClient, closeMqttClient };
