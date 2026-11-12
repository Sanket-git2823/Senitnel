# Component Catalog — SENTINEL

| Component | Path | Responsibility |
|---|---|---|
| `Header` | `src/components/shell/Header.tsx` | Master top bar with breadcrumbs, command trigger, UTC/IST clock, operator profile, and scenario banner toggle. |
| `Sidebar` | `src/components/shell/Sidebar.tsx` | Collapsible workstation navigation, live anomaly counters, searchable asset tree. |
| `BottomStatusBar` | `src/components/shell/BottomStatusBar.tsx` | Telemetry websocket link status, ping latency, 1,428 sensors health, demo mode pill. |
| `CampusOverview` | `src/components/dashboard/CampusOverview.tsx` | Reference image GIS twin, 2x2 building cards, health sparklines, floating warning HUD, bottom metrics. |
| `BuildingCard` | `src/components/dashboard/BuildingCard.tsx` | Reusable asset card with status icon, protocol chips, inline 6-hr sparkline, current kW. |
| `InfrastructureWorkspace` | `src/components/infrastructure/InfrastructureWorkspace.tsx` | Building → Floor → Room drilldown, hardware sensor roster, BACnet setpoint override. |
| `IncidentsWorkspace` | `src/components/incidents/IncidentsWorkspace.tsx` | Incident triage table with severity/status filters, sorting, and investigation dispatch. |
| `InvestigationWorkspace` | `src/components/investigation/InvestigationWorkspace.tsx` | Flagship deep-dive: observed vs baseline Recharts timeline, tri-context matrix, contributing signals, impact calculator, work order creator. |
| `WorkOrdersWorkspace` | `src/components/work-orders/WorkOrdersWorkspace.tsx` | Complete 5-stage lifecycle (`Open` → `Assigned` → `In Progress` → `Resolved` → `Verified`), inspector drawer, technician resolution form. |
| `AnalyticsWorkspace` | `src/components/analytics/AnalyticsWorkspace.tsx` | Peak demand curve with tariff alert threshold, subsystem energy distribution, building-by-building variance bar charts. |
| `ReportsWorkspace` | `src/components/reports/ReportsWorkspace.tsx` | Configurable audit template generator, live preview table, functional CSV export download, printable PDF. |
| `LiveMonitoringWorkspace` | `src/components/telemetry/LiveMonitoringWorkspace.tsx` | Real-time oscillogram, sensor gauges, Modbus/BACnet edge gateway link table. |
| `CommandPalette` | `src/components/command/CommandPalette.tsx` | Global Ctrl+K omnibar with natural query parser and keyboard shortcut navigation. |
| `ScenarioController` | `src/components/common/ScenarioController.tsx` | 12-step guided scenario stepper for the signature LAB-204 anomaly workflow. |
| `Badge` | `src/components/common/Badge.tsx` | Industrial status and severity badge with compact variants. |
| `MetricCard` | `src/components/common/MetricCard.tsx` | High-density metric display card with border status accents. |
