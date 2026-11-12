# SENTINEL

> Unified Campus Infrastructure Operating Environment & AI Operational Intelligence

SENTINEL is an enterprise command-and-control operations platform engineered for campus facilities directors, energy managers, and infrastructure operators. It continuously ingests high-frequency telemetry across distributed campus building management systems (BMS), detects operational anomalies via automated baseline deviation models, guides root-cause investigations, and closes the loop through verified facility work orders.

```
OBSERVE  ──►  INVESTIGATE  ──►  UNDERSTAND  ──►  ACT  ──►  VERIFY
```

---

## Repository Architecture

```
SENTINEL/
├── GEMINI.md                    # Core system conventions and agent governance
├── .agent/                      # Engineering and architectural rules
│   └── rules/
│       ├── architecture.md      # Workspace routing, state, and modularity
│       ├── design-system.md     # Institutional graphite palette & typography specs
│       ├── frontend.md          # Component contracts & TypeScript standards
│       └── integration.md       # API client & backend service integration specs
├── brain/                       # Context & persistent technical logs
│   ├── PROJECT.md               # Product charter and core architecture
│   ├── CURRENT_STATE.md         # Active status across all modules
│   ├── DESIGN_DECISIONS.md      # Visual decisions & aesthetic rationale
│   ├── COMPONENTS.md            # Component catalog & interface documentation
│   ├── API_CONTRACT.md          # Complete REST & WebSocket specification
│   └── TASK_LOG.md              # Milestones and changelog
├── frontend/                    # Vite + React 19 + TypeScript + Tailwind v4 frontend
│   ├── src/
│   │   ├── components/          # Shell, overview, investigation, work-orders, etc.
│   │   ├── services/            # API client and typed domain services
│   │   ├── types/               # Strict TypeScript definitions
│   │   └── data/                # Seed datasets for standalone/demo operation
│   ├── package.json
│   └── vite.config.ts
├── app/                         # FastAPI Application & AI Intelligence Engine
│   ├── api/                     # REST API route endpoints
│   ├── assistant/               # Query service and LLM integration
│   ├── core/                    # Config, database connections, and logging
│   ├── database/                # SQLAlchemy models & automatic seeders
│   ├── intelligence/            # Anomaly detection, baselining & explanation
│   ├── schemas/                 # Pydantic domain models
│   ├── services/                # Business logic and database operations
│   ├── simulator/               # Virtual ESP32 telemetry & scenario generator
│   ├── static/                  # Built-in interactive operator console
│   └── websocket/               # High-frequency telemetry broadcast manager
├── scripts/                     # Demonstration and automation runners
│   ├── run_demo.py              # Automated 13-scene demonstration sequence
│   └── reset_demo.py            # State and database reset utility
├── tests/                       # Complete automated pytest test suite
├── requirements.txt             # Python backend dependencies
└── .env.example                 # Environment configuration template
```

---

## 1. Core Workflow Pipeline

```
SIMULATED ESP32 / BACnet TELEMETRY
       │
       ▼
TELEMETRY INGESTION PIPELINE (/api/v1/telemetry)
       │
       ▼
SQLITE / POSTGRESQL PERSISTENCE
       │
       ▼
AI INTELLIGENCE ENGINE
  ├── Baseline Engine (Timetable, Day, Hour, Historical Average)
  ├── Anomaly Detection (Statistical Z-Score + Scikit-Learn Isolation Forest)
  ├── Context Engine (Power vs Expected vs Occupancy & Schedule)
  ├── Transparent Explanation Engine (Fact-grounded, zero hallucination)
  ├── Impact Engine (Excess kWh, Tariff Cost, Carbon kgCO2)
  └── 24-Hour Forecasting Engine (Baseline vs Projected)
       │
       ▼
OPERATIONAL INCIDENT LIFECYCLE (NEW ➔ INVESTIGATING ➔ ACKNOWLEDGED ➔ RESOLVED ➔ VERIFIED)
       │
       ▼
MAINTENANCE WORK ORDER DISPATCH & AUDIT TRAIL
       │
       ▼
POST-RESOLUTION VERIFICATION (Telemetry normalization audit)
       │
       ▼
REAL-TIME WEBSOCKET BROADCAST (/ws/live) & REST API (/api/v1/*)
```

---

## 2. Quickstart — Backend & Intelligence Engine

### Prerequisites
- Python 3.12+

### Installation & Launch
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the backend server (FastAPI with WebSocket)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Built-in Operator Dashboard**: [http://localhost:8000](http://localhost:8000)
- **Real-Time WebSocket Stream**: `ws://localhost:8000/ws/live`

### Run Automated Tests
```bash
python -m pytest -p no:langsmith
```

### Run the 13-Scene Demonstration
Sentinel includes a full scripted 13-scene end-to-end demonstration verifying abnormal HVAC waste detection in LAB-204, operator dispatch, technician resolution, and verified baseline recovery:

```bash
python scripts/run_demo.py
```

To reset the demonstration state:
```bash
python scripts/reset_demo.py
```

---

## 3. Quickstart — Frontend Operating Environment

### Prerequisites
- Node.js 18+
- npm / pnpm / yarn

### Launch Development Server
```bash
cd frontend
npm install
npm run dev
```

### Production Build
```bash
cd frontend
npm run build
```

---

## 4. Key Workspaces

1. **Campus Overview**: Architectural digital twin with live energy intensity heatmaps, subsystem power curves, and facility warning drawer.
2. **Investigation Workspace**: Detailed root-cause investigation module (demonstrated with incident `INC-2026-0892` in Turing Hall LAB-204) featuring 6-hour baseline comparisons, tri-context matrix (occupancy, HVAC schedule, lab experiment calendar), and 1-click work order dispatch.
3. **Work Orders**: Facilities management workflow with a 5-stage lifecycle (`Open` → `Assigned` → `In Progress` → `Resolved` → `Verified`) and technician verification modal.
4. **Incidents**: Facility triage interface with multi-facet severity and status filtering.
5. **Infrastructure**: Three-level physical hierarchy (Building → Floor → Room), connected device telemetry bus, and BACnet command overrides.
6. **Analytics**: Peak demand profile against contract limits, energy distribution, and building variance analysis.
7. **Reports**: Audit report generation with print styling and live CSV export.
8. **Live Monitoring**: Real-time oscillogram charts and edge gateway health statuses.

---

## 5. Design System

The interface adheres to the **Sentinel Graphite / Institutional** palette:

| Token | Hex | Role |
| :--- | :--- | :--- |
| **Canvas** | `#151719` | Deep muted graphite base |
| **Surface** | `#1C1F22` | Panel surfaces with tonal depth |
| **Elevated** | `#24282B` | Active items, cards, modal backgrounds |
| **Divider** | `#34393D` | Low-contrast subtle dividers |
| **Primary** | `#E3E5E6` | High-contrast body & header typography |
| **Secondary** | `#969DA2` | Muted labels, units, and timestamps |
| **Accent** | `#B1A078` | Restrained institutional ochre |
| **Status OK** | `#638D7D` | Muted sage green |
| **Warning** | `#C09853` | Restrained amber |
| **Critical** | `#B85555` | Desaturated red |
