# SENTINEL — Project Context & Memory

SENTINEL is an enterprise campus infrastructure operations and intelligence environment.
It provides unified operational intelligence to observe, investigate, understand, manage, and verify campus physical systems (HVAC, Electrical, Lighting, Sensors, Laboratories) through real-time telemetry, contextual intelligence, anomaly detection, and actionable work orders.

Core Philosophy: OBSERVE → INVESTIGATE → UNDERSTAND → ACT → VERIFY

## Project Layout
- Root: `C:\Users\Sanket Patel\.gemini\antigravity\scratch\sentinel-app`
- Tech Stack: Vite + React 19 + TypeScript + Tailwind CSS v4 + Recharts + Lucide Icons
- Brain & Architecture: `brain/`, `.agent/rules/`
- Frontend Code: `src/` (shell, navigation, dashboard, telemetry, incidents, investigation, work-orders, analytics, reports)

## Signature Demo Scenario
- Asset: LAB-204 (Academic Block A)
- Initial state: 3.82 kW power draw vs 0.98 kW baseline (+289.8% deviation), Occupancy 0, Temp 27.4°C, Confidence 92%
- Lifecycle: Overview → Select Block A → Inspect Lab 204 → Live Telemetry → Incident ANO-101 → Investigation (Reheat valve stuck 78%) → Quantify $52.40/day waste → Dispatch Work Order WO-7821 → Assign HVAC Team → Start Work → Resolve & Calibrate Valve → Verify Telemetry Recovery to 0.98 kW and Healthy Status.
