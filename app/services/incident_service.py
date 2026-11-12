"""Incident Management Service for SENTINEL."""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.database.models import Incident, Anomaly, Recommendation, Room
from app.core.logging import logger
from app.websocket.manager import ws_manager

class IncidentService:
    def __init__(self):
        pass

    def get_or_create_incident_from_anomaly(
        self,
        db: Session,
        room_id: str,
        anomaly_id: str,
        detection_data: Dict[str, Any],
        context_data: Dict[str, Any],
        impact_data: Dict[str, Any]
    ) -> Incident:
        """Finds existing open incident for room or creates a new one with duplicate prevention."""
        now = datetime.now(timezone.utc)

        # 1. Deduplication check: Is there an existing open incident for this room?
        existing = db.query(Incident).filter(
            Incident.room_id == room_id,
            Incident.status.in_(["NEW", "INVESTIGATING", "ACKNOWLEDGED"])
        ).first()

        if existing:
            # Update existing incident metrics rather than creating a duplicate
            existing.duration_minutes += 1
            existing.excess_power_kw = impact_data["excess_power_kw"]
            existing.excess_energy_kwh += round(impact_data["excess_power_kw"] * (5.0 / 3600.0), 4)
            existing.estimated_cost_impact = round(existing.excess_energy_kwh * 12.0, 2)
            existing.estimated_carbon_kg = round(existing.excess_energy_kwh * 0.82, 2)
            db.commit()
            return existing

        # 2. Generate unique incident code (e.g. INC-2041)
        count = db.query(Incident).count() + 1001
        incident_code = f"INC-{count}"

        title = f"Abnormal Power Consumption — {room_id}"
        severity = detection_data.get("severity", "HIGH")
        reason = context_data.get("explanation", "Unusual power consumption detected outside expected parameters.")
        possible_cause = context_data.get("probable_cause", "HVAC / Equipment")

        incident = Incident(
            incident_code=incident_code,
            room_id=room_id,
            anomaly_id=anomaly_id,
            title=title,
            severity=severity,
            status="NEW",
            reason=reason,
            possible_cause=possible_cause,
            duration_minutes=5,
            excess_power_kw=impact_data["excess_power_kw"],
            excess_energy_kwh=round(impact_data["excess_power_kw"] * (5.0 / 60.0), 3),
            estimated_cost_impact=impact_data["estimated_cost_impact"],
            estimated_carbon_kg=impact_data["estimated_carbon_kg"],
            evidence=context_data.get("supporting_evidence", [])
        )
        db.add(incident)
        db.flush()

        # Update room state
        room = db.query(Room).filter_by(id=room_id).first()
        if room:
            room.current_state = "ANOMALOUS"

        # Create proactive recommendation
        rec = Recommendation(
            incident_id=incident.id,
            title=f"Inspect and Power Down {possible_cause}",
            recommended_action=context_data.get("recommended_action", "Dispatch facilities technician."),
            estimated_savings_kwh_day=impact_data.get("projections", {}).get("daily_excess_kwh", 2.9),
            estimated_cost_savings_daily=impact_data.get("projections", {}).get("daily_cost_savings_estimate", 34.8),
            estimated_carbon_savings_daily=impact_data.get("projections", {}).get("daily_carbon_savings_estimate_kg", 2.37),
            priority=severity
        )
        db.add(rec)
        db.commit()
        db.refresh(incident)

        logger.info(f"Created incident {incident.incident_code} for {room_id}: {incident.title}")
        return incident

    def acknowledge_incident(self, db: Session, incident_id: str) -> Optional[Incident]:
        incident = db.query(Incident).filter(
            (Incident.id == incident_id) | (Incident.incident_code == incident_id)
        ).first()
        if not incident:
            return None

        incident.status = "ACKNOWLEDGED"
        db.commit()
        db.refresh(incident)
        return incident

    def resolve_incident(self, db: Session, incident_id: str) -> Optional[Incident]:
        incident = db.query(Incident).filter(
            (Incident.id == incident_id) | (Incident.incident_code == incident_id)
        ).first()
        if not incident:
            return None

        incident.status = "RESOLVED"
        incident.resolved_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(incident)
        return incident

    def verify_incident(self, db: Session, incident_id: str) -> Optional[Incident]:
        incident = db.query(Incident).filter(
            (Incident.id == incident_id) | (Incident.incident_code == incident_id)
        ).first()
        if not incident:
            return None

        incident.status = "VERIFIED"
        incident.verified_at = datetime.now(timezone.utc)
        
        # Restore room state to IDLE or ACTIVE
        room = db.query(Room).filter_by(id=incident.room_id).first()
        if room:
            room.current_state = "IDLE"

        db.commit()
        db.refresh(incident)
        return incident

incident_service = IncidentService()
