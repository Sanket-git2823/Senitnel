"""Work Orders Lifecycle API Endpoints."""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import WorkOrder
from app.schemas.work_order import (
    WorkOrderCreate, WorkOrderResponse, WorkOrderAssignRequest,
    WorkOrderResolveRequest, WorkOrderVerifyRequest
)
from app.services.work_order_service import work_order_service
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/work-orders", tags=["Work Orders"])

@router.get("", response_model=List[WorkOrderResponse])
def get_work_orders(
    status: Optional[str] = Query(None, description="Filter by status: OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, VERIFIED"),
    room_id: Optional[str] = Query(None, description="Filter by room ID"),
    db: Session = Depends(get_db)
):
    """List work orders with status and room filters."""
    query = db.query(WorkOrder)
    if status:
        query = query.filter_by(status=status)
    if room_id:
        query = query.filter_by(room_id=room_id)
    return query.order_by(WorkOrder.created_at.desc()).all()

@router.post("", response_model=WorkOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_work_order(payload: WorkOrderCreate, db: Session = Depends(get_db)):
    """Create a new work order from an approved incident or ad-hoc."""
    wo = work_order_service.create_work_order(
        db=db,
        incident_id=payload.incident_id,
        room_id=payload.room_id,
        title=payload.title,
        priority=payload.priority,
        order_type=payload.order_type,
        assigned_team=payload.assigned_team,
        description=payload.description,
        recommended_action=payload.recommended_action,
        estimated_impact_kwh_day=payload.estimated_impact_kwh_day,
        estimated_cost_savings=payload.estimated_cost_savings,
        estimated_carbon_savings=payload.estimated_carbon_savings
    )
    await ws_manager.broadcast("work_order.created", {
        "work_order_code": wo.work_order_code,
        "room_id": wo.room_id,
        "title": wo.title,
        "status": wo.status
    })
    return wo

@router.get("/{work_order_id}", response_model=WorkOrderResponse)
def get_work_order(work_order_id: str, db: Session = Depends(get_db)):
    """Fetch complete work order detail including audit log timeline."""
    wo = db.query(WorkOrder).filter(
        (WorkOrder.id == work_order_id) | (WorkOrder.work_order_code == work_order_id)
    ).first()
    if not wo:
        raise HTTPException(status_code=404, detail=f"Work order '{work_order_id}' not found.")
    return wo

@router.post("/{work_order_id}/assign", response_model=WorkOrderResponse)
async def assign_work_order(work_order_id: str, payload: WorkOrderAssignRequest, db: Session = Depends(get_db)):
    """Assign team or technician to work order (transitions to ASSIGNED)."""
    wo = work_order_service.assign_work_order(
        db=db,
        wo_id=work_order_id,
        assigned_team=payload.assigned_team,
        assigned_to_user_id=payload.assigned_to_user_id,
        notes=payload.notes
    )
    if not wo:
        raise HTTPException(status_code=404, detail=f"Work order '{work_order_id}' not found.")

    await ws_manager.broadcast("work_order.updated", {
        "work_order_code": wo.work_order_code,
        "status": wo.status,
        "assigned_team": wo.assigned_team
    })
    return wo

@router.post("/{work_order_id}/start", response_model=WorkOrderResponse)
async def start_work_order(work_order_id: str, db: Session = Depends(get_db)):
    """Technician starts work order on site (transitions to IN_PROGRESS)."""
    wo = work_order_service.start_work_order(db, work_order_id)
    if not wo:
        raise HTTPException(status_code=404, detail=f"Work order '{work_order_id}' not found.")

    await ws_manager.broadcast("work_order.updated", {
        "work_order_code": wo.work_order_code,
        "status": wo.status
    })
    return wo

@router.post("/{work_order_id}/resolve", response_model=WorkOrderResponse)
async def resolve_work_order(work_order_id: str, payload: WorkOrderResolveRequest, db: Session = Depends(get_db)):
    """Mark work order resolved. Triggers simulated power return to baseline."""
    wo = work_order_service.resolve_work_order(
        db=db,
        wo_id=work_order_id,
        resolution_notes=payload.resolution_notes,
        resolved_by=payload.resolved_by
    )
    if not wo:
        raise HTTPException(status_code=404, detail=f"Work order '{work_order_id}' not found.")

    await ws_manager.broadcast("work_order.updated", {
        "work_order_code": wo.work_order_code,
        "status": wo.status,
        "resolution_notes": wo.resolution_notes
    })
    return wo

@router.post("/{work_order_id}/verify")
async def verify_work_order(work_order_id: str, payload: WorkOrderVerifyRequest, db: Session = Depends(get_db)):
    """Perform post-resolution verification comparing subsequent telemetry to expected baseline."""
    result = work_order_service.verify_work_order(db, work_order_id, payload.notes)
    if not result:
        raise HTTPException(status_code=404, detail=f"Work order '{work_order_id}' not found.")

    wo = result["work_order"]
    await ws_manager.broadcast("work_order.updated", {
        "work_order_code": wo.work_order_code,
        "status": wo.status,
        "verified_at": result["verified_at"]
    })
    return result
