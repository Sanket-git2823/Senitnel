# Design System Rules — SENTINEL

Aesthetic Inspiration: Command-and-control mission consoles, industrial GIS workstations (reference traffic/fleet command UI).

## Palette
- **Background App**: `#0B0D0F` (near-black)
- **Surfaces / Panels**: `#111416` / `#141719`
- **Subtle Borders**: `#1E2225` / `#232729` / `#292D30`
- **Primary Text**: `#E6EBED` (crisp off-white)
- **Secondary Text**: `#859098` / `#94A3B8`
- **Faint / Muted**: `#57626A` / `#3D474F`
- **Accent Brand**: `#E87524` (restrained industrial orange)
- **Status Colors**:
  - Critical: `#EF4444` (alerts, severe anomalies)
  - Warning: `#F59E0B` (degraded baseline, high alerts)
  - Healthy / Normal: `#10B981` (optimal, verified)
  - Selected / Link: `#38BDF8` / `#3880FF`

## Visual Principles
- STRICTLY AVOID: SaaS purple/blue gradients, glassmorphism, heavy neon glows, bubbly rounded corners (>4px), oversized empty margins.
- PREFER: Compact radii (`rounded-xs`, `rounded`), 1px dividers, tabular monospaced numbers, subtle translucent overlays (`bg-[#111416]/95 backdrop-blur-xs`), crisp SVG vector geometry.
