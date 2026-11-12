# Wokwi ESP32 IoT Simulation Setup Guide
## Hybrid Anti-Camera Detection System

This guide outlines how to load, run, and connect the ESP32 Wokwi simulation to your local backend.

- **Direct Wokwi Link:** [https://wokwi.com/projects/462265376283578369](https://wokwi.com/projects/462265376283578369)

---

## 1. Hardware Pinout Reference

Preserve these pin configurations exactly:

| Part | Description | ESP32 GPIO | Diagram Label |
|---|---|---|---|
| Potentiometer | RF Signal Simulator | GPIO 34 | `pot1:SIG` -> `esp:34` |
| Pushbutton | Camera Detected Trigger | GPIO 33 | `camBtn:1.l` -> `esp:33` |
| Red LED | High Risk / Cam Alert | GPIO 25 | `redLed:A` -> `esp:25` |
| Yellow LED | Medium Risk (RF Anomaly) | GPIO 26 | `yellowLed:A` -> `esp:26` |
| Green LED | Safe / Low Risk | GPIO 27 | `greenLed:A` -> `esp:27` |
| Buzzer | Audio Alarm on HIGH Risk | GPIO 14 | `bz1:1` -> `esp:14` |
| SSD1306 OLED | I2C Data (SDA) | GPIO 21 | `oled1:SDA` -> `esp:21` |
| SSD1306 OLED | I2C Clock (SCL) | GPIO 22 | `oled1:SCL` -> `esp:22` |

---

## 2. Setting Up MicroPython Firmware in Wokwi

1. Open your Wokwi project at [https://wokwi.com/projects/462265376283578369](https://wokwi.com/projects/462265376283578369).
2. Copy the contents of `iot/wokwi-esp32/main.py` into the editor tab `main.py`.
3. Verify that `diagram.json` matches `iot/wokwi-esp32/diagram.json`.
4. Ensure `ssd1306.py` is present in the project tabs.
5. Create a tab named `umqtt/simple.py` and paste the contents of `iot/wokwi-esp32/umqtt/simple.py`.

---

## 3. Network Connectivity Modes

### Option A: Local Broker with Wokwi Private IoT Gateway
To stream MQTT packets from the browser-based Wokwi simulator to a local broker running on your machine:
1. Download and run the [Wokwi Private IoT Gateway](https://docs.wokwi.com/guides/private-iot-gateway).
2. In `main.py`, maintain:
   ```python
   MQTT_BROKER = "host.wokwi.internal"
   MQTT_PORT = 1883
   ```
3. Start the Wokwi simulation. The ESP32 connects to `Wokwi-GUEST` Wi-Fi, tunnels through the local gateway, and delivers MQTT telemetry to your local Mosquitto or development broker on port 1883.

### Option B: Zero-Install Public Test Broker
If you do not run the Wokwi Private IoT Gateway:
1. In `iot/wokwi-esp32/main.py` and `backend/.env`, set:
   ```python
   MQTT_BROKER = "broker.hivemq.com"
   MQTT_PORT = 1883
   ```
2. Start both the simulation and the backend. Both nodes connect to the shared public broker on the `anticamera/esp32_dev01/*` topic namespace.

---

## 4. Testing Hardware Controls in Wokwi

1. **RF Potentiometer (`pot1`):**
   - Drag slider below 50% (< 2000): Normal baseline. Status is `LOW RISK` or `SAFE`.
   - Drag slider above 50% (> 2000): RF Anomaly triggered. If suspicious SSID exists in mock list, turns Red LED and beeps Buzzer (`HIGH RISK`).
2. **Pushbutton (`camBtn`):**
   - Click and hold pushbutton: Triggers manual camera detection (`CAM DETECTED`). Red LED lights up and Buzzer chirps immediately regardless of RF slider position.
3. **OLED Display:**
   - Displays real-time RF integer value, networking state (`NET: OK`), and risk classification.

