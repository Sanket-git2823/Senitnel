"""Main Application Entry Point for SENTINEL Operational Intelligence."""

from contextlib import asynccontextmanager
from typing import List, Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.database.connection import engine, SessionLocal, Base
from app.database.seed import seed_database
from app.schemas.telemetry import TelemetryCreate
from app.services.telemetry_service import telemetry_service
from app.simulator.generator import simulator_instance
from app.websocket.manager import ws_manager

# API Routers
from app.api import overview, campus, telemetry, intelligence, incidents, work_orders, analytics, simulator, assistant, compat

setup_logging()

async def simulator_ingestion_handler(readings: List[Dict[str, Any]]):
    """Callback bridge connecting virtual ESP32 sensor loop directly to unified ingestion pipeline."""
    db = SessionLocal()
    try:
        for r_dict in readings:
            obj = TelemetryCreate(**r_dict)
            await telemetry_service.ingest_single(db, obj)
    except Exception as e:
        logger.error(f"Error ingesting simulated reading: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    logger.info("Initializing SENTINEL backend infrastructure...")
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed database if empty
    db = SessionLocal()
    try:
        seed_database(db, force=False)
    finally:
        db.close()

    # Wire simulator callback
    simulator_instance.set_ingestion_callback(simulator_ingestion_handler)

    if settings.SIMULATOR_AUTO_START:
        logger.info("Auto-starting simulator per configuration...")
        simulator_instance.start()

    yield

    # --- Shutdown ---
    logger.info("Shutting down SENTINEL...")
    simulator_instance.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Operational Intelligence Platform for Campus Energy and Infrastructure",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware for seamless frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST API Routers under /api/v1
api_prefix = settings.API_V1_STR
app.include_router(compat.router, prefix=api_prefix)
app.include_router(overview.router, prefix=api_prefix)
app.include_router(campus.router, prefix=api_prefix)
app.include_router(telemetry.router, prefix=api_prefix)
app.include_router(intelligence.router, prefix=api_prefix)
app.include_router(incidents.router, prefix=api_prefix)
app.include_router(work_orders.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)
app.include_router(simulator.router, prefix=api_prefix)
app.include_router(assistant.router, prefix=api_prefix)

# WebSocket Real-Time Endpoint
@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection open and receive optional ping/pong or client commands
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket client error: {e}")
        ws_manager.disconnect(websocket)

# Static files and interactive dashboard
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
frontend_assets = os.path.join(frontend_dist, "assets")

if os.path.exists(frontend_assets):
    app.mount("/assets", StaticFiles(directory=frontend_assets), name="frontend_assets")

static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/", include_in_schema=False)
def root_dashboard():
    frontend_index = os.path.join(frontend_dist, "index.html")
    if os.path.exists(frontend_index):
        return FileResponse(frontend_index)
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return RedirectResponse(url="/docs")

@app.get("/dashboard", include_in_schema=False)
def dashboard():
    frontend_index = os.path.join(frontend_dist, "index.html")
    if os.path.exists(frontend_index):
        return FileResponse(frontend_index)
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return RedirectResponse(url="/docs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
