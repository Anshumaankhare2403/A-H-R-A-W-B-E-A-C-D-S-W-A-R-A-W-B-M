# Troubleshooting Guide
## Hybrid Anti-Camera Detection System

---

## 1. MongoDB Connection Issues

### Symptom: `[Database] Failed to connect to MongoDB at mongodb://127.0.0.1:27017/anticamera_db`
- **Root Cause:** MongoDB service is stopped or port 27017 is blocked.
- **Resolution:**
  - **Windows:** Check and start the MongoDB Windows service:
    ```powershell
    Get-Service -Name MongoDB
    Start-Service -Name MongoDB
    ```
  - **Docker:** If running via Docker Compose:
    ```bash
    docker compose up -d mongodb
    ```
  - **Verification:** Test TCP connectivity:
    ```powershell
    Test-NetConnection -ComputerName 127.0.0.1 -Port 27017
    ```

---

## 2. MQTT Broker Connection Refused

### Symptom: `[MQTT] Error: connect ECONNREFUSED 127.0.0.1:1883`
- **Root Cause:** Mosquitto broker container or native service is not active on port 1883.
- **Resolution:**
  - **Docker:** Start Mosquitto via Docker Compose:
    ```bash
    docker compose up -d mosquitto
    ```
  - **Wokwi Simulator Bridge:**
    If Wokwi Private IoT Gateway is not installed, switch `MQTT_BROKER` in `backend/.env` and `iot/wokwi-esp32/main.py` to a shared public development broker:
    ```text
    MQTT_BROKER_URL=mqtt://broker.hivemq.com:1883
    ```

---

## 3. PowerShell Script Execution Restrictions

### Symptom: `npm.ps1 cannot be loaded because running scripts is disabled on this system`
- **Root Cause:** Windows PowerShell execution policy restricts unsigned `.ps1` script wrappers.
- **Resolution:**
  - Execute npm commands via `cmd.exe`:
    ```powershell
    cmd.exe /c npm start
    cmd.exe /c npm test
    ```
  - Or bypass the execution policy for the current shell session:
    ```powershell
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    ```

---

## 4. Wokwi Simulator Cannot Reach `host.wokwi.internal`

### Symptom: ESP32 serial logs report `[MQTT] Connection failed (host.wokwi.internal): [Errno 113] EHOSTUNREACH`
- **Root Cause:** The browser-based Wokwi simulator cannot resolve your computer's local ports without the Private IoT Gateway helper.
- **Resolution:**
  - Install and run the [Wokwi Private IoT Gateway](https://docs.wokwi.com/guides/private-iot-gateway).
  - Alternatively, use a public test broker (`broker.hivemq.com`) for immediate cross-network communication without any local gateway software.

