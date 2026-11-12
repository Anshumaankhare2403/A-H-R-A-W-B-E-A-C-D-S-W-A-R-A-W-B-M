# Wokwi ESP32 Anti-Camera Detection Simulator & Firmware

This folder contains the MicroPython firmware, circuit diagram, and hardware configuration for the **Hybrid RF and Wi-Fi Based Embedded Anti-Camera Detection System**.

- **Wokwi Project URL:** [https://wokwi.com/projects/462265376283578369](https://wokwi.com/projects/462265376283578369)
- **Target Platform:** ESP32 DevKit C v4
- **Runtime:** MicroPython v1.22.0

---

## 1. Preserved Hardware & GPIO Configuration

| Component | Hardware Part | ESP32 GPIO | Description / Mode |
|---|---|---|---|
| **RF Sensor Simulator** | Potentiometer (`pot1`) | **GPIO 34** | ADC1_CH6, 11dB attenuation (0 - 4095) |
| **Manual Alert Button** | Pushbutton (`camBtn`) | **GPIO 33** | Active LOW, internal pull-up enabled |
| **Red LED** | Discrete LED (`redLed`) | **GPIO 25** | High-risk indicator / camera detected |
| **Yellow LED** | Discrete LED (`yellowLed`) | **GPIO 26** | Medium-risk indicator (RF anomaly) |
| **Green LED** | Discrete LED (`greenLed`) | **GPIO 27** | Low-risk / Safe status indicator |
| **Warning Buzzer** | Piezo Buzzer (`bz1`) | **GPIO 14** | Audible alarm on HIGH risk |
| **OLED SDA** | SSD1306 Display (`oled1`) | **GPIO 21** | I2C Data bus |
| **OLED SCL** | SSD1306 Display (`oled1`) | **GPIO 22** | I2C Clock bus |

---

## 2. Firmware Features

1. **Dual Risk Assessment:**
   - Evaluates analog RF potentiometer signal against configurable `RF_THRESHOLD = 2000`.
   - Inspects simulated Wi-Fi networks for suspicious camera keywords (`spycam`, `camera`, `hidden`, `surveillance`, `monitor`).
   - Detects physical pushbutton press for immediate user-flagged camera detection.
2. **Audio-Visual Actuation:**
   - Real-time LED status switching (`SAFE` -> Green, `LOW` -> Green, `MEDIUM` -> Yellow, `HIGH` -> Red).
   - Buzzer chirp on HIGH risk states.
   - 128x64 OLED displaying live RF value, networking state, and risk classification.
3. **MQTT Telemetry Ingestion:**
   - Publishes structured JSON every 5 seconds to `anticamera/esp32_dev01/telemetry`.
   - Connects to Wi-Fi AP `Wokwi-GUEST`.
   - Automatic reconnect logic for Wi-Fi and MQTT.
   - Listens on `anticamera/esp32_dev01/commands` for remote control actions.

---

## 3. Connecting Wokwi to Local Mosquitto

To bridge Wokwi (running in your browser) to your local backend and Mosquitto broker:

### Method A: Wokwi Private IoT Gateway (Recommended for Local Dev)
1. Install the [Wokwi Private IoT Gateway](https://docs.wokwi.com/guides/private-iot-gateway) on your host machine.
2. Run the gateway application (`wokwi-gateway`).
3. In `main.py`, configure:
   ```python
   MQTT_BROKER = "host.wokwi.internal"
   MQTT_PORT = 1883
   ```
4. Start simulation in Wokwi. The ESP32 will resolve `host.wokwi.internal` directly to your local computer's port 1883!

### Method B: Public/Hosted MQTT Broker (Zero-Install Alternative)
If the Wokwi Private Gateway is unavailable in your environment:
1. In `iot/wokwi-esp32/main.py` and `backend/.env`, set:
   ```python
   MQTT_BROKER = "broker.hivemq.com" # or "broker.emqx.io"
   MQTT_PORT = 1883
   ```
2. Both Wokwi and the local Node.js backend can communicate across the public broker topic namespace securely using unique client IDs.

---

## 4. Scientific Limitation Disclaimer
> [!IMPORTANT]
> RF anomalies and Wi-Fi SSID heuristic keywords are statistical screening indicators, not conclusive forensic proof of a concealed recording device. False positives (e.g., microwave ovens, legitimate cameras) and false negatives (e.g., hardwired analog cameras) can occur.

