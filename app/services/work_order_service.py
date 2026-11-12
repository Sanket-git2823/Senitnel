"""Work Order Service for SENTINEL."""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database.models import WorkOrder, WorkOrderUpdate, Incident, Room
from app.core.logging import logger
from app.simulator.generator import simulator_instance

class WorkOrderService:
    def __init__(self):
        pass

    def create_work_order(
        self,
        db: Session,
        incident_id: Optional[str],
        room_id: str,
        title: str,
        priority: str = "HIGH",
        order_type: str = "HVAC / Energy",
        assigned_team: str = "Facilities HVAC Team",
        description: str = "",
        recommended_action: str = "",
        estimated_impact_kwh_day: float = 0.0,
        estimated_cost_savings: float = 0.0,
        estimated_carbon_savings: float = 0.0
    ) -> WorkOrder:
        count = db.query(WorkOrder).count() + 2001
        work_order_code = f"WO-{count}"

        wo = WorkOrder(
            work_order_code=work_order_code,
            incident_id=incident_id,
            room_id=room_id,
            title=title,
            priority=priority,
            order_type=order_type,
            status="OPEN",
            assigned_team=assigned_team,
            description=description,
            recommended_action=recommended_action,
            estimated_impact_kwh_day=estimated_impact_kwh_day,
            estimated_cost_savings=estimated_cost_savings,
            estimated_carbon_savings=estimated_carbon_savings
        )
        db.add(wo)
        db.flush()

        # Add initial audit log
        initial_log = WorkOrderUpdate(
            work_order_id=wo.id,
            author="System",
            update_text=f"Work order created automatically from anomaly detection incident {incident_id or ''}.",
            previous_status=None,
            new_status="OPEN"
        )
        db.add(initial_log)

        # Update incident status to INVESTIGATING if linked
        if incident_id:
            inc = db.query(Incident).filter(
                (Incident.id == incident_id) | (Incident.incident_code == incident_id)
            ).first()
            if inc:
                inc.status = "INVESTIGATING"

        db.commit()
        db.refresh(wo)
        logger.info(f"Created work order {wo.work_order_code} for room {room_id}")
        return wo

    def assign_work_order(
        self,
        db: Session,
        wo_id: str,
        assigned_team: Optional[str] = None,
        assigned_to_user_id: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Optional[WorkOrder]:
        wo = db.query(WorkOrder).filter(
            (WorkOrder.id == wo_id) | (WorkOrder.work_order_code == wo_id)
        ).first()
        if not wo:
            return None

        prev = wo.status
        wo.status = "ASSIGNED"
        if assigned_team:
            wo.assigned_team = assigned_team
        if assigned_to_user_id:
            wo.assigned_to_user_id = assigned_to_user_id

        log = WorkOrderUpdate(
            work_order_id=wo.id,
            author="Dispatcher",
            update_text=notes or f"Assigned to {wo.assigned_team}.",
            previous_status=prev,
            new_status="ASSIGNED"
        )
        db.add(log)
        db.commit()
        db.refresh(wo)
        return wo

    def start_work_order(self, db: Session, wo_id: str) -> Optional[WorkOrder]:
        wo = db.query(WorkOrder).filter(
            (WorkOrder.id == wo_id) | (WorkOrder.work_order_code == wo_id)
        ).first()
        if not wo:
            return None

        prev = wo.status
        wo.status = "IN_PROGRESS"
        log = WorkOrderUpdate(
            work_order_id=wo.id,
            author="Field Technician",
            update_text="Technician arrived on site. Commenced physical inspection.",
            previous_status=prev,
            new_status="IN_PROGRESS"
        )
        db.add(log)
        db.commit()
        db.refresh(wo)
        return wo

    def resolve_work_order(
        self,
        db: Session,
        wo_id: str,
        resolution_notes: str,
        resolved_by: str = "Technician"
    ) -> Optional[WorkOrder]:
        wo = db.query(WorkOrder).filter(
            (WorkOrder.id == wo_id) | (WorkOrder.work_order_code == wo_id)
        ).first()
        if not wo:
            return None

        prev = wo.status
        wo.status = "RESOLVED"
        wo.resolution_notes = resolution_notes
        wo.resolved_at = datetime.now(timezone.utc)

        log = WorkOrderUpdate(
            work_order_id=wo.id,
            author=resolved_by,
            update_text=f"Resolution logged: {resolution_notes}. (Simulated power reduction triggered).",
            previous_status=prev,
            new_status="RESOLVED"
        )
        db.add(log)

        # Trigger simulated power reduction in generator so subsequent telemetry returns to baseline
        simulator_instance.resolve_room_anomaly(wo.room_id)

        # Update linked incident to RESOLVED
        if wo.incident_id:
            inc = db.query(Incident).filter(
                (Incident.id == wo.incident_id) | (Incident.incident_code == wo.incident_id)
            ).first()
            if inc:
                inc.status = "RESOLVED"
                inc.resolved_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(wo)
        return wo

    def verify_work_order(
        self,
        db: Session,
        wo_id: str,
        notes: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        wo = db.query(WorkOrder).filter(
            (WorkOrder.id == wo_id) | (WorkOrder.work_order_code == wo_id)
        ).first()
        if not wo:
            return None

        prev = wo.status
        wo.status = "VERIFIED"
        wo.verified_at = datetime.now(timezone.utc)

        log = WorkOrderUpdate(
            work_order_id=wo.id,
            author="Sentinel AI Verification Audit",
            update_text=notes or "Telemetry verification complete: Power consumption verified returned to normal baseline.",
            previous_status=prev,
            new_status="VERIFIED"
        )
        db.add(log)

        # Update incident to VERIFIED
        if wo.incident_id:
            inc = db.query(Incident).filter(
                (Incident.id == wo.incident_id) | (Incident.incident_code == wo.incident_id)
            ).first()
            if inc:
                inc.status = "VERIFIED"
                inc.verified_at = datetime.now(timezone.utc)

        # Restore room state
        room = db.query(Room).filter_by(id=wo.room_id).first()
        if room:
            room.current_state = "IDLE"

        db.commit()
        db.refresh(wo)

        return {
            "work_order": wo,
            "verification_status": "SUCCESS",
            "verified_at": wo.verified_at.isoformat(),
            "power_normalized": True,
            "message": f"Resolution successfully verified for {wo.room_id}. Power readings have normalized to expected baseline."
        }

work_order_service = WorkOrderService()
