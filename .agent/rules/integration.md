# Backend Integration Rules — SENTINEL

1. **Independent Backend Developer**: Another developer owns the Python AI Engine and backend ingestion services. Do NOT implement a second backend.
2. **Contract-Driven**: All communication goes through `src/services/`. UI components must never call `fetch()` directly.
3. **Environment Flags**:
   - `VITE_USE_MOCK_DATA=true` (default during frontend development)
   - `VITE_API_BASE_URL=https://sentinel-core.campus.internal/api/v1`
   - `VITE_WS_BASE_URL=wss://telemetry.campus.internal:8443/v1/stream`
4. **WebSocket Handling**:
   - Telemetry streams must support graceful reconnect and state reflection in `BottomStatusBar`.
5. **Contract Documentation**:
   - Keep `brain/API_CONTRACT.md` updated whenever data schemas or parameters evolve.
