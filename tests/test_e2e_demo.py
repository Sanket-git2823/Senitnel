"""Comprehensive End-to-End Test for the 13-Scene Demonstration Sequence."""

from datetime import datetime, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.simulator.generator import simulator_instance

client = TestClient(app)

def test_complete_13_scene_demonstration():
    print("\n--- BEGIN 13-SCENE DEMONSTRATION VERIFICATION ---")

    # SCENE 1: Campus operating normally
    reset_res = client.post("/api/v1/simulator/reset")
    assert reset_res.status_code == 200

    overview_res = client.get("/api/v1/overview")
    assert overview_res.status_code == 200
    ov_data = overview_res.json()
    assert ov_data["campus_name"] == "DEMO CAMPUS"

    # SCENE 2-5: A class in LAB-204 ends, occupancy becomes 0, no schedule, but AC remains on (3.82 kW)
    sim_res = client.post("/api/v1/simulator/scenarios/lab_204_ac_waste")
    assert sim_res.status_code == 200

    # Ingest the telemetry from virtual ESP32 for LAB-204
    t_waste = datetime.now(timezone.utc).isoformat()
    ingest_res = client.post("/api/v1/telemetry", json={
        "room_id": "LAB-204",
        "timestamp": t_waste,
        "power_kw": 3.82,
        "temperature_c": 27.4,
        "humidity": 58.0,
        "occupancy": 0,
        "scheduled": False,
        "source": "simulated"
    })
    assert ingest_res.status_code == 201
    ingest_data = ingest_res.json()

    # SCENE 6: Sentinel detects abnormal consumption
    assert ingest_data["anomaly_detected"] is True
    inc_code = ingest_data["incident_code"]
    assert inc_code is not None

    # SCENE 7: Intelligence engine correlates power, occupancy and schedule
    anom_res = client.get(f"/api/v1/intelligence/anomalies?room_id=LAB-204")
    assert anom_res.status_code == 200
    anomalies = anom_res.json()
    assert len(anomalies) > 0
    top_anomaly = anomalies[0]
    assert top_anomaly["actual_power_kw"] == 3.82
    assert "HVAC" in top_anomaly["root_cause_hypothesis"] or "AC" in top_anomaly["root_cause_hypothesis"]

    # SCENE 8: Incident appears in dashboard
    incidents_res = client.get("/api/v1/incidents?status=NEW")
    assert incidents_res.status_code == 200
    incidents_list = incidents_res.json()
    assert any(i["incident_code"] == inc_code for i in incidents_list)

    # SCENE 9: Operator opens investigation and sees evidence & impact
    detail_res = client.get(f"/api/v1/incidents/{inc_code}")
    assert detail_res.status_code == 200
    inc_dossier = detail_res.json()
    assert len(inc_dossier["evidence"]) >= 3
    assert inc_dossier["excess_power_kw"] > 2.0
    assert inc_dossier["estimated_cost_impact"] > 0
    assert inc_dossier["estimated_carbon_kg"] > 0

    # Test Ask Sentinel assistant query about LAB-204
    ask_res = client.post("/api/v1/assistant/query", json={"query": "Why is LAB-204 flagged?"})
    assert ask_res.status_code == 200
    ask_data = ask_res.json()
    assert "LAB-204" in ask_data["target_room"]
    assert "3.82" in ask_data["explanation"]

    # SCENE 10: Operator creates a work order
    wo_create_res = client.post("/api/v1/work-orders", json={
        "room_id": "LAB-204",
        "incident_id": inc_code,
        "title": "Inspect HVAC — LAB-204",
        "priority": "HIGH",
        "order_type": "HVAC / Energy",
        "assigned_team": "Facilities HVAC Team",
        "description": "Dual inverter AC left running while room is unoccupied.",
        "recommended_action": "Inspect dual AC units and set to auto-standby.",
        "estimated_impact_kwh_day": 2.9,
        "estimated_cost_savings": 34.8,
        "estimated_carbon_savings": 2.37
    })
    assert wo_create_res.status_code == 201
    wo_code = wo_create_res.json()["work_order_code"]

    # Technician accepts and starts work order
    client.post(f"/api/v1/work-orders/{wo_code}/assign", json={"assigned_team": "Facilities HVAC Team"})
    client.post(f"/api/v1/work-orders/{wo_code}/start")

    # SCENE 11: Technician marks work order resolved
    resolve_res = client.post(f"/api/v1/work-orders/{wo_code}/resolve", json={
        "resolution_notes": "Turned off manual thermostat override; set back to scheduled occupancy sensor.",
        "resolved_by": "Sunil Verma (HVAC Tech)"
    })
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"

    # SCENE 12: Simulator reduces power consumption (normal baseline)
    # The resolution triggered simulator_instance.resolve_room_anomaly("LAB-204")
    # Now simulate virtual ESP32 generating the restored telemetry reading
    t_normal = (datetime.now(timezone.utc)).isoformat()
    restored_ingest = client.post("/api/v1/telemetry", json={
        "room_id": "LAB-204",
        "timestamp": t_normal,
        "power_kw": 0.89, # Restored to idle baseline
        "temperature_c": 26.0,
        "humidity": 55.0,
        "occupancy": 0,
        "scheduled": False,
        "source": "simulated"
    })
    assert restored_ingest.status_code == 201
    assert restored_ingest.json()["anomaly_detected"] is False

    # SCENE 13: Sentinel verifies consumption has returned to baseline
    verify_res = client.post(f"/api/v1/work-orders/{wo_code}/verify", json={
        "notes": "Verified subsequent telemetry is 0.89 kW (expected 0.91 kW baseline). Anomaly cleared."
    })
    assert verify_res.status_code == 200
    v_body = verify_res.json()
    assert v_body["verification_status"] == "SUCCESS"
    assert v_body["work_order"]["status"] == "VERIFIED"

    # Check that incident is also verified
    inc_final = client.get(f"/api/v1/incidents/{inc_code}").json()
    assert inc_final["status"] == "VERIFIED"

    print("--- 13-SCENE DEMONSTRATION VERIFIED SUCCESSFULLY ---")
