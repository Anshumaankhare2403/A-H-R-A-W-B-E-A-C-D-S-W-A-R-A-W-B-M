# Hybrid Anti-Camera Detection System — Web Dashboard

Modern, responsive cybersecurity IoT monitoring dashboard built with React 19, TypeScript, Vite, Tailwind CSS, Recharts, and Socket.IO.

---

## 1. Features

- **Real-Time Sensor Telemetry:** Streaming RF electromagnetic values with 2000 ADC threshold detection.
- **Authoritative Risk Assessment:** Color-coded classification (`SAFE`, `LOW`, `MEDIUM`, `HIGH`).
- **Simulated Wi-Fi Threat Scanning:** Heuristic keyword analysis (`spycam`, `camera`, `hidden`, `surveillance`, `monitor`).
- **Alert Management:** Live incident triage with real-time acknowledgment via backend REST API.
- **Hardware Management:** Registered ESP32 edge node profiles and telemetry streams.
- **Historical Analysis:** Filterable, paginated audit logs with instant CSV export.
- **Analytics & Trends:** Statistical RF charts and incident breakdown by severity.
- **Responsive Architecture:** Optimized for mobile phones (360px+), tablets (768px), and multi-column desktop displays.
- **Persistent Theming:** Cyber dark slate theme and high-contrast light theme with local preference persistence.

---

## 2. Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **Routing:** React Router DOM v7
- **Data Visualization:** Recharts & Custom SVG Gauges
- **State Management:** Zustand & TanStack Query (React Query)
- **Networking:** Axios (REST) & Socket.IO Client (WebSockets)
- **Styling:** Tailwind CSS v4 & Lucide React Icons
- **Date Utilities:** date-fns

---

## 3. Quickstart

### Prerequisites
- Node.js >= 20.0.0
- Backend running on `http://localhost:4000`

### Installation
```bash
cd web-app
npm install
```

### Configure Environment
Create `.env` or verify `.env.example`:
```ini
VITE_API_URL=http://localhost:4000
```

### Start Development Server
```bash
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

### Production Build
```bash
npm run build
npm run preview
```

### Automated Verification Tests
```bash
npm test
```
