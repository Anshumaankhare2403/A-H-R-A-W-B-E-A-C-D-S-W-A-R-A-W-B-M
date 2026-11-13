import { getMqttClient, closeMqttClient } from '../config/mqtt.js';
import config from '../config/environment.js';
import { processTelemetry } from './telemetryService.js';

let client = null;

export function extractDeviceIdFromTopic(topic) {
  const parts = topic.split('/');
  if (parts.length >= 3 && parts[0] === 'anticamera') {
    return parts[1];
  }
  return null;
}

export function startMqttSubscriber(customBrokerUrl = null) {
  client = getMqttClient(customBrokerUrl);

  client.on('connect', () => {
    const topic = config.mqtt.telemetryTopic;
    client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) {
        console.error(`[MQTT Service] Subscription error for ${topic}: ${err.message}`);
      } else {
        console.log(`[MQTT Service] Subscribed to topic: ${topic}`);
      }
    });
  });

  client.on('message', async (topic, messageBuffer) => {
    try {
      const messageString = messageBuffer.toString('utf8');

      let payload;
      try {
        payload = JSON.parse(messageString);
      } catch (parseError) {
        console.warn(`[MQTT Service] Discarded malformed JSON message on topic "${topic}": ${parseError.message}`);
        return;
      }

      if (!payload.deviceId) {
        const topicDeviceId = extractDeviceIdFromTopic(topic);
        if (topicDeviceId) {
          payload.deviceId = topicDeviceId;
        }
      }

      const result = await processTelemetry(payload);
      if (!result.success) {
        console.warn(`[MQTT Service] Telemetry processing failed: ${result.error}`);
      }
    } catch (err) {
      console.error(`[MQTT Service] Unexpected error handling message on ${topic}: ${err.message}`);
    }
  });

  return client;
}

export async function stopMqttSubscriber() {
  await closeMqttClient();
  client = null;
}

export default {
  startMqttSubscriber,
  stopMqttSubscriber,
  extractDeviceIdFromTopic
};
