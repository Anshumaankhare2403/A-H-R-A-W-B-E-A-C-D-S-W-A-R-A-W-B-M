# Testing and QA Guide
## Hybrid Anti-Camera Detection System

This project contains comprehensive automated testing for all architectural tiers:
1. Risk Engine Unit Tests
2. Telemetry Ingestion & Deduplication Integration Tests
3. REST API Endpoint Tests (with Supertest)
4. MQTT Message Pipeline Tests
5. Socket.IO Real-Time Event Tests

---

## 1. Running the Automated Test Suite

Navigate to the `backend/` directory:

```bash
cd backend
```

### Run All Tests:
- **Windows PowerShell / CMD:**
  ```powershell
  npm test
  ```
- **Linux / macOS:**
  ```bash
  npm test
  ```

### Run Specific Test Suites:

- **Risk Engine Unit Tests:**
  ```bash
  node --test tests/riskEngine.test.js
  ```
- **Telemetry & Deduplication Integration Tests:**
  ```bash
  node --test tests/telemetry.test.js
  ```
- **REST API Tests:**
  ```bash
  node --test tests/api.test.js
  ```
- **MQTT Pipeline Tests:**
  ```bash
  node --test tests/mqtt.test.js
  ```
- **Socket.IO Event Tests:**
  ```bash
  node --test tests/socket.test.js
  ```

---

## 2. Test Suite Architecture

| Test Suite File | Type | Coverage |
|---|---|---|
| `riskEngine.test.js` | Unit | 15 test cases covering all 5 risk conditions, boundary checks (2000 vs 2001), empty arrays, string/object SSID normalizers, and non-numeric inputs. |
| `telemetry.test.js` | Integration | 7 test cases covering device auto-registration, state updates, telemetry persistence, duplicate alert suppression, severity escalation, and invalid payload rejection. |
| `api.test.js` | API / E2E | 11 test cases covering `/api/health`, `/api/devices`, `/api/telemetry`, `/api/alerts`, alert acknowledgment, pagination, and error handlers. |
| `mqtt.test.js` | Integration | 3 test cases validating MQTT subscription, JSON parsing, topic fallback, and corrupted payload handling. |
| `socket.test.js` | Real-time | 1 test case validating WebSocket client connection and real-time broadcasts (`device:telemetry`, `risk:changed`, `alert:high-risk`). |

**Total Automated Tests:** 37  
**Pass Rate:** 100% (37/37 passing)

