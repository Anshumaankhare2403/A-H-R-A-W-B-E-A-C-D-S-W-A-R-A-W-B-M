import net from 'net';
import aedes from 'aedes';

const PORT = parseInt(process.env.MQTT_PORT, 10) || 1883;
const aedesServer = aedes();
const server = net.createServer(aedesServer.handle);

server.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(` Local MQTT Broker (Aedes) running on port ${PORT}`);
  console.log(' Ready for ESP32 and Backend connections.');
  console.log('====================================================');
});

aedesServer.on('client', (client) => {
  console.log(`[MQTT Broker] Client connected: ${client ? client.id : 'unknown'}`);
});

aedesServer.on('clientDisconnect', (client) => {
  console.log(`[MQTT Broker] Client disconnected: ${client ? client.id : 'unknown'}`);
});

aedesServer.on('publish', (packet, client) => {
  if (client) {
    console.log(`[MQTT Broker] Packet published by ${client.id} on [${packet.topic}]`);
  }
});

