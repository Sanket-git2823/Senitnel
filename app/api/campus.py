"""Campus, Buildings, and Rooms API Endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.campus import BuildingResponse, BuildingDetailResponse, RoomResponse, RoomDetailResponse
from app.services.campus_service import campus_service

router = APIRouter(tags=["Campus"])

@router.get("/buildings", response_model=List[BuildingResponse])
def get_buildings(db: Session = Depends(get_db)):
    """List all campus buildings with aggregated power and health status."""
    return campus_service.get_all_buildings(db)

@router.get("/buildings/{building_id}", response_model=BuildingDetailResponse)
def get_building_detail(building_id: str, db: Session = Depends(get_db)):
    """Get building details including all rooms and current load."""
    detail = campus_service.get_building_detail(db, building_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Building '{building_id}' not found.")
    return detail

@router.get("/rooms", response_model=List[RoomResponse])
def get_rooms(
    building_id: Optional[str] = Query(None, description="Filter by building ID"),
    db: Session = Depends(get_db)
):
    """List rooms with optional building filter and current telemetry states."""
    return campus_service.get_all_rooms(db, building_id)

@router.get("/rooms/{room_id}", response_model=RoomDetailResponse)
def get_room_detail(room_id: str, db: Session = Depends(get_db)):
    """Get room details including equipment inventory, devices, and weekly timetables."""
    detail = campus_service.get_room_detail(db, room_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Room '{room_id}' not found.")
    return detail
