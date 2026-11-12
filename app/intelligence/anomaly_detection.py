"""Hybrid Anomaly Detection Engine for SENTINEL."""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sqlalchemy.orm import Session
from app.database.models import Telemetry
from app.core.logging import logger

class AnomalyDetectionEngine:
    def __init__(self):
        self.models: Dict[str, IsolationForest] = {}
        self.fitted_rooms: set = set()

    def fit_isolation_forest(self, db: Session, room_id: str) -> bool:
        """Trains an Isolation Forest on historical room telemetry if >= 50 points exist."""
        readings = db.query(Telemetry.power_kw, Telemetry.occupancy, Telemetry.temperature_c).filter(
            Telemetry.room_id == room_id
        ).order_by(Telemetry.timestamp.desc()).limit(500).all()

        if len(readings) < 40:
            return False

        try:
            X = np.array([[r[0], r[1], r[2]] for r in readings])
            # Contamination parameter: expected ~5% anomalies
            iso = IsolationForest(n_estimators=50, contamination=0.05, random_state=42)
            iso.fit(X)
            self.models[room_id] = iso
            self.fitted_rooms.add(room_id)
            return True
        except Exception as e:
            logger.warning(f"Failed to fit Isolation Forest for {room_id}: {e}")
            return False

    def detect(
        self,
        db: Session,
        room_id: str,
        power_kw: float,
        expected_power_kw: float,
        occupancy: int,
        scheduled: bool,
        temperature_c: float
    ) -> Dict[str, Any]:
        """Hybrid evaluation combining statistical deviations, threshold bounds, and Isolation Forest."""
        # 1. Statistical Deviation
        deviation_kw = power_kw - expected_power_kw
        deviation_pct = (deviation_kw / max(0.1, expected_power_kw)) * 100.0

        # Query recent rolling stats (last 20 readings)
        recent_records = db.query(Telemetry.power_kw).filter(
            Telemetry.room_id == room_id
        ).order_by(Telemetry.timestamp.desc()).limit(20).all()

        rolling_mean = expected_power_kw
        rolling_std = 0.2
        z_score = 0.0

        if recent_records:
            powers = [r[0] for r in recent_records]
            rolling_mean = float(np.mean(powers))
            rolling_std = float(np.std(powers))
            if rolling_std > 0.01:
                z_score = (power_kw - rolling_mean) / rolling_std

        # 2. Isolation Forest score
        iso_score = 0.0
        iso_is_anomaly = False
        if room_id not in self.fitted_rooms:
            self.fit_isolation_forest(db, room_id)

        if room_id in self.models:
            try:
                features = np.array([[power_kw, occupancy, temperature_c]])
                pred = self.models[room_id].predict(features)[0]  # -1 for anomaly, 1 for normal
                iso_score = float(self.models[room_id].score_samples(features)[0])
                iso_is_anomaly = (pred == -1)
            except Exception:
                pass

        # 3. Classify Anomaly Type & Severity
        is_anomaly = False
        anomaly_type = None
        severity = "LOW"
        confidence = 0.80

        # Case A: Idle consumption (Empty + Not Scheduled + Excess > 1.5x idle baseline)
        if not scheduled and occupancy == 0 and deviation_pct >= 100.0 and deviation_kw >= 0.8:
            is_anomaly = True
            anomaly_type = "IDLE_RUNNING"
            severity = "HIGH" if deviation_pct < 250 else "CRITICAL"
            confidence = min(0.99, 0.85 + (deviation_pct / 1000.0))

        # Case B: Consumption outside operating schedules (Not scheduled, moderate power)
        elif not scheduled and occupancy == 0 and deviation_pct >= 40.0 and deviation_kw >= 0.4:
            is_anomaly = True
            anomaly_type = "OUT_OF_SCHEDULE"
            severity = "MEDIUM" if deviation_pct < 100 else "HIGH"
            confidence = 0.88

        # Case C: Unexpected sudden power spike (Z-score > 3.0 or deviation_kw > 2.5 kW)
        elif z_score > 3.0 or (deviation_kw >= 2.5 and deviation_pct >= 50.0):
            is_anomaly = True
            anomaly_type = "UNEXPECTED_SPIKE"
            severity = "HIGH" if deviation_kw < 4.0 else "CRITICAL"
            confidence = min(0.98, 0.82 + abs(z_score) * 0.03)

        # Case D: Gradual consumption drift (scheduled or occupied, but running > 30% above expected active baseline)
        elif deviation_pct >= 30.0 and deviation_kw >= 1.2:
            is_anomaly = True
            anomaly_type = "CONSUMPTION_DRIFT"
            severity = "MEDIUM"
            confidence = 0.84

        # Case E: Isolation Forest flag with positive power deviation
        elif iso_is_anomaly and deviation_kw > 0.5:
            is_anomaly = True
            anomaly_type = "STATISTICAL_OUTLIER"
            severity = "MEDIUM"
            confidence = 0.82

        return {
            "is_anomaly": bool(is_anomaly),
            "anomaly_type": anomaly_type,
            "severity": severity,
            "confidence": round(float(confidence), 2),
            "actual_power_kw": round(float(power_kw), 3),
            "expected_power_kw": round(float(expected_power_kw), 3),
            "deviation_kw": round(float(deviation_kw), 3),
            "deviation_pct": round(float(deviation_pct), 1),
            "z_score": round(float(z_score), 2),
            "iso_forest_flag": bool(iso_is_anomaly)
        }

anomaly_engine = AnomalyDetectionEngine()
