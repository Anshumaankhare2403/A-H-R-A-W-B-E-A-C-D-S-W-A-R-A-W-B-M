from machine import Pin, ADC, I2C
from time import sleep
import ssd1306

# --------------------------------
# Pin Configuration
# --------------------------------

# Potentiometer (RF Signal Simulator)
rf_sensor = ADC(Pin(34))
rf_sensor.atten(ADC.ATTN_11DB)

# LEDs
red_led = Pin(25, Pin.OUT)
yellow_led = Pin(26, Pin.OUT)
green_led = Pin(27, Pin.OUT)

# Buzzer
buzzer = Pin(14, Pin.OUT)

# Camera Detection Button
# Press Button = Hidden Camera Detected
camera_button = Pin(33, Pin.IN, Pin.PULL_UP)

# OLED Display
i2c = I2C(0, scl=Pin(22), sda=Pin(21))
oled = ssd1306.SSD1306_I2C(128, 64, i2c)

# RF Threshold
RF_THRESHOLD = 2000

# Suspicious Wi-Fi Names
suspicious_words = [
    "spycam",
    "camera",
    "hidden",
    "surveillance",
    "monitor"
]

# --------------------------------
# Simulated Wi-Fi Scan
# --------------------------------

def scan_wifi():
    nearby_networks = [
        "Home_WiFi",
        "OfficeNet",
        "spycam_device",
        "GuestWiFi"
    ]

    found = False

    print("Scanning Wi-Fi Networks...")

    for ssid in nearby_networks:
        print("Detected SSID:", ssid)

        for word in suspicious_words:
            if word.lower() in ssid.lower():
                found = True

    return found


# --------------------------------
# Reset Outputs
# --------------------------------

def reset_outputs():
    red_led.off()
    yellow_led.off()
    green_led.off()
    buzzer.off()


# --------------------------------
# OLED Display
# --------------------------------

def show_status(rf_value, status):
    oled.fill(0)

    oled.text("RF Detector", 10, 0)
    oled.text("RF Value:", 0, 18)
    oled.text(str(rf_value), 70, 18)

    oled.text("Status:", 0, 40)
    oled.text(status, 0, 55)

    oled.show()


# --------------------------------
# Main Program Loop
# --------------------------------

while True:
    rf_value = rf_sensor.read()
    suspicious_ssid = scan_wifi()

    # Button Pressed = Camera Detected
    camera_detected = (camera_button.value() == 0)

    print("\nRF Signal Value:", rf_value)
    print("Camera Detected:", camera_detected)

    reset_outputs()

    # HIGH RISK
    if (rf_value > RF_THRESHOLD and suspicious_ssid) or camera_detected:
        if camera_detected:
            status = "CAM DETECTED"
        else:
            status = "HIGH RISK"

        red_led.on()
        buzzer.on()
        sleep(1)
        buzzer.off()

    # MEDIUM RISK
    elif rf_value > RF_THRESHOLD:
        status = "MEDIUM RISK"
        yellow_led.on()

    # LOW RISK
    elif suspicious_ssid:
        status = "LOW RISK"
        green_led.on()

    # SAFE
    else:
        status = "SAFE"
        green_led.on()

    print("System Status:", status)
    print("-----------------------------")

    show_status(rf_value, status)

    sleep(5)