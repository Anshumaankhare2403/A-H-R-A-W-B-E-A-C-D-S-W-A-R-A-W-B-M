# System Architecture
## Hybrid RF & Wi-Fi Embedded Anti-Camera Detection System
**Milestone 1 Architecture & Technical Specification**

The system bridges simulated IoT hardware (Wokwi ESP32), an enterprise MQTT messaging layer, and a Node.js Express backend with MongoDB persistence and real-time Socket.IO broadcasts:

```text
  +-----------------------------------------------------------+
  |                      WOKWI SIMULATOR                      |
  |  +--------------------+          +---------------------+  |
  |  | RF Sensor (GPIO34) |          | Button (GPIO33)     |  |
  |  +---------+----------+          +----------+----------+  |
  |            |                                |             |
  |            v                                v             |
  |               +-------------------------+                 |
  |               |  ESP32 MicroPython Core |                 |
  |               +------------+------------+                 |
  |                            |                              |
  |        +-------------------+-------------------+          |
  |        v                   v                   v          |
  |  +-----------+       +-----------+       +-----------+    |
  |  | LEDs /    |       | SSD1306   |       | Wi-Fi     |    |
  |  | Buzzer    |       | OLED I2C  |       | Telemetry |    |
  |  +-----------+       +-----------+       +-----+-----+    |
  +------------------------------------------------|----------+
                                                   | MQTT (1883)
                                                   v
                         +-----------------------------------+
                         |      ECLIPSE MOSQUITTO BROKER     |
                         |  Topic: anticamera/+/telemetry    |
                         +-----------------+-----------------+
                                           |
                                           v
                         +-----------------------------------+
                         |       NODE.JS / EXPRESS CORE      |
                         +-----------------+-----------------+
                                           |
                   +-----------------------+-----------------------+
                   |                       |                       |
                   v                       v                       v
         +-------------------+   +-------------------+   +-------------------+
         |    RISK ENGINE    |   |     DATABASE      |   |     SOCKET.IO     |
         +-------------------+   +-------------------+   +-------------------+
                                           |
                                           v
                         +-----------------------------------+
                         |       REST API (HTTP / JSON)      |
                         +-----------------------------------+
```
