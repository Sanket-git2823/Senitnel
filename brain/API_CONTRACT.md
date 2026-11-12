# SENTINEL — Backend API Contract & Integration Specification

This document details the REST API endpoints, WebSocket streaming channels, payload contracts, and error structures required by the SENTINEL Frontend Operating Environment.

---

## 1. General Principles

- **Base URL**: `https://sentinel-core.campus.internal/api/v1` (Configured via `VITE_API_BASE_URL`)
- **WebSocket URL**: `wss://telemetry.campus.internal:8443/v1/stream` (Configured via `VITE_WS_BASE_URL`)
- **Demonstration Mode**: Set `VITE_USE_MOCK_DATA=true` to run client-side simulations without an active backend. Set `VITE_USE_MOCK_DATA=false` to route all calls to the Python AI engine / backend.
- **Content Type**: `application/json`
- **Authentication**: Bearer Token or mTLS (`Authorization: Bearer <JWT>`)
- **Time Format**: ISO 8601 strings (e.g. `2026-11-09T23:39:45Z`) or explicit localized string with timezone (`23:09:15 IST`).

---

## 2. Standard API Response Envelope

All REST responses must adhere to the standard envelope:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}
```

---

## 3. Endpoints Specification

### 3.1. Assets & Spatial Hierarchy

#### `GET /assets/buildings`
Returns list of all campus buildings with physical coordinates, isometric mapping coordinates, and current aggregated load.

**Response `data`:**
```json
[
  {
    "id": "acad-a",
    "name": "Academic Block A",
    "shortName": "Block A",
    "category": "Academic",
    "status": "normal",
    "consumptionMWh": 0.52,
    "currentKw": 42.5,
    "expectedKw": 45.0,
    "occupancy": 240,
    "tempC": 24.2,
    "anomalyCount": 0,
    "coords": { "x": 310, "y": 190, "width": 90, "height": 60 },
    "isometricCoords": { "x": 340, "y": 310 },
    "color": "#10B981",
    "floorsCount": 4,
    "totalRooms": 48,
    "sqm": 14200
  }
]
```

#### `GET /assets/buildings/:id/floors`
Returns floor plans, rooms, and sensors nested under the building.

---

### 3.2. Incidents & Anomaly Intelligence

#### `GET /incidents/anomalies`
Query Parameters:
- `status`: `'New' | 'Investigating' | 'Monitoring' | 'Resolved' | 'Closed' | 'All'`
- `severity`: `'critical' | 'high' | 'medium' | 'low'`
- `building`: string (building ID or name substring)

#### `GET /incidents/:id/investigation`
Returns deep diagnostic evidence bundle for the anomaly (crucial for the **LAB-204** workflow).

**Response `data`:**
```json
{
  "incidentId": "ANO-101",
  "assetId": "lab-204",
  "assetName": "Lab 204 — Advanced Robotics & Mechatronics",
  "locationBreadcrumb": "Campus / Academic Block A / Level 2 / Room 204",
  "timestamp": "23:08:33 IST",
  "durationMinutes": 31,
  "detectionEngine": "Sentinel SentinelCore-v4.2 (IsolationForest + TemporalLSTM Ensemble)",
  "confidenceScore": 92,
  "observedPowerKw": 3.82,
  "baselinePowerKw": 0.98,
  "deviationPct": 289.8,
  "indoorTempC": 27.4,
  "setpointTempC": 21.0,
  "ambientTempC": 24.1,
  "occupancyPIR": 0,
  "occupancyBadgeCount": 0,
  "scheduledClass": "None (Scheduled Idle Window)",
  "timetableStatus": "Idle / Unscheduled",
  "estimatedKwhWastePerDay": 68.2,
  "estimatedFinancialWastePerDay": 52.40,
  "estimatedCo2KgPerDay": 41.6,
  "contributingSignals": [
    {
      "id": "sig-1",
      "signalName": "FCU-204 Reheat Valve Actuator",
      "subsystem": "HVAC",
      "observedValue": "78% Stuck Open",
      "expectedValue": "0% (Closed)",
      "deviation": "+78%",
      "confidenceContribution": 44,
      "status": "critical"
    }
  ],
  "historicalComparison": {
    "period": "Same Day/Hour (Last 4 Mondays)",
    "avgConsumptionKw": 0.94,
    "peakKw": 1.12,
    "normalVariancePct": 6.8
  },
  "recommendedActions": [
    {
      "id": "rec-1",
      "action": "Dispatch HVAC technician to calibrate or override sticky reheat valve actuator on FCU-204.",
      "priority": "Immediate",
      "assignedTeamDefault": "Facilities HVAC Response Team",
      "impactPrediction": "Restores power consumption from 3.82 kW back to ~0.98 kW baseline; saves $52.40/day."
    }
  ]
}
```

---

### 3.3. Work Orders Workflow

#### `GET /work-orders`
Returns active and historical work orders.

#### `POST /work-orders`
Creates a work order from an incident or manual report.
**Payload:**
```json
{
  "title": "Inspect HVAC Reheat Actuator – LAB-204",
  "priority": "Critical",
  "category": "HVAC",
  "location": "Academic Block A / Level 2 / Room 204",
  "assetId": "HVAC-204",
  "assetName": "Lab 204 FCU & Reheat Coil",
  "description": "Abnormal power spike to 3.82 kW during vacant timetable window.",
  "recommendedAction": "Inspect FCU-204 actuator motor and recalibrate seating.",
  "assignedTeam": "Facilities HVAC Response Team",
  "relatedIncidentId": "ANO-101"
}
```

#### `PATCH /work-orders/:id/status`
Advances the work order along the 5-stage workflow:
`'Open' -> 'Assigned' -> 'Started' -> 'In Progress' -> 'Resolved' -> 'Verified'`

#### `POST /work-orders/:id/resolve`
Records the physical resolution, root cause, parts replaced, and measured power reduction.

---

### 3.4. Telemetry Streaming (WebSocket)

- **Handshake Endpoint**: `wss://telemetry.campus.internal:8443/v1/stream`
- **Topics**:
  - `subscribe: {"topic": "telemetry/lab-204"}`
  - Broadcast payload:
    ```json
    {
      "topic": "telemetry/lab-204",
      "payload": {
        "time": "23:45",
        "actual": 0.98,
        "expected": 0.98,
        "isAnomaly": false,
        "occupancy": 0,
        "temperature": 23.9
      },
      "timestamp": "2026-11-09T18:15:00Z"
    }
    ```
