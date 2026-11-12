from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ingest_valid_telemetry():
    now_iso = datetime.now(timezone.utc).isoformat()
    payload = {
        "room_id": "LAB-204",
        "timestamp": now_iso,
        "power_kw": 0.92,
        "temperature_c": 26.5,
        "humidity": 55.0,
        "occupancy": 0,
        "scheduled": False,
        "source": "simulated"
    }
    response = client.post("/api/v1/telemetry", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "ingested"
    assert data["room_id"] == "LAB-204"

def test_reject_invalid_room():
    now_iso = datetime.now(timezone.utc).isoformat()
    payload = {
        "room_id": "NON-EXISTENT-ROOM",
        "timestamp": now_iso,
        "power_kw": 1.5,
        "temperature_c": 25.0,
        "humidity": 50.0,
        "occupancy": 0,
        "scheduled": False,
        "source": "simulated"
    }
    response = client.post("/api/v1/telemetry", json=payload)
    assert response.status_code == 400

def test_reject_malformed_power():
    now_iso = datetime.now(timezone.utc).isoformat()
    payload = {
        "room_id": "LAB-204",
        "timestamp": now_iso,
        "power_kw": -10.0, # Negative power rejected by validation
        "temperature_c": 25.0,
        "humidity": 50.0,
        "occupancy": 0,
        "scheduled": False,
        "source": "simulated"
    }
    response = client.post("/api/v1/telemetry", json=payload)
    assert response.status_code == 422

def test_telemetry_history():
    response = client.get("/api/v1/telemetry/history?room_id=LAB-204&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["room_id"] == "LAB-204"
    assert len(data["data"]) > 0

def test_telemetry_latest():
    response = client.get("/api/v1/telemetry/latest")
    assert response.status_code == 200
    data = response.json()
    assert "readings" in data
    assert len(data["readings"]) > 0
