"""Telemetry Ingestion and Query Endpoints."""

from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Telemetry, Room
from app.schemas.telemetry import (
    TelemetryCreate, TelemetryBulkCreate, TelemetryResponse, TelemetryHistoryResponse, TelemetryLatestResponse
)
from app.services.telemetry_service import telemetry_service

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def ingest_telemetry(data: TelemetryCreate, db: Session = Depends(get_db)):
    """Unified single sensor reading ingestion with validation, baseline check, and anomaly detection."""
    try:
        result = await telemetry_service.ingest_single(db, data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest telemetry: {e}")

@router.post("/bulk", status_code=status.HTTP_201_CREATED)
async def ingest_bulk_telemetry(payload: TelemetryBulkCreate, db: Session = Depends(get_db)):
    """Batch ingestion for historical replay or manual CSV/JSON data imports."""
    result = await telemetry_service.ingest_batch(db, payload.readings)
    return result

@router.get("/latest", response_model=TelemetryLatestResponse)
def get_latest_telemetry(
    room_id: Optional[str] = Query(None, description="Optional room ID filter"),
    db: Session = Depends(get_db)
):
    """Fetch the latest telemetry readings across rooms or for a specific room."""
    query = db.query(Telemetry)
    if room_id:
        query = query.filter_by(room_id=room_id)
        latest_items = query.order_by(Telemetry.timestamp.desc()).limit(1).all()
    else:
        # Get latest reading per room
        rooms = db.query(Room).all()
        latest_items = []
        for r in rooms:
            rec = db.query(Telemetry).filter_by(room_id=r.id).order_by(Telemetry.timestamp.desc()).first()
            if rec:
                latest_items.append(rec)

    return {
        "timestamp": datetime.now(timezone.utc),
        "readings": latest_items
    }

@router.get("/history", response_model=TelemetryHistoryResponse)
def get_telemetry_history(
    room_id: str = Query(..., description="Target room ID e.g. LAB-204"),
    limit: int = Query(100, ge=1, le=1000, description="Max history points"),
    db: Session = Depends(get_db)
):
    """Fetch historical timeseries telemetry for room energy and environmental charts."""
    records = db.query(Telemetry).filter_by(room_id=room_id).order_by(Telemetry.timestamp.desc()).limit(limit).all()
    # Reverse so it flows chronologically
    records_chronological = list(reversed(records))
    return {
        "room_id": room_id,
        "count": len(records_chronological),
        "data": records_chronological
    }
