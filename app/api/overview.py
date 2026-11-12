"""Overview and System Status API Endpoints."""

import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.analytics import OverviewResponse, SystemStatusResponse
from app.services.analytics_service import analytics_service
from app.simulator.generator import simulator_instance
from app.websocket.manager import ws_manager

router = APIRouter(tags=["Overview"])

START_TIME = time.time()

@router.get("/overview", response_model=OverviewResponse)
def get_campus_overview(db: Session = Depends(get_db)):
    """Executive campus overview metrics for real-time dashboard headers."""
    return analytics_service.get_campus_overview(db)

@router.get("/system/status", response_model=SystemStatusResponse)
def get_system_status(db: Session = Depends(get_db)):
    """Health status of simulator, database, intelligence pipeline, and connected WebSocket clients."""
    sim_status = simulator_instance.get_status()
    return {
        "status": "HEALTHY",
        "database": "CONNECTED",
        "simulator_running": sim_status["is_running"],
        "active_scenario": sim_status["current_scenario"],
        "websocket_connections": ws_manager.client_count,
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "timestamp": datetime.now(timezone.utc)
    }
