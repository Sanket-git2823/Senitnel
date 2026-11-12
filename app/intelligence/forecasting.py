"""Forecasting Engine for 24-Hour Energy Projections."""

from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.models import Room, Timetable, Telemetry

class ForecastingEngine:
    def __init__(self):
        pass

    def generate_24h_forecast(self, db: Session, room_id: str) -> Dict[str, Any]:
        room = db.query(Room).filter_by(id=room_id).first()
        if not room:
            return {"room_id": room_id, "points": []}

        now = datetime.now(timezone.utc)
        forecast_points: List[Dict[str, Any]] = []

        idle_kw = room.typical_idle_kw
        active_kw = room.typical_active_kw

        # Timetable for next 24 hours
        timetables = db.query(Timetable).filter_by(room_id=room_id).all()

        for step in range(24):
            t_target = now + timedelta(hours=step)
            day = t_target.weekday()
            hour = t_target.hour
            time_str = f"{hour:02d}:00"

            # Check timetable
            has_class = any(
                tt.day_of_week == day and tt.start_time <= time_str < tt.end_time
                for tt in timetables
            )

            # Historical average for that hour
            hist_avg = db.query(func.avg(Telemetry.power_kw)).filter(
                Telemetry.room_id == room_id,
                func.strftime('%H', Telemetry.timestamp) == f"{hour:02d}"
            ).scalar()

            if has_class:
                expected_kw = active_kw
                variance = 0.35
            else:
                expected_kw = idle_kw
                variance = 0.08

            if hist_avg is not None and hist_avg > 0:
                projected_kw = round(float(0.7 * expected_kw + 0.3 * hist_avg), 3)
            else:
                projected_kw = round(float(expected_kw), 3)

            forecast_points.append({
                "timestamp": t_target.strftime("%Y-%m-%dT%H:00:00Z"),
                "expected_power_kw": round(expected_kw, 3),
                "projected_power_kw": projected_kw,
                "upper_bound_kw": round(projected_kw + variance, 3),
                "lower_bound_kw": max(0.02, round(projected_kw - variance, 3))
            })

        return {
            "room_id": room_id,
            "generated_at": now.isoformat(),
            "forecast_horizon_hours": 24,
            "points": forecast_points
        }

forecasting_engine = ForecastingEngine()
