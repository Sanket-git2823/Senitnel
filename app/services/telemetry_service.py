"""Unified Telemetry Ingestion Service for SENTINEL."""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.models import Telemetry, Room, Anomaly, Incident
from app.schemas.telemetry import TelemetryCreate
from app.intelligence.baseline import baseline_engine
from app.intelligence.anomaly_detection import anomaly_engine
from app.intelligence.context_engine import context_engine
from app.intelligence.impact_engine import impact_engine
from app.services.incident_service import incident_service
from app.websocket.manager import ws_manager
from app.core.logging import logger

class TelemetryService:
    def __init__(self):
        pass

    async def ingest_single(self, db: Session, data: TelemetryCreate) -> Dict[str, Any]:
        """Unified ingestion pipeline for single sensor reading."""
        # 1. Room existence validation
        room = db.query(Room).filter_by(id=data.room_id).first()
        if not room:
            raise ValueError(f"Room '{data.room_id}' not found in campus database.")

        # 2. Duplicate timestamp prevention
        existing = db.query(Telemetry).filter(
            Telemetry.room_id == data.room_id,
            Telemetry.timestamp == data.timestamp
        ).first()
        if existing:
            return {"status": "skipped", "reason": "duplicate_timestamp", "id": existing.id}

        # 3. Baseline computation
        baseline = baseline_engine.calculate_expected_power(
            db=db,
            room_id=data.room_id,
            timestamp=data.timestamp,
            occupancy=data.occupancy,
            scheduled=data.scheduled
        )
        expected_kw = baseline["expected_power_kw"]

        # 4. Anomaly Detection
        detection = anomaly_engine.detect(
            db=db,
            room_id=data.room_id,
            power_kw=data.power_kw,
            expected_power_kw=expected_kw,
            occupancy=data.occupancy,
            scheduled=data.scheduled,
            temperature_c=data.temperature_c
        )

        # 5. Persist Telemetry
        record = Telemetry(
            room_id=data.room_id,
            timestamp=data.timestamp,
            power_kw=data.power_kw,
            expected_power_kw=expected_kw,
            temperature_c=data.temperature_c,
            humidity=data.humidity,
            occupancy=data.occupancy,
            scheduled=data.scheduled,
            source=data.source
        )
        db.add(record)
        db.flush()

        anomaly_record = None
        incident_record = None

        # 6. Context evaluation & Incident processing if anomaly detected
        if detection["is_anomaly"]:
            context = context_engine.evaluate_context(
                db=db,
                room_id=data.room_id,
                detection_result=detection,
                occupancy=data.occupancy,
                scheduled=data.scheduled,
                temperature_c=data.temperature_c
            )

            impact = impact_engine.calculate_incident_impact(
                actual_power_kw=data.power_kw,
                expected_power_kw=expected_kw,
                duration_hours=1.0
            )

            # Persist Anomaly
            anomaly_record = Anomaly(
                room_id=data.room_id,
                detected_at=data.timestamp,
                actual_power_kw=data.power_kw,
                expected_power_kw=expected_kw,
                deviation_pct=detection["deviation_pct"],
                anomaly_type=detection["anomaly_type"],
                severity=detection["severity"],
                confidence=detection["confidence"],
                root_cause_hypothesis=context["probable_cause"],
                evidence_metadata={
                    "evidence": list(context["supporting_evidence"]),
                    "z_score": float(detection.get("z_score", 0.0)),
                    "iso_forest": bool(detection.get("iso_forest_flag", False))
                },
                status="ACTIVE"
            )
            db.add(anomaly_record)
            db.flush()

            # Trigger Incident
            incident_record = incident_service.get_or_create_incident_from_anomaly(
                db=db,
                room_id=data.room_id,
                anomaly_id=anomaly_record.id,
                detection_data=detection,
                context_data=context,
                impact_data=impact
            )

        db.commit()
        db.refresh(record)

        # 7. Real-time WebSocket Broadcast
        telem_data = {
            "id": record.id,
            "room_id": record.room_id,
            "timestamp": record.timestamp.isoformat(),
            "power_kw": record.power_kw,
            "expected_power_kw": record.expected_power_kw,
            "temperature_c": record.temperature_c,
            "humidity": record.humidity,
            "occupancy": record.occupancy,
            "scheduled": record.scheduled,
            "source": record.source
        }
        await ws_manager.broadcast("telemetry.updated", telem_data)

        if anomaly_record and incident_record:
            await ws_manager.broadcast("anomaly.detected", {
                "anomaly_id": anomaly_record.id,
                "room_id": data.room_id,
                "type": detection["anomaly_type"],
                "severity": detection["severity"],
                "actual_kw": data.power_kw,
                "expected_kw": expected_kw
            })
            await ws_manager.broadcast("incident.updated", {
                "incident_code": incident_record.incident_code,
                "room_id": data.room_id,
                "title": incident_record.title,
                "status": incident_record.status,
                "severity": incident_record.severity
            })

        return {
            "status": "ingested",
            "id": record.id,
            "room_id": record.room_id,
            "power_kw": record.power_kw,
            "expected_power_kw": record.expected_power_kw,
            "anomaly_detected": detection["is_anomaly"],
            "incident_code": incident_record.incident_code if incident_record else None
        }

    async def ingest_batch(self, db: Session, readings: List[TelemetryCreate]) -> Dict[str, Any]:
        ingested_count = 0
        skipped_count = 0
        anomalies_count = 0

        for r in readings:
            try:
                res = await self.ingest_single(db, r)
                if res.get("status") == "ingested":
                    ingested_count += 1
                    if res.get("anomaly_detected"):
                        anomalies_count += 1
                else:
                    skipped_count += 1
            except Exception as e:
                logger.warning(f"Batch ingestion item failure for {r.room_id}: {e}")
                skipped_count += 1

        return {
            "total_submitted": len(readings),
            "ingested_count": ingested_count,
            "skipped_count": skipped_count,
            "anomalies_detected": anomalies_count
        }

telemetry_service = TelemetryService()
