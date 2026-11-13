import time
import json
import network
from machine import Pin, ADC, PWM, I2C

try:
    import ssd1306
    HAS_OLED_DRIVER = True
except ImportError:
    HAS_OLED_DRIVER = False

try:
    from umqtt.simple import MQTTClient
    HAS_UMQTT = True
except ImportError:
    HAS_UMQTT = False

DEVICE_ID = "device001"
WIFI_SSID = "Wokwi-GUEST"
WIFI_PASSWORD = ""

MQTT_BROKER = "host.wokwi.internal"
MQTT_PORT = 1883
MQTT_TELEMETRY_TOPIC = f"anticamera/{DEVICE_ID}/telemetry"
MQTT_STATUS_TOPIC = f"anticamera/{DEVICE_ID}/status"

RF_THRESHOLD = 2000
TELEMETRY_INTERVAL_MS = 5000

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

rf_adc = ADC(Pin(34))
rf_adc.atten(ADC.ATTN_11DB)

led_red = Pin(25, Pin.OUT)
led_yellow = Pin(26, Pin.OUT)
led_green = Pin(27, Pin.OUT)

buzzer_pin = Pin(14, Pin.OUT)
buzzer_pwm = None
try:
    buzzer_pwm = PWM(buzzer_pin)
    buzzer_pwm.duty(0)
except Exception:
    buzzer_pwm = None

button_pin = Pin(33, Pin.IN, Pin.PULL_UP)

oled = None
try:
    i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=400000)
    if HAS_OLED_DRIVER:
        oled = ssd1306.SSD1306_I2C(128, 64, i2c)
        print("[Hardware] OLED Display initialized (128x64)")
    else:
        print("[Hardware] ssd1306 driver not found. Display disabled.")
except Exception as e:
    print(f"[Hardware] OLED initialization failed: {e}")

def set_leds(red, yellow, green):
    led_red.value(1 if red else 0)
    led_yellow.value(1 if yellow else 0)
    led_green.value(1 if green else 0)

def set_buzzer(active):
    try:
        if buzzer_pwm:
            if active:
                buzzer_pwm.freq(2000)
                buzzer_pwm.duty(512)
            else:
                buzzer_pwm.duty(0)
        else:
            buzzer_pin.value(1 if active else 0)
    except Exception as e:
        print(f"[Buzzer] Error: {e}")

def update_oled(rf_val, risk_level, suspicious_count, btn_pressed, mqtt_connected):
    if not oled:
        return
    try:
        oled.fill(0)
        oled.text("ANTI-CAM DETECT", 4, 0)
        oled.hline(0, 10, 128, 1)

        oled.text(f"RF Raw: {rf_val}", 0, 14)
        oled.text(f"Risk: {risk_level}", 0, 26)
        oled.text(f"SSIDs: {suspicious_count} Flagged", 0, 38)

        btn_str = "PRESSED" if btn_pressed else "IDLE"
        oled.text(f"Button: {btn_str}", 0, 48)

        mqtt_str = "MQTT: OK" if mqtt_connected else "MQTT: DISC"
        oled.text(mqtt_str, 0, 56)

        oled.show()
    except Exception as e:
        print(f"[OLED] Update failed: {e}")

def read_rf_sensor():
    return rf_adc.read()

def is_button_pressed():
    return button_pin.value() == 0

def analyze_mock_ssids():
    annotated = []
    suspicious_count = 0

    for ssid in MOCK_WIFI_NETWORKS:
        lower_ssid = ssid.lower()
        is_suspicious = any(kw in lower_ssid for kw in SUSPICIOUS_KEYWORDS)
        if is_suspicious:
            suspicious_count += 1
        annotated.append({"ssid": ssid, "suspicious": is_suspicious})

    return annotated, suspicious_count

def calculate_local_risk(rf_value, suspicious_count, button_pressed):
    rf_anomaly = rf_value > RF_THRESHOLD
    has_suspicious_ssid = suspicious_count > 0

    if button_pressed:
        return "HIGH", True
    elif rf_anomaly and has_suspicious_ssid:
        return "HIGH", True
    elif rf_anomaly and not has_suspicious_ssid:
        return "MEDIUM", True
    elif not rf_anomaly and has_suspicious_ssid:
        return "LOW", False
    else:
        return "SAFE", False

def apply_hardware_feedback(risk_level):
    if risk_level == "HIGH":
        set_leds(red=True, yellow=False, green=False)
        set_buzzer(True)
    elif risk_level == "MEDIUM":
        set_leds(red=False, yellow=True, green=False)
        set_buzzer(False)
    elif risk_level == "LOW":
        set_leds(red=False, yellow=True, green=True)
        set_buzzer(False)
    else:
        set_leds(red=False, yellow=False, green=True)
        set_buzzer(False)

wlan = network.WLAN(network.STA_IF)

def connect_wifi():
    if not wlan.isconnected():
        print(f"[Wi-Fi] Connecting to {WIFI_SSID}...")
        wlan.active(True)
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)
        retries = 0
        while not wlan.isconnected() and retries < 15:
            time.sleep(0.5)
            retries += 1
            print(".", end="")
        print()

    if wlan.isconnected():
        print(f"[Wi-Fi] Connected! IP: {wlan.ifconfig()[0]}")
        return True
    else:
        print("[Wi-Fi] Connection timed out.")
        return False

class MinimalMqttClient:
    def __init__(self, client_id, server, port=1883):
        self.client_id = client_id
        self.server = server
        self.port = port
        self.sock = None

    def connect(self):
        import usocket
        print(f"[MQTT-Fallback] Opening raw socket to {self.server}:{self.port}...")
        addr = usocket.getaddrinfo(self.server, self.port)[0][-1]
        self.sock = usocket.socket()
        self.sock.settimeout(10.0)
        self.sock.connect(addr)

        client_bytes = self.client_id.encode('utf-8')
        var_header = b"\x00\x04MQTT\x04\x02\x00\x3c"
        payload = bytearray([0, len(client_bytes)]) + client_bytes
        remaining_len = len(var_header) + len(payload)
        packet = bytearray([0x10, remaining_len]) + var_header + payload

        self.sock.send(packet)
        ack = self.sock.recv(4)
        if len(ack) >= 4 and ack[0] == 0x20 and ack[3] == 0x00:
            print("[MQTT-Fallback] Connected successfully!")
            return True
        raise OSError("MQTT CONNACK rejected")

    def publish(self, topic, msg):
        topic_bytes = topic.encode('utf-8')
        msg_bytes = msg.encode('utf-8')
        var_header = bytearray([0, len(topic_bytes)]) + topic_bytes
        remaining_len = len(var_header) + len(msg_bytes)
        packet = bytearray([0x30, remaining_len]) + var_header + msg_bytes
        self.sock.send(packet)

    def disconnect(self):
        if self.sock:
            try:
                self.sock.send(b"\xe0\x00")
                self.sock.close()
            except Exception:
                pass
            self.sock = None

mqtt_client = None

def get_mqtt_client():
    global mqtt_client
    if HAS_UMQTT:
        return MQTTClient(DEVICE_ID, MQTT_BROKER, port=MQTT_PORT, keepalive=60)
    else:
        return MinimalMqttClient(DEVICE_ID, MQTT_BROKER, port=MQTT_PORT)

def connect_mqtt():
    global mqtt_client
    try:
        print(f"[MQTT] Connecting to broker {MQTT_BROKER}:{MQTT_PORT}...")
        mqtt_client = get_mqtt_client()
        mqtt_client.connect()
        print("[MQTT] Successfully connected to broker!")

        status_payload = json.dumps({"deviceId": DEVICE_ID, "status": "ONLINE", "firmware": "1.0.0"})
        mqtt_client.publish(MQTT_STATUS_TOPIC, status_payload)
        return True
    except Exception as e:
        print(f"[MQTT] Connection failed: {e}")
        mqtt_client = None
        return False

def main():
    print("==================================================")
    print("  HYBRID ANTI-CAMERA DETECTION SYSTEM - ESP32     ")
    print(f"  Device ID: {DEVICE_ID} | Firmware v1.0.0       ")
    print("==================================================")

    set_leds(red=True, yellow=True, green=True)
    time.sleep(0.5)
    set_leds(red=False, yellow=False, green=False)

    connect_wifi()
    mqtt_ok = connect_mqtt()

    last_telemetry_time = 0

    while True:
        try:
            rf_val = read_rf_sensor()
            btn_pressed = is_button_pressed()
            wifi_networks, suspicious_count = analyze_mock_ssids()

            risk_level, rf_anomaly = calculate_local_risk(rf_val, suspicious_count, btn_pressed)

            apply_hardware_feedback(risk_level)

            if not wlan.isconnected():
                print("[Network] Wi-Fi connection lost. Reconnecting...")
                connect_wifi()

            current_time = time.ticks_ms()
            if time.ticks_diff(current_time, last_telemetry_time) >= TELEMETRY_INTERVAL_MS:
                last_telemetry_time = current_time

                telemetry_data = {
                    "deviceId": DEVICE_ID,
                    "timestamp": time.time(),
                    "rfValue": rf_val,
                    "wifiNetworks": wifi_networks,
                    "cameraButton": btn_pressed
                }
                payload_str = json.dumps(telemetry_data)

                published = False
                if mqtt_client:
                    try:
                        mqtt_client.publish(MQTT_TELEMETRY_TOPIC, payload_str)
                        published = True
                        mqtt_ok = True
                    except Exception as pub_err:
                        print(f"[MQTT] Publish failed: {pub_err}")
                        mqtt_ok = False
                        mqtt_client = None

                if not published and wlan.isconnected():
                    print("[MQTT] Reconnecting to broker...")
                    mqtt_ok = connect_mqtt()
                    if mqtt_ok:
                        try:
                            mqtt_client.publish(MQTT_TELEMETRY_TOPIC, payload_str)
                            published = True
                        except Exception:
                            pass

                print("\n--- [TELEMETRY REPORT] ---")
                print(f"Timestamp   : {telemetry_data['timestamp']}")
                print(f"RF Value    : {rf_val} (Anomaly: {rf_anomaly})")
                print(f"Button Alert: {btn_pressed}")
                print(f"Risk Level  : {risk_level} (Local Evaluation)")
                print(f"Networks    : {len(wifi_networks)} scanned, {suspicious_count} suspicious")
                print(f"MQTT Status : {'Published (OK)' if published else 'Failed / Queued'}")
                print("--------------------------")

            update_oled(rf_val, risk_level, suspicious_count, btn_pressed, mqtt_ok)

            time.sleep(0.1)

        except Exception as loop_err:
            print(f"[Main Loop Error] {loop_err}")
            time.sleep(1.0)

if __name__ == "__main__":
    main()
