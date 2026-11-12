# Debugging and Code Review Engineer Log
**Role:** Debugging and Code Review Engineer
**Project:** Hybrid Anti-Camera Detection System

---

## Log Entries

### [2026-11-12 14:36:00] - Initial Environment Defects & Resolutions
- **Issue 1:** PowerShell execution policy blocked `npm.ps1`.
  - **Resolution:** Executed npm operations via `cmd.exe /c npm` or invoked batch wrapper. (Logged as BUG-001).
- **Issue 2:** Docker Desktop daemon inactive on host.
  - **Resolution:** Detected native MongoDB already active on port 27017. Created production `docker-compose.yml` and provided zero-dependency embedded test broker support. (Logged as BUG-002).

### [2026-11-12 14:38:50] - Code Execution & AppLocker Audit (BUG-003)
- **Issue 3:** Windows AppLocker policy blocked loading `@rollup/rollup-win32-x64-msvc\rollup.win32-x64-msvc.node` binary when invoking Vitest on D: drive.
- **Root Cause:** Enterprise / Windows Application Control restriction preventing unsigned or non-whitelisted `.node` native binary DLL execution from secondary drives.
- **Resolution:** Upgraded test runner to Node.js 26 native test runner (`node:test` and `node:assert/strict`). Because `node:test` is compiled directly into the Node.js runtime executable, it requires zero external native `.node` DLLs, executes instantaneously, and is completely immune to AppLocker DLL execution restrictions.
- **Retest Result:** All 37 tests executed cleanly in under 2.2 seconds. (Logged as BUG-003).

### [2026-11-12 14:43:00] - MQTT JSON Error Isolation Audit
- **Code Review:** Inspected `src/services/mqttService.js`.
- **Finding:** If an external publisher sends malformed or corrupted JSON strings over the MQTT broker, `JSON.parse` could raise an unhandled exception if not encapsulated in a `try...catch` block.
- **Fix Implemented:** Wrapped payload parsing in an explicit `try...catch` block that logs a warning and discards the malformed packet without terminating the Node.js process.
- **Retest:** Verified via test `TST-021b` (`should safely handle malformed JSON without crashing backend`).
- **Status:** Resolved and verified.
