from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_dashboard():
    response = client.get("/")
    assert response.status_code == 200
    assert "SENTINEL" in response.text

def test_docs_available():
    response = client.get("/docs")
    assert response.status_code == 200

def test_system_status():
    response = client.get("/api/v1/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["database"] == "CONNECTED"
    assert "simulator_running" in data

def test_overview():
    response = client.get("/api/v1/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["campus_name"] == "DEMO CAMPUS"
    assert "total_power_kw" in data
    assert "estimated_daily_excess_cost" in data
