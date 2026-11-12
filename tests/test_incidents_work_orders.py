from datetime import datetime, timezone
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_incident_and_work_order_workflow():
    now_iso = datetime.now(timezone.utc).isoformat()

    # 1. Ingest anomaly reading in LAB-204
    payload = {
        "room_id": "LAB-204",
        "timestamp": now_iso,
        "power_kw": 3.82,
        "temperature_c": 27.4,
        "humidity": 58.0,
        "occupancy": 0,
        "scheduled": False,
        "source": "simulated"
    }
    ingest_res = client.post("/api/v1/telemetry", json=payload)
    assert ingest_res.status_code == 201
    data = ingest_res.json()
    assert data["anomaly_detected"] is True
    assert data["incident_code"] is not None
    inc_code = data["incident_code"]

    # 2. Verify incident exists via API
    inc_res = client.get(f"/api/v1/incidents/{inc_code}")
    assert inc_res.status_code == 200
    inc_data = inc_res.json()
    assert inc_data["status"] == "NEW"
    assert "LAB-204" in inc_data["title"]
    assert inc_data["severity"] in ("HIGH", "CRITICAL")
    assert len(inc_data["recommendations"]) > 0

    # 3. Acknowledge incident
    ack_res = client.post(f"/api/v1/incidents/{inc_code}/acknowledge")
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "ACKNOWLEDGED"

    # 4. Create Work Order from incident
    wo_payload = {
        "room_id": "LAB-204",
        "incident_id": inc_code,
        "title": "Inspect HVAC — LAB-204",
        "priority": "HIGH",
        "order_type": "HVAC / Energy",
        "assigned_team": "Facilities HVAC Team",
        "description": "Unusual power consumption detected during idle period.",
        "recommended_action": "Inspect the HVAC cluster and verify its shutdown state.",
        "estimated_impact_kwh_day": 2.9,
        "estimated_cost_savings": 34.8,
        "estimated_carbon_savings": 2.37
    }
    wo_res = client.post("/api/v1/work-orders", json=wo_payload)
    assert wo_res.status_code == 201
    wo_data = wo_res.json()
    assert wo_data["status"] == "OPEN"
    wo_code = wo_data["work_order_code"]

    # 5. Assign work order
    assign_res = client.post(f"/api/v1/work-orders/{wo_code}/assign", json={
        "assigned_team": "Facilities HVAC Team",
        "assigned_to_user_id": "USR-003",
        "notes": "Assigned to Sunil Verma (HVAC Tech)"
    })
    assert assign_res.status_code == 200
    assert assign_res.json()["status"] == "ASSIGNED"

    # 6. Start work order
    start_res = client.post(f"/api/v1/work-orders/{wo_code}/start")
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "IN_PROGRESS"

    # 7. Resolve work order
    resolve_res = client.post(f"/api/v1/work-orders/{wo_code}/resolve", json={
        "resolution_notes": "Thermostat schedule reset and master wall switch powered down.",
        "resolved_by": "Sunil Verma (Technician)"
    })
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"

    # 8. Verify work order
    verify_res = client.post(f"/api/v1/work-orders/{wo_code}/verify", json={
        "notes": "Subsequent telemetry verified: Power normalized to 0.88 kW."
    })
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert v_data["verification_status"] == "SUCCESS"
    assert v_data["work_order"]["status"] == "VERIFIED"
