import { getMqttClient, connectMqtt } from '../config/mqtt.js';
import config from '../config/environment.js';
import { processTelemetry } from './telemetryService.js';

export function startMqttService(client = null) {
  const mqttClient = client || getMqttClient() || connectMqtt();

  const telemetryTopic = config.mqtt.topics.telemetry;
  const statusTopic = config.mqtt.topics.status;

  const subscribeToTopics = () => {
    mqttClient.subscribe([telemetryTopic, statusTopic], { qos: 1 }, (err, granted) => {
      if (err) {
        console.error(`[MQTT Service] Subscription error for topics: ${err.message}`);
      } else {
        console.log(`[MQTT Service] Subscribed to topics:`, granted.map((g) => g.topic).join(', '));
      }
    });
  };

  if (mqttClient.connected) {
    subscribeToTopics();
  } else {
    mqttClient.on('connect', subscribeToTopics);
  }

  // Handle incoming messages
  mqttClient.on('message', async (topic, payloadBuffer) => {
    const messageStr = payloadBuffer.toString();
    console.log(`[MQTT Service] Message received on [${topic}]: ${messageStr}`);

    try {
      // 1. JSON parsing validation
      let payload;
      try {
        payload = JSON.parse(messageStr);
      } catch (jsonErr) {
        console.warn(`[MQTT Service] Corrupted JSON received on topic "${topic}". Discarding.`);
        return;
      }

      // Check if topic is telemetry
      // Format: anticamera/{deviceId}/telemetry
      const parts = topic.split('/');
      const topicType = parts[2];
      const topicDeviceId = parts[1];

      if (topicType === 'telemetry') {
        // If payload lacks deviceId, adopt from topic
        if (!payload.deviceId && topicDeviceId) {
          payload.deviceId = topicDeviceId;
        }

        await processTelemetry(payload);
        console.log(`[MQTT Service] Successfully ingested telemetry for device: ${payload.deviceId}`);
      } else if (topicType === 'status') {
        console.log(`[MQTT Service] Device status message received for ${topicDeviceId}:`, payload);
      }
    } catch (err) {
      console.error(`[MQTT Service] Error processing message from [${topic}]:`, err.message);
      // Backend does NOT crash; error is logged and contained
    }
  });

  return mqttClient;
}

export function publishCommand(deviceId, command) {
  const client = getMqttClient();
  if (!client || !client.connected) {
    throw new Error('MQTT client is not connected');
  }

  const topic = `anticamera/${deviceId}/commands`;
  const message = JSON.stringify(command);

  return new Promise((resolve, reject) => {
    client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) reject(err);
      else resolve({ topic, message });
    });
  });
}

export default {
  startMqttService,
  publishCommand
};

