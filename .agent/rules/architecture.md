# Architecture Rules — SENTINEL

## Directory Layout
```
/src
  /types             -> Strict domain entities (Asset, Building, Anomaly, Investigation, WorkOrder)
  /services          -> Dedicated API abstraction layer (api-client, asset, telemetry, incident, etc.)
  /data              -> Coherent mock datasets with realistic physical scenarios
  /lib               -> Pure utilities (formatting, cn, csv download)
  /components
    /shell           -> Header, Sidebar, BottomStatusBar
    /command         -> Ctrl+K Sentinel Command Palette
    /common          -> Badges, MetricCard, ScenarioController
    /dashboard       -> CampusOverview, BuildingCard (reference GIS layout)
    /infrastructure  -> Spatial tree browser, sensor list, BACnet setpoints
    /incidents       -> Professional triage grid with multi-facet filters
    /investigation   -> Deep diagnostic workbench (telemetry, context matrix, signals)
    /work-orders     -> 5-stage lifecycle manager & resolution verification
    /analytics       -> Peak demand curves, subsystem breakdown, building variance
    /reports         -> Template generator, live preview, CSV & PDF export
    /telemetry       -> High-frequency streaming oscillogram & edge gateway health
```
