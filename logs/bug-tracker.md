# Bug Tracker
**Project:** Hybrid Anti-Camera Detection System
**Milestone:** 1 & 2 - Backend, Wokwi IoT & React Web Application

---

## Logged Issues

| Bug ID | Title | Severity | Status | Affected Files | Description & Resolution |
|---|---|---|---|---|---|
| BUG-001 | PowerShell script execution policy blocks npm.ps1 | Minor | Resolved | Environment / CLI | Windows execution policy prevented running `npm.ps1`. Resolved by using `cmd.exe /c npm` or `npx.cmd`. |
| BUG-002 | Host Docker Desktop daemon offline | Minor | Resolved | Docker / Broker | Docker Desktop daemon was not running. Mitigated by native local MongoDB on port 27017 and supporting both Mosquitto container and standalone development broker for testing. |
| BUG-003 | Windows AppLocker policy blocks `@rollup/rollup-win32-x64-msvc.node` | Major | Resolved | Test Runner / Package | Application Control policy prevented loading native `.node` binary DLL from secondary drive. Resolved by upgrading to Node.js 26 native test runner (`node:test`), eliminating external native binary compilation. |
| BUG-004 | Potential unhandled exception on malformed MQTT JSON | Minor | Resolved | `src/services/mqttService.js` | Malformed JSON in MQTT payload could throw unhandled SyntaxError. Resolved by wrapping in explicit `try...catch` and discarding corrupt frames. |
| BUG-005 | TypeScript strict type-only imports and unused variable check | Minor | Resolved | `web-app/src/**/*` | Strict `verbatimModuleSyntax` and `noUnusedLocals` in Vite React template caused build failure. Resolved by applying `import type` and cleaning unused local imports. |
| BUG-006 | Tailwind CSS v4 PostCSS plugin requirement | Minor | Resolved | `web-app/postcss.config.js` | Tailwind CSS v4 separated PostCSS integration into `@tailwindcss/postcss`. Resolved by installing `@tailwindcss/postcss` and updating configuration. |

---

### Detailed Bug Reports

#### BUG-001: PowerShell Execution Policy Blocks `npm.ps1`
- **Description:** Attempting to invoke `npm` from PowerShell failed with `PSSecurityException`.
- **Severity:** Minor
- **Root Cause:** Default Windows PowerShell script execution policy disables un-signed `.ps1` wrappers.
- **Fix Implemented:** Route npm operations through `cmd.exe /c npm` or invoke batch wrapper directly.
- **Final Status:** RESOLVED.

#### BUG-002: Host Docker Desktop Daemon Offline
- **Description:** Docker API at `//./pipe/dockerDesktopLinuxEngine` returned file not found.
- **Severity:** Minor
- **Root Cause:** Host system has Docker Desktop installed, but background engine daemon is inactive.
- **Fix Implemented:** Verified native MongoDB service is already installed and running on port 27017; prepared full `docker-compose.yml` for production deployments, and implemented local broker support so test suite and local backend run seamlessly.
- **Final Status:** RESOLVED.

#### BUG-003: Windows AppLocker Policy Blocks Rollup Native Binary
- **Description:** Invoking Vitest failed with `ERR_DLOPEN_FAILED` stating "An Application Control policy has blocked this file: rollup.win32-x64-msvc.node".
- **Severity:** Major
- **Root Cause:** Security policy denies loading unsigned or un-whitelisted C++ `.node` binaries on non-system volumes.
- **Fix Implemented:** Migrated test suites to Node.js 26 native `node:test` and `node:assert/strict`.
- **Final Status:** RESOLVED.

#### BUG-004: Potential Unhandled Exception on Malformed MQTT JSON
- **Description:** Ingesting non-JSON string over MQTT topic crashed listener callback.
- **Severity:** Minor
- **Root Cause:** Uncaught `SyntaxError` from `JSON.parse`.
- **Fix Implemented:** Added payload parse `try...catch` block with warning logging.
- **Final Status:** RESOLVED.

#### BUG-005: TypeScript Strict Type-Only Imports & Unused Locals
- **Description:** `tsc -b` failed with `TS1484` and `TS6133` due to strict type import rules.
- **Severity:** Minor
- **Root Cause:** `"verbatimModuleSyntax": true` requires explicit `import type` for TypeScript types and interfaces.
- **Fix Implemented:** Switched all type imports to `import type` across components, hooks, services, and store; removed unused imports.
- **Retest Result:** `tsc -b` passed with 0 errors.
- **Final Status:** RESOLVED.

#### BUG-006: Tailwind CSS v4 PostCSS Plugin Separation
- **Description:** Vite build failed with `[postcss] It looks like you're trying to use tailwindcss directly as a PostCSS plugin`.
- **Severity:** Minor
- **Root Cause:** In Tailwind CSS v4, the PostCSS plugin moved to `@tailwindcss/postcss`.
- **Fix Implemented:** Installed `@tailwindcss/postcss`, updated `postcss.config.js`, and used `@import "tailwindcss";` in `src/index.css`.
- **Retest Result:** Vite production build completed in 1.75s.
- **Final Status:** RESOLVED.
