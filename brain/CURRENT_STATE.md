# SENTINEL — Project State

## Status: IN PROGRESS (Phase 2 — Workspace Wiring & Visual Polish)

## Completed
- [x] Refactored design system to Sentinel Graphite / Institutional palette (#151719, #1C1F22, #24282B, #34393D, #E3E5E6, #969DA2, #B1A078, #638D7D)
- [x] Removed boxy nested outlines, decorative HUD grids, and pulsing glowing decorations
- [x] Standardized typography to natural sentence case, legible weights, and Inter font
- [x] Campus Overview redesigned with quiet architectural digital twin and flat surfaces
- [x] TypeScript types (comprehensive: Anomaly, WorkOrder, Investigation, Sensor, Room, Floor, etc.)
- [x] Mock data layer (LAB-204 scenario, buildings, anomalies, work orders, telemetry series)
- [x] Service layer (api-client, asset, incident, telemetry, work-order, analytics, report)
- [x] API Contract document for backend engineer
- [x] Shell: Header (breadcrumbs, clock, connectivity, operator)
- [x] Shell: Sidebar (collapsible, asset hierarchy tree, navigation)
- [x] Shell: BottomStatusBar (telemetry connection, latency, device count)
- [x] Command Palette (Ctrl+K, search, filter categories, keyboard nav)
- [x] Scenario Controller (12-step LAB-204 demo stepper)
- [x] Badge component (muted institutional variants)
- [x] MetricCard component (flat surface, no harsh borders)
- [x] Investigation Workspace (restrained telemetry comparison, tri-context matrix, signals)
- [x] Incidents Workspace (clean triage table with muted severity badges)
- [x] Infrastructure Workspace (building/floor/room browser, sensor table, BMS controls)
- [x] Work Orders Workspace (5-stage lifecycle stepper, resolution dialog)
- [x] Analytics Workspace (peak demand, building comparison, distribution bars)
- [x] Reports Workspace (template selector, preview, CSV export)
- [x] Live Monitoring Workspace (real-time gauges, oscillogram, gateway table)

## In Progress
- [ ] Rewrite App.tsx to use new shell + workspace components
- [ ] Campus Overview workspace (matching reference image: map center, card grid, large metrics)
- [ ] Campus Intelligence workspace
- [ ] Delete old legacy components (Header.tsx, Sidebar.tsx, etc. from /components root)
- [ ] Visual polish pass to match reference image aesthetic

## Reference Image Key Takeaways
- Semi-transparent dark panel backgrounds (rgba overlays, not solid)
- Very large, bold metric numbers (78.3%, 142,580, ±2.5min)
- Compact asset cards with inline sparkline charts (2x2 grid)
- Central map/visualization takes 60% of viewport
- Right-side floating alert/warning panels on map
- Bottom metric cards span full width
- Minimal top navigation tabs, no heavy sidebar
- Red accents for alerts, muted everything else
- Font: clean sans-serif with tabular numerals
