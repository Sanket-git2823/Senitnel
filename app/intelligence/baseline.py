"""Baseline Energy Model for SENTINEL Campus Infrastructure."""

from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.models import Room, Timetable, Telemetry

class BaselineEngine:
    def __init__(self):
        pass

    def calculate_expected_power(
        self,
        db: Session,
        room_id: str,
        timestamp: datetime,
        occupancy: int = 0,
        scheduled: Optional[bool] = None
    ) -> Dict[str, Any]:
        """Calculates expected power consumption for a room given operational context."""
        room = db.query(Room).filter_by(id=room_id).first()
        if not room:
            return {"expected_power_kw": 1.0, "is_scheduled": False, "confidence": 0.5, "source": "fallback"}

        # 1. Determine if timetable says room is scheduled
        day_of_week = timestamp.weekday()
        current_time_str = timestamp.strftime("%H:%M")

        is_scheduled = scheduled
        active_class = None
        if is_scheduled is None:
            # Query timetable
            tt_entry = db.query(Timetable).filter(
                Timetable.room_id == room_id,
                Timetable.day_of_week == day_of_week,
                Timetable.start_time <= current_time_str,
                Timetable.end_time > current_time_str
            ).first()
            if tt_entry:
                is_scheduled = True
                active_class = tt_entry.course_name
            else:
                is_scheduled = False

        # 2. Query historical telemetry for this room, day_of_week, and hour for empirical baseline
        hour = timestamp.hour
        historical_avg = db.query(
            func.avg(Telemetry.power_kw)
        ).filter(
            Telemetry.room_id == room_id,
            func.strftime('%H', Telemetry.timestamp) == f"{hour:02d}"
        ).scalar()

        # 3. Combine physical room specs with occupancy and schedule
        idle_kw = room.typical_idle_kw
        active_kw = room.typical_active_kw

        if is_scheduled or occupancy > 0:
            # Scaled by occupancy ratio if occupied
            occ_ratio = min(1.0, occupancy / max(1, room.capacity))
            expected_kw = idle_kw + (active_kw - idle_kw) * (0.6 + 0.4 * occ_ratio)
        else:
            expected_kw = idle_kw

        # Smooth slightly with historical average if available
        if historical_avg is not None and historical_avg > 0:
            # Weighted combination: 70% contextual model, 30% historical mean
            blended_kw = 0.75 * expected_kw + 0.25 * float(historical_avg)
        else:
            blended_kw = expected_kw

        return {
            "room_id": room_id,
            "expected_power_kw": round(float(blended_kw), 3),
            "idle_baseline_kw": round(float(idle_kw), 3),
            "active_baseline_kw": round(float(active_kw), 3),
            "is_scheduled": bool(is_scheduled),
            "active_class": active_class,
            "confidence": 0.92
        }

baseline_engine = BaselineEngine()
