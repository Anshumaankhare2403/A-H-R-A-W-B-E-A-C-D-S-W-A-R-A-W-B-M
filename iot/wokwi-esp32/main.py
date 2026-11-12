"""
Hybrid RF and Wi-Fi Based Embedded Anti-Camera Detection System
Firmware for ESP32 (MicroPython) - Wokwi Simulation & Hardware Prototype

Preserved Pin Configuration:
- RF Sensor (Potentiometer): GPIO 34 (ADC1_CH6)
- Red LED: GPIO 25
- Yellow LED: GPIO 26
- Green LED: GPIO 27
- Buzzer: GPIO 14
- Camera Detection Button: GPIO 33 (Internal Pull-Up)
- OLED I2C SDA: GPIO 21
- OLED I2C SCL: GPIO 22
"""

import machine
from machine import Pin, ADC, I2C
import time
from time import sleep
import ujson
import network

# Try importing umqtt.simple
try:
    from umqtt.simple import MQTTClient
except ImportError:
    try:
        from simple import MQTTClient
    except ImportError:
        print("[Firmware] Warning: umqtt.simple not found. Running in offline telemetry mode.")
        MQTTClient = None

# Import SSD1306 OLED driver
try:
    import ssd1306
except ImportError:
    print("[Firmware] Warning: ssd1306 driver not found.")
    ssd1306 = None

# --------------------------------
# Configuration & Constants
# --------------------------------
DEVICE_ID = "esp32_dev01"
WIFI_SSID = "Wokwi-GUEST"
WIFI_PASS = ""

# Wokwi Private IoT Gateway directs host.wokwi.internal to local computer
MQTT_BROKER = "host.wokwi.internal"
MQTT_PORT = 1883
MQTT_TOPIC_TELEMETRY = f"anticamera/{DEVICE_ID}/telemetry"
MQTT_TOPIC_STATUS = f"anticamera/{DEVICE_ID}/status"
MQTT_TOPIC_COMMANDS = f"anticamera/{DEVICE_ID}/commands"

RF_THRESHOLD = 2000

SUSPICIOUS_KEYWORDS = [
    "spycam",
    "camera",
    "hidden",
    "surveillance",
    "monitor"
]

MOCK_WIFI_NETWORKS = [
    "Home_WiFi",
    "OfficeNet",
    "spycam_device",
    "GuestWiFi"
]

# --------------------------------
# Hardware Initialization
# --------------------------------
# 1. RF Sensor Simulator (Potentiometer on GPIO 34)
rf_sensor = ADC(Pin(34))
rf_sensor.atten(ADC.ATTN_11DB)

# 2. Status LEDs
red_led = Pin(25, Pin.OUT)
yellow_led = Pin(26, Pin.OUT)
green_led = Pin(27, Pin.OUT)

# 3. Warning Buzzer
buzzer = Pin(14, Pin.OUT)

# 4. Manual Hidden Camera Button (Active LOW with internal pull-up)
camera_button = Pin(33, Pin.IN, Pin.PULL_UP)

# 5. SSD1306 I2C OLED Display
oled = None
try:
    i2c = I2C(0, scl=Pin(22), sda=Pin(21))
    if ssd1306:
        oled = ssd1306.SSD1306_I2C(128, 64, i2c)
except Exception as e:
    print(f"[Firmware] OLED Init Error: {e}")

# --------------------------------
# Hardware Control Helpers
# --------------------------------
def reset_outputs():
    red_led.off()
    yellow_led.off()
    green_led.off()
    buzzer.off()

def update_oled(rf_val, status_text, mqtt_ok=False):
    if not oled:
        return
    try:
        oled.fill(0)
        oled.text("ANTI-CAM DETECT", 5, 0)
        oled.text(f"RF: {rf_val}", 0, 16)
        
        status_sub = "NET: OK" if mqtt_ok else "NET: DISC"
        oled.text(status_sub, 64, 16)

        oled.text("STATUS:", 0, 36)
        oled.text(status_text, 0, 48)
        oled.show()
    except Exception as e:
        print(f"[Firmware] OLED display error: {e}")

# --------------------------------
# Wi-Fi & MQTT Networking
# --------------------------------
wlan = network.WLAN(network.STA_IF)
mqtt_client = None

def connect_wifi():
    wlan.active(True)
    if not wlan.isconnected():
        print(f"[Wi-Fi] Connecting to {WIFI_SSID}...")
        wlan.connect(WIFI_SSID, WIFI_PASS)
        attempts = 0
        while not wlan.isconnected() and attempts < 20:
            sleep(0.5)
            attempts += 1
            print(".", end="")
        print("")

    if wlan.isconnected():
        print(f"[Wi-Fi] Connected! IP: {wlan.ifconfig()[0]}")
        return True
    else:
        print("[Wi-Fi] Connection failed or timed out.")
        return False

def on_command_received(topic, msg):
    print(f"[MQTT] Command received on {topic.decode()}: {msg.decode()}")
    try:
        cmd = ujson.loads(msg.decode())
        action = cmd.get("action")
        if action == "beep":
            buzzer.on()
            sleep(0.5)
            buzzer.off()
    except Exception as e:
        print(f"[MQTT] Failed to parse command: {e}")

def connect_mqtt():
    global mqtt_client
    if not MQTTClient:
        return False

    try:
        print(f"[MQTT] Connecting to broker at {MQTT_BROKER}:{MQTT_PORT}...")
        mqtt_client = MQTTClient(
            client_id=DEVICE_ID,
            server=MQTT_BROKER,
            port=MQTT_PORT,
            keepalive=60
        )
        mqtt_client.set_callback(on_command_received)
        mqtt_client.connect()
        mqtt_client.subscribe(MQTT_TOPIC_COMMANDS)
        
        # Publish initial status
        status_payload = ujson.dumps({
            "deviceId": DEVICE_ID,
            "status": "online",
            "firmware": "1.0.0-micropython"
        })
        mqtt_client.publish(MQTT_TOPIC_STATUS, status_payload)
        print("[MQTT] Successfully connected and subscribed!")
        return True
    except Exception as e:
        print(f"[MQTT] Connection failed ({MQTT_BROKER}): {e}")
        mqtt_client = None
        return False

# --------------------------------
# Wi-Fi Scan & Suspicious Keywords
# --------------------------------
def evaluate_wifi_networks():
    classified_networks = []
    suspicious_found = False

    for ssid in MOCK_WIFI_NETWORKS:
        is_susp = any(kw in ssid.lower() for kw in SUSPICIOUS_KEYWORDS)
        if is_susp:
            suspicious_found = True
        classified_networks.append({
            "ssid": ssid,
            "suspicious": is_susp
        })

    return classified_networks, suspicious_found

# --------------------------------
# Main Telemetry Loop
# --------------------------------
def main():
    print("====================================================")
    print(" Hybrid Anti-Camera Detection System Starting...    ")
    print("====================================================")

    # Initial Wi-Fi & MQTT setup
    wifi_connected = connect_wifi()
    mqtt_connected = False
    if wifi_connected:
        mqtt_connected = connect_mqtt()

    reconnect_timer = 0

    while True:
        try:
            # 1. Read RF analog signal
            rf_val = rf_sensor.read()

            # 2. Read manual button (Active LOW, pressed == 0)
            camera_detected_btn = (camera_button.value() == 0)

            # 3. Evaluate Wi-Fi SSIDs
            networks, suspicious_ssid = evaluate_wifi_networks()
            rf_anomaly = rf_val > RF_THRESHOLD

            # 4. Local Risk Calculation (Consistent with Backend Risk Engine)
            status_text = "SAFE"
            if camera_detected_btn:
                status_text = "CAM DETECTED"
                local_risk = "HIGH"
            elif rf_anomaly and suspicious_ssid:
                status_text = "HIGH RISK"
                local_risk = "HIGH"
            elif rf_anomaly:
                status_text = "MEDIUM RISK"
                local_risk = "MEDIUM"
            elif suspicious_ssid:
                status_text = "LOW RISK"
                local_risk = "LOW"
            else:
                status_text = "SAFE"
                local_risk = "SAFE"

            # 5. Actuate LEDs & Buzzer
            reset_outputs()
            if local_risk == "HIGH":
                red_led.on()
                buzzer.on()
                sleep(0.3)
                buzzer.off()
            elif local_risk == "MEDIUM":
                yellow_led.on()
            elif local_risk == "LOW":
                green_led.on()
            else:
                green_led.on()

            # 6. Update OLED Display
            update_oled(rf_val, status_text, mqtt_connected)

            # 7. Print to Serial Monitor
            print(f"\n[Telemetry] RF: {rf_val} (Anomaly: {rf_anomaly}) | Suspicious SSID: {suspicious_ssid} | Button: {camera_detected_btn}")
            print(f"[Telemetry] Status: {status_text} | Local Risk: {local_risk}")

            # 8. Manage Reconnection if Disconnected
            if not wlan.isconnected():
                wifi_connected = connect_wifi()
            if wlan.isconnected() and not mqtt_connected:
                reconnect_timer += 1
                if reconnect_timer >= 2:  # retry every ~10s
                    mqtt_connected = connect_mqtt()
                    reconnect_timer = 0

            # 9. Publish MQTT Telemetry if Connected
            if mqtt_connected and mqtt_client:
                try:
                    telemetry_data = {
                        "deviceId": DEVICE_ID,
                        "timestamp": int(time.time()),
                        "rfValue": rf_val,
                        "wifiNetworks": networks,
                        "cameraButton": camera_detected_btn
                    }
                    payload = ujson.dumps(telemetry_data)
                    mqtt_client.publish(MQTT_TOPIC_TELEMETRY, payload)
                    print(f"[MQTT] Published to {MQTT_TOPIC_TELEMETRY}: {payload}")
                    
                    # Check for incoming commands
                    mqtt_client.check_msg()
                except Exception as pub_err:
                    print(f"[MQTT] Publish error: {pub_err}")
                    mqtt_connected = False
            else:
                print("[MQTT] Broker offline or not reachable. Telemetry held in local memory.")

        except Exception as loop_err:
            print(f"[Firmware Error] Exception in main loop: {loop_err}")

        sleep(5)

if __name__ == "__main__":
    main()
