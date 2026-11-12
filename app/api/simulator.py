"""Simulator Controls and Scenario Trigger API Endpoints."""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.seed import seed_database
from app.simulator.generator import simulator_instance
from app.simulator.scenarios import SCENARIOS
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/simulator", tags=["Simulator"])

class AnomalyInjectionRequest(BaseModel):
    room_id: str = Field(..., json_schema_extra={"example": "LAB-204"})
    power_kw: float = Field(..., json_schema_extra={"example": 3.82})
    anomaly_type: str = Field("IDLE_RUNNING", json_schema_extra={"example": "IDLE_RUNNING"})
    root_cause: str = Field("Manual Anomaly Injection", json_schema_extra={"example": "HVAC cluster left running"})

@router.get("/status")
def get_simulator_status():
    """Get current status of virtual ESP32 simulator, active scenario, and injections."""
    return simulator_instance.get_status()

@router.get("/scenarios")
def list_scenarios():
    """List all available one-click demonstration scenarios."""
    return [
        {
            "id": sc_id,
            "name": sc["name"],
            "description": sc["description"]
        }
        for sc_id, sc in SCENARIOS.items()
    ]

@router.post("/start")
async def start_simulator():
    """Start 5-second interval virtual ESP32 sensor generation loop."""
    simulator_instance.start()
    await ws_manager.broadcast("simulator.status", simulator_instance.get_status())
    return {"status": "started", "interval_seconds": simulator_instance.interval_seconds}

@router.post("/stop")
async def stop_simulator():
    """Stop sensor simulation generator."""
    simulator_instance.stop()
    await ws_manager.broadcast("simulator.status", simulator_instance.get_status())
    return {"status": "stopped"}

@router.post("/pause")
async def pause_simulator():
    """Pause simulation tick generation without losing current state."""
    simulator_instance.pause()
    await ws_manager.broadcast("simulator.status", simulator_instance.get_status())
    return {"status": "paused"}

@router.post("/resume")
async def resume_simulator():
    """Resume paused simulation generator."""
    simulator_instance.resume()
    await ws_manager.broadcast("simulator.status", simulator_instance.get_status())
    return {"status": "resumed"}

@router.post("/scenarios/{scenario_id}")
async def select_scenario(scenario_id: str):
    """Switch active simulation scenario (e.g. lab_204_ac_waste, normal_operation, etc.)."""
    success = simulator_instance.set_scenario(scenario_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")
    await ws_manager.broadcast("simulator.status", simulator_instance.get_status())
    return {
        "status": "scenario_activated",
        "scenario_id": scenario_id,
        "details": SCENARIOS[scenario_id]
    }

@router.post("/inject-anomaly")
async def inject_anomaly(payload: AnomalyInjectionRequest):
    """Directly inject an ad-hoc power anomaly into any room on demand."""
    simulator_instance.inject_anomaly(
        room_id=payload.room_id,
        power_kw=payload.power_kw,
        anomaly_type=payload.anomaly_type,
        root_cause=payload.root_cause
    )
    await ws_manager.broadcast("simulator.status", simulator_instance.get_status())
    return {
        "status": "anomaly_injected",
        "room_id": payload.room_id,
        "power_kw": payload.power_kw,
        "type": payload.anomaly_type
    }

@router.post("/reset")
async def reset_demo(db: Session = Depends(get_db)):
    """Reset simulator and re-seed database to clean initial demonstration baseline."""
    simulator_instance.reset()
    seed_database(db, force=True)
    await ws_manager.broadcast("simulator.status", simulator_instance.get_status())
    return {
        "status": "reset_complete",
        "message": "Campus re-seeded to initial normal operational baseline."
    }
