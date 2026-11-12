# Frontend Engineering Rules — SENTINEL

1. **Desktop-First Density**: Optimize for 1440p, 1080p, and 1366px displays. High information density without decorative fluff.
2. **Typography**: Monospace tabular numbers for telemetry, sensor readings, and timestamps (`font-mono`, `tabular-nums`). Clean system sans-serif for labels.
3. **Component Modularity**: Never create oversized monolithic files. Every workspace lives in `src/components/<feature>/`.
4. **State Reactivity**: State transitions (e.g. Work Order resolution) must synchronously propagate across the entire app:
   - Building status turns from critical (#EF4444) to normal (#10B981)
   - Telemetry recovers to 0.98 kW baseline
   - Anomaly status updates to Resolved
   - Activity log captures verifiable resolution event
5. **No Hallucinated Data**: Demonstration data must be clearly identified with `DEMO DATA MODE` badge.
