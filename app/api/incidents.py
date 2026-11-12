"""Incidents Management API Endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Incident
from app.schemas.incident import IncidentResponse, IncidentUpdate
from app.services.incident_service import incident_service
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    status: Optional[str] = Query(None, description="Filter by status: NEW, INVESTIGATING, ACKNOWLEDGED, RESOLVED, VERIFIED"),
    room_id: Optional[str] = Query(None, description="Filter by room ID"),
    db: Session = Depends(get_db)
):
    """List operational incidents with evidence and recommendations."""
    query = db.query(Incident)
    if status:
        query = query.filter_by(status=status)
    if room_id:
        query = query.filter_by(room_id=room_id)
    return query.order_by(Incident.created_at.desc()).all()

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident_detail(incident_id: str, db: Session = Depends(get_db)):
    """Fetch complete incident dossier with supporting telemetry evidence."""
    inc = db.query(Incident).filter(
        (Incident.id == incident_id) | (Incident.incident_code == incident_id)
    ).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found.")
    return inc

@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(incident_id: str, payload: IncidentUpdate, db: Session = Depends(get_db)):
    """Update incident status, severity, or notes."""
    inc = db.query(Incident).filter(
        (Incident.id == incident_id) | (Incident.incident_code == incident_id)
    ).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found.")

    if payload.status:
        inc.status = payload.status
    if payload.severity:
        inc.severity = payload.severity
    if payload.possible_cause:
        inc.possible_cause = payload.possible_cause

    db.commit()
    db.refresh(inc)
    return inc

@router.post("/{incident_id}/acknowledge", response_model=IncidentResponse)
async def acknowledge_incident(incident_id: str, db: Session = Depends(get_db)):
    """Acknowledge an incident (transitions status to ACKNOWLEDGED)."""
    inc = incident_service.acknowledge_incident(db, incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found.")

    await ws_manager.broadcast("incident.updated", {
        "incident_code": inc.incident_code,
        "room_id": inc.room_id,
        "status": inc.status
    })
    return inc
