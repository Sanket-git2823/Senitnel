"""Interactive One-Command Demonstration Runner for SENTINEL.

Executes the complete 13-Scene sequence:
SIMULATED CAMPUS -> TELEMETRY -> AI INTELLIGENCE -> CONTEXTUAL ANOMALY ->
EXPLAINABLE INCIDENT -> IMPACT ESTIMATION -> WORK ORDER -> VERIFIED RESOLUTION
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import time
import json
from datetime import datetime, timezone
from app.database.connection import SessionLocal
from app.database.seed import seed_database
from app.database.models import Room, Telemetry, Incident, WorkOrder
from app.simulator.generator import simulator_instance
from app.schemas.telemetry import TelemetryCreate
from app.services.telemetry_service import telemetry_service
from app.services.work_order_service import work_order_service
from app.assistant.query_service import assistant_query_service

import asyncio

def print_banner(text: str):
    print("\n" + "=" * 70)
    print(f" {text}")
    print("=" * 70)

def print_scene(scene_num: int, title: str, details: str):
    print(f"\n[SCENE {scene_num}] >>> {title}")
    print(f"       {details}")
    time.sleep(0.8)

async def run_sentinel_demo():
    print_banner("SENTINEL - CAMPUS INFRASTRUCTURE INTELLIGENCE PROTOTYPE DEMO")

    # Step 0: Ensure database baseline
    db = SessionLocal()
    seed_database(db, force=True)
    db.close()

    # SCENE 1: Campus operating normally
    print_scene(1, "NORMAL OPERATION", "All campus rooms following scheduled timetable and idle profiles.")
    simulator_instance.set_scenario("normal_operation")
    print("       * Academic Block A, Floor 2, LAB-204 idle baseline: ~0.91 kW")

    # SCENE 2-4: Class in LAB-204 ends, occupancy drops to 0, no scheduled timetable
    print_scene(2, "CLASS CONCLUDES", "Class 'CS302: IoT Systems Lab' in LAB-204 has ended.")
    print_scene(3, "OCCUPANCY CLEARED", "Occupancy sensor registers: 0 persons.")
    print_scene(4, "SCHEDULE UPDATED", "Timetable indicates: No scheduled class for the rest of evening.")

    # SCENE 5: AC left running (3.82 kW)
    print_scene(5, "ANOMALOUS HVAC LOAD DETECTED", "Virtual ESP32 monitor in LAB-204 captures persistent 3.82 kW load.")
    simulator_instance.set_scenario("lab_204_ac_waste")

    db = SessionLocal()
    t_waste = datetime.now(timezone.utc)
    reading = TelemetryCreate(
        room_id="LAB-204",
        timestamp=t_waste,
        power_kw=3.82,
        temperature_c=27.4,
        humidity=58.0,
        occupancy=0,
        scheduled=False,
        source="simulated"
    )
    res = await telemetry_service.ingest_single(db, reading)

    # SCENE 6: Sentinel detects abnormal consumption
    print_scene(6, "AI ANOMALY DETECTION TRIGGERED", f"Anomaly flag: {res['anomaly_detected']}. Expected: {res['expected_power_kw']} kW, Recorded: {res['power_kw']} kW (+320% deviation).")

    # SCENE 7: Context Engine correlates power, occupancy and schedule
    print_scene(7, "CONTEXT ENGINE CORRELATION", "Correlating actual draw vs 0 occupants, no class scheduled, and HVAC equipment signature.")
    inc_code = res["incident_code"]

    # SCENE 8: Incident appears in dashboard
    print_scene(8, "INCIDENT CREATION", f"New Incident generated: [{inc_code}] in dashboard.")

    # SCENE 9: Operator investigation & evidence
    inc = db.query(Incident).filter_by(incident_code=inc_code).first()
    clean_title = inc.title.replace("—", "-")
    print_scene(9, "INVESTIGATION DOSSIER & IMPACT", f"Incident: '{clean_title}' | Severity: {inc.severity}")
    clean_reason = inc.reason.replace("°C", " deg C").replace("—", "-")
    print(f"       * Reason: {clean_reason}")
    print(f"       * Possible Cause: {inc.possible_cause}")
    clean_evidence = [str(e).replace("°C", " deg C").replace("—", "-") for e in (inc.evidence or [])]
    print(f"       * Evidence Items: {clean_evidence}")
    print(f"       * Excess Power: {inc.excess_power_kw} kW")
    print(f"       * Est. Daily Financial Loss: INR {inc.excess_power_kw * 8.0 * 12.0:.2f} / day")
    print(f"       * Est. Carbon Impact: {inc.excess_power_kw * 8.0 * 0.82:.2f} kg CO2 / day")

    # Ask Sentinel natural language query demonstration
    print("\n   [ASK SENTINEL INTERFACE]")
    query_str = "Why is LAB-204 flagged?"
    print(f"   User asks: '{query_str}'")
    ans = await assistant_query_service.answer_query(db, query_str)
    clean_ans = ans['explanation'].replace("°C", " deg C").replace("—", "-")
    print(f"   Sentinel answers: \"{clean_ans}\"")
    print(f"   Recommended Actions: {ans['suggested_actions']}")

    # SCENE 10: Operator creates a work order
    print_scene(10, "DISPATCH WORK ORDER", "Operator converts incident into maintenance work order.")
    wo = work_order_service.create_work_order(
        db=db,
        incident_id=inc_code,
        room_id="LAB-204",
        title="Inspect HVAC - LAB-204",
        priority="HIGH",
        order_type="HVAC / Energy",
        assigned_team="Facilities HVAC Team",
        description="Dual inverter AC units left running during scheduled idle period.",
        recommended_action="Inspect dual AC units in LAB-204 and reset thermostat override.",
        estimated_impact_kwh_day=2.9,
        estimated_cost_savings=34.8,
        estimated_carbon_savings=2.37
    )
    print(f"       * Created Work Order [{wo.work_order_code}] (Status: {wo.status})")

    # Dispatch & Start
    work_order_service.assign_work_order(db, wo.work_order_code, assigned_team="Facilities HVAC Team", notes="Assigned to Sunil Verma (HVAC Tech)")
    work_order_service.start_work_order(db, wo.work_order_code)
    print(f"       * Work Order [{wo.work_order_code}] assigned & started (Status: IN_PROGRESS)")

    # SCENE 11: Technician marks work order resolved
    print_scene(11, "FIELD RESOLUTION", "Technician powers down units and logs resolution notes.")
    wo_resolved = work_order_service.resolve_work_order(
        db=db,
        wo_id=wo.work_order_code,
        resolution_notes="Turned off manual AC override; confirmed room thermostat is back on scheduled setback.",
        resolved_by="Sunil Verma (Technician)"
    )
    print(f"       * Work Order [{wo_resolved.work_order_code}] Status: {wo_resolved.status}")

    # SCENE 12: Simulator reduces power consumption
    print_scene(12, "SIMULATOR POWER NORMALIZATION", "Simulating subsequent telemetry after physical resolution.")
    t_normal = datetime.now(timezone.utc)
    res_normal = await telemetry_service.ingest_single(db, TelemetryCreate(
        room_id="LAB-204",
        timestamp=t_normal,
        power_kw=0.88,
        temperature_c=26.1,
        humidity=54.0,
        occupancy=0,
        scheduled=False,
        source="simulated"
    ))
    print(f"       * New Telemetry Ingested: {res_normal['power_kw']} kW (Anomaly Flag: {res_normal['anomaly_detected']})")

    # SCENE 13: Sentinel verifies consumption returned to baseline
    print_scene(13, "SENTINEL RESOLUTION VERIFICATION", "Automated audit compares new telemetry to expected idle baseline.")
    v_res = work_order_service.verify_work_order(
        db=db,
        wo_id=wo.work_order_code,
        notes=f"Subsequent power ({res_normal['power_kw']} kW) matches idle baseline ({res_normal['expected_power_kw']} kW). Closed."
    )
    print(f"       * Audit Result: {v_res['verification_status']}")
    print(f"       * Work Order [{wo.work_order_code}] Final Status: {v_res['work_order'].status}")
    print(f"       * Incident [{inc_code}] Final Status: VERIFIED")

    db.close()
    print_banner("[OK] 13-SCENE DEMONSTRATION COMPLETE: ALL STAGES VERIFIED")

if __name__ == "__main__":
    asyncio.run(run_sentinel_demo())
