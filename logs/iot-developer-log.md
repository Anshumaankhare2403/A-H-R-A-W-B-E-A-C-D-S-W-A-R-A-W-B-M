# IoT and MQTT Developer Log
**Role:** IoT and MQTT Developer
**Project:** Hybrid Anti-Camera Detection System

---

## Log Entries

### [2026-11-12 14:32:00] - Circuit & Firmware Inspection
- **Task:** Inspect existing Wokwi simulator project (URL: https://wokwi.com/projects/462265376283578369).
- **Findings:**
  - Circuit contains ESP32 DevKit C v4, Potentiometer on GPIO 34, Pushbutton on GPIO 33, Red LED on GPIO 25, Yellow LED on GPIO 26, Green LED on GPIO 27, Buzzer on GPIO 14, SSD1306 OLED on GPIO 21 (SDA) and GPIO 22 (SCL).
  - Standalone `main.py` lacked networking and MQTT capabilities.

### [2026-11-12 14:41:00] - MQTT Broker & Subscriber Architecture
- **Task:** Configure Mosquitto broker specification and backend subscriber service.
- **Files Created:**
  - `mosquitto/mosquitto.conf`: Configuration enabling port 1883, logging, and persistence.
  - `docker-compose.yml`: Compose definition for MongoDB and Mosquitto.
  - `backend/src/config/mqtt.js`: MQTT.js client lifecycle manager.
  - `backend/src/services/mqttService.js`: Subscriber listening on `anticamera/+/telemetry` and `anticamera/+/status`. Includes JSON parse recovery to prevent unhandled exceptions.

### [2026-11-12 14:44:00] - MicroPython Firmware Implementation (Wokwi ESP32)
- **Task:** Write complete upgraded MicroPython firmware for the Wokwi ESP32 simulation.
- **Files Created:**
  - `iot/wokwi-esp32/main.py`: Full MicroPython firmware with:
    - Preserved GPIO pins (34, 33, 25, 26, 27, 14, 21, 22).
    - Auto-reconnect loop for Wi-Fi (`Wokwi-GUEST`) and MQTT (`host.wokwi.internal:1883`).
    - Local risk calculation matching backend logic.
    - SSD1306 OLED display updates showing live RF value, networking state, and status string.
    - Status LEDs and buzzer actuation.
    - Telemetry publishing every 5 seconds to `anticamera/esp32_dev01/telemetry`.
    - Downlink command subscription on `anticamera/esp32_dev01/commands`.
  - `iot/wokwi-esp32/umqtt/simple.py`: Self-contained portable MQTT client to avoid import errors in simulator.
  - `iot/wokwi-esp32/README.md`: Setup guide explaining Private IoT Gateway and public broker fallback methods.
  - `iot/test-publisher.js`: Standalone Node.js test harness for running automated multi-scenario MQTT telemetry streams.
- **Status:** Complete.
