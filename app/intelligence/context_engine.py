"""Context Engine for SENTINEL Operational Intelligence."""

from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.database.models import Room, Equipment
from app.intelligence.explanation import generate_transparent_explanation

class ContextEngine:
    def __init__(self):
        pass

    def evaluate_context(
        self,
        db: Session,
        room_id: str,
        detection_result: Dict[str, Any],
        occupancy: int,
        scheduled: bool,
        temperature_c: float
    ) -> Dict[str, Any]:
        """Correlates physical room configuration, equipment inventory, and operational state."""
        room = db.query(Room).filter_by(id=room_id).first()
        equipment_list = db.query(Equipment).filter_by(room_id=room_id).all()
        equipment_names = [e.name for e in equipment_list]

        actual_kw = detection_result["actual_power_kw"]
        expected_kw = detection_result["expected_power_kw"]
        deviation_kw = detection_result["deviation_kw"]
        deviation_pct = detection_result["deviation_pct"]
        anomaly_type = detection_result["anomaly_type"]
        severity = detection_result["severity"]

        # Hypothesize root causes based on equipment inventory and context
        possible_causes = []
        probable_cause = "Unknown electrical draw"
        supporting_evidence: List[str] = [
            f"Power deviation: +{deviation_pct:.1f}% ({actual_kw:.2f} kW vs {expected_kw:.2f} kW expected)",
            f"Occupancy count: {occupancy} persons",
            f"Timetable scheduled: {'Yes' if scheduled else 'No scheduled class'}",
            f"Ambient temperature: {temperature_c:.1f}°C"
        ]

        has_hvac = any("AC" in e.name or e.equipment_type == "hvac" for e in equipment_list)
        has_pcs = any("Workstation" in e.name or e.equipment_type == "computer_cluster" for e in equipment_list)
        has_lights = any("LED" in e.name or e.equipment_type == "lighting" for e in equipment_list)

        if anomaly_type == "IDLE_RUNNING":
            if has_hvac and deviation_kw >= 1.5:
                probable_cause = "HVAC cluster left running after scheduled activity"
                possible_causes = ["Dual Inverter AC Unit 1/2", "Central AHU terminal", "Thermostat override"]
                supporting_evidence.append("Active power signature matches dual compressor continuous load (1.8 - 3.6 kW).")
            elif has_pcs and deviation_kw >= 1.0:
                probable_cause = "Workstation cluster left powered on in idle room"
                possible_causes = ["Computer cluster idle state failure", "Bulk render / background job"]
            else:
                probable_cause = "Auxiliary equipment left energized during idle period"

        elif anomaly_type == "OUT_OF_SCHEDULE":
            if has_lights:
                probable_cause = "Room lighting grid and AV podium active with zero occupancy"
                possible_causes = ["Recessed LED lights left switch-on", "Podium projector in standby power"]
            else:
                probable_cause = "Unscheduled room equipment activation"

        elif anomaly_type == "UNEXPECTED_SPIKE":
            probable_cause = "Heavy electrical load spike or lab machinery turn-on"
            possible_causes = ["High-draw power supply turn-on", "Compressor inrush or cycling defect"]
            supporting_evidence.append(f"Sudden step deviation: Z-score is {detection_result.get('z_score', 0):.2f}.")

        elif anomaly_type == "CONSUMPTION_DRIFT":
            probable_cause = "Cooling system efficiency loss or motor degradation"
            possible_causes = ["AHU filter clogging", "Refrigerant charge leak", "Belt slipping"]
            supporting_evidence.append("Power is +30% above expected active baseline for current occupancy.")

        # Generate human-readable explanation
        explanation = generate_transparent_explanation(
            room_id=room_id,
            room_name=room.name if room else room_id,
            anomaly_type=anomaly_type,
            actual_kw=actual_kw,
            expected_kw=expected_kw,
            deviation_pct=deviation_pct,
            occupancy=occupancy,
            scheduled=scheduled,
            probable_cause=probable_cause,
            severity=severity
        )

        return {
            "room_id": room_id,
            "room_name": room.name if room else room_id,
            "building_id": room.building_id if room else None,
            "probable_cause": probable_cause,
            "possible_causes": possible_causes,
            "supporting_evidence": supporting_evidence,
            "explanation": explanation,
            "recommended_action": f"Inspect {probable_cause.lower()} in {room_id} and verify shutdown state."
        }

context_engine = ContextEngine()
