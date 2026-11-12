from datetime import datetime, timezone
from app.database.connection import SessionLocal
from app.intelligence.baseline import baseline_engine
from app.intelligence.anomaly_detection import anomaly_engine
from app.intelligence.context_engine import context_engine
from app.intelligence.impact_engine import impact_engine
from app.intelligence.forecasting import forecasting_engine

def test_baseline_engine_idle_vs_active():
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        # 1. Idle context (occupancy 0, scheduled False)
        res_idle = baseline_engine.calculate_expected_power(
            db, room_id="LAB-204", timestamp=now, occupancy=0, scheduled=False
        )
        assert res_idle["expected_power_kw"] < 1.5
        assert res_idle["is_scheduled"] is False

        # 2. Active context (occupancy 30, scheduled True)
        res_active = baseline_engine.calculate_expected_power(
            db, room_id="LAB-204", timestamp=now, occupancy=30, scheduled=True
        )
        assert res_active["expected_power_kw"] > 3.0
        assert res_active["is_scheduled"] is True
    finally:
        db.close()

def test_anomaly_detection_idle_ac_waste():
    db = SessionLocal()
    try:
        # Case: LAB-204 drawing 3.82 kW while idle baseline is 0.91 kW
        res = anomaly_engine.detect(
            db=db,
            room_id="LAB-204",
            power_kw=3.82,
            expected_power_kw=0.91,
            occupancy=0,
            scheduled=False,
            temperature_c=27.4
        )
        assert res["is_anomaly"] is True
        assert res["anomaly_type"] in ("IDLE_RUNNING", "UNEXPECTED_SPIKE")
        assert res["deviation_pct"] > 200.0
        assert res["severity"] in ("HIGH", "CRITICAL")
        assert res["confidence"] >= 0.85
    finally:
        db.close()

def test_context_engine_explanation():
    db = SessionLocal()
    try:
        detection = {
            "actual_power_kw": 3.82,
            "expected_power_kw": 0.91,
            "deviation_kw": 2.91,
            "deviation_pct": 319.8,
            "anomaly_type": "IDLE_RUNNING",
            "severity": "HIGH",
            "confidence": 0.95
        }
        ctx = context_engine.evaluate_context(
            db=db,
            room_id="LAB-204",
            detection_result=detection,
            occupancy=0,
            scheduled=False,
            temperature_c=27.4
        )
        assert "HVAC" in ctx["probable_cause"] or "AC" in ctx["probable_cause"]
        assert len(ctx["supporting_evidence"]) >= 3
        assert "LAB-204" in ctx["explanation"]
    finally:
        db.close()

def test_impact_engine_calculations():
    # Actual: 3.82 kW, Expected: 0.91 kW -> Excess = 2.91 kW
    impact = impact_engine.calculate_incident_impact(
        actual_power_kw=3.82,
        expected_power_kw=0.91,
        duration_hours=1.0
    )
    assert impact["excess_power_kw"] == 2.91
    # Cost = 2.91 * 12.0 = 34.92
    assert abs(impact["estimated_cost_impact"] - (2.91 * 12.0)) < 0.1
    # CO2 = 2.91 * 0.82 = 2.386 kg
    assert abs(impact["estimated_carbon_kg"] - (2.91 * 0.82)) < 0.1
    assert "daily_excess_kwh" in impact["projections"]

def test_forecasting_engine():
    db = SessionLocal()
    try:
        fc = forecasting_engine.generate_24h_forecast(db, "LAB-204")
        assert fc["room_id"] == "LAB-204"
        assert len(fc["points"]) == 24
        p0 = fc["points"][0]
        assert "expected_power_kw" in p0
        assert "projected_power_kw" in p0
    finally:
        db.close()
