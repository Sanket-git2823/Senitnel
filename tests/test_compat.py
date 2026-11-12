"""Tests for Frontend Bridge API endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_assets_buildings():
    response = client.get("/api/v1/assets/buildings")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 7
    # Verify digital twin schema
    first = data[0]
    assert "id" in first
    assert "name" in first
    assert "coords" in first
    assert "color" in first
    assert "currentKw" in first

def test_get_assets_floors():
    response = client.get("/api/v1/assets/buildings/acad-a/floors")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    # Verify floor and room structure
    first_floor = data[0]
    assert "rooms" in first_floor
    assert len(first_floor["rooms"]) > 0

def test_set_room_setpoint():
    response = client.post("/api/v1/assets/rooms/LAB-204/controls/setpoint", json={
        "targetTempC": 22.0,
        "mode": "AUTO"
    })
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_get_incidents_anomalies():
    response = client.get("/api/v1/incidents/anomalies")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "id" in data[0]
    assert "severity" in data[0]

def test_get_incident_investigation():
    response = client.get("/api/v1/incidents/ANO-101/investigation")
    assert response.status_code == 200
    data = response.json()
    assert data["assetId"] == "lab-204"
    assert "contributingSignals" in data
    assert len(data["contributingSignals"]) == 4

def test_telemetry_power_series():
    response = client.get("/api/v1/telemetry/power?asset=LAB-204")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "actual" in data[0]
    assert "expected" in data[0]

def test_analytics_summary():
    response = client.get("/api/v1/analytics/summary?range=24h")
    assert response.status_code == 200
    data = response.json()
    assert "subsystemDistribution" in data
    assert "buildingComparison" in data
    assert "peakDemandCurve" in data

def test_simulator_demo_triggers():
    # Trigger anomaly
    res_trig = client.post("/api/v1/simulator/trigger-demo-anomaly")
    assert res_trig.status_code == 200
    assert res_trig.json()["status"] == "anomaly_triggered"

    # Resolve anomaly
    res_res = client.post("/api/v1/simulator/resolve-demo-anomaly")
    assert res_res.status_code == 200
    assert res_res.json()["status"] == "anomaly_resolved"
