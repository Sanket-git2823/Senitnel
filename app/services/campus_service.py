"""Campus and Building Hierarchy Service for SENTINEL."""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.models import Campus, Building, Room, Telemetry, Equipment, Timetable, Incident

class CampusService:
    def __init__(self):
        pass

    def get_all_buildings(self, db: Session) -> List[Dict[str, Any]]:
        buildings = db.query(Building).all()
        results = []
        for b in buildings:
            room_count = len(b.rooms)
            # Calculate total current power from latest telemetry of rooms
            b_power = 0.0
            has_anomaly = False
            for r in b.rooms:
                latest_t = db.query(Telemetry).filter_by(room_id=r.id).order_by(Telemetry.timestamp.desc()).first()
                if latest_t:
                    b_power += latest_t.power_kw
                if r.current_state == "ANOMALOUS":
                    has_anomaly = True

            results.append({
                "id": b.id,
                "campus_id": b.campus_id,
                "name": b.name,
                "code": b.code,
                "total_floors": b.total_floors,
                "building_type": b.building_type,
                "baseline_base_load_kw": b.baseline_base_load_kw,
                "total_rooms": room_count,
                "current_power_kw": round(b_power, 2),
                "status": "ANOMALY_ALERT" if has_anomaly else "NORMAL"
            })
        return results

    def get_building_detail(self, db: Session, building_id: str) -> Optional[Dict[str, Any]]:
        b = db.query(Building).filter(
            (Building.id == building_id) | (Building.code == building_id)
        ).first()
        if not b:
            return None

        rooms_res = []
        total_power = 0.0
        for r in b.rooms:
            latest_t = db.query(Telemetry).filter_by(room_id=r.id).order_by(Telemetry.timestamp.desc()).first()
            power = latest_t.power_kw if latest_t else r.typical_idle_kw
            temp = latest_t.temperature_c if latest_t else 26.0
            occ = latest_t.occupancy if latest_t else 0
            sched = latest_t.scheduled if latest_t else False
            total_power += power

            rooms_res.append({
                "id": r.id,
                "building_id": r.building_id,
                "name": r.name,
                "room_type": r.room_type,
                "floor": r.floor,
                "capacity": r.capacity,
                "typical_idle_kw": r.typical_idle_kw,
                "typical_active_kw": r.typical_active_kw,
                "current_state": r.current_state,
                "latest_power_kw": round(power, 3),
                "latest_temp_c": round(temp, 1),
                "latest_occupancy": occ,
                "is_scheduled_now": sched
            })

        return {
            "id": b.id,
            "campus_id": b.campus_id,
            "name": b.name,
            "code": b.code,
            "total_floors": b.total_floors,
            "building_type": b.building_type,
            "baseline_base_load_kw": b.baseline_base_load_kw,
            "total_rooms": len(b.rooms),
            "current_power_kw": round(total_power, 2),
            "status": "NORMAL",
            "rooms": rooms_res
        }

    def get_all_rooms(self, db: Session, building_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query = db.query(Room)
        if building_id:
            query = query.filter_by(building_id=building_id)
        rooms = query.all()

        results = []
        for r in rooms:
            latest_t = db.query(Telemetry).filter_by(room_id=r.id).order_by(Telemetry.timestamp.desc()).first()
            results.append({
                "id": r.id,
                "building_id": r.building_id,
                "name": r.name,
                "room_type": r.room_type,
                "floor": r.floor,
                "capacity": r.capacity,
                "typical_idle_kw": r.typical_idle_kw,
                "typical_active_kw": r.typical_active_kw,
                "current_state": r.current_state,
                "latest_power_kw": round(latest_t.power_kw, 3) if latest_t else r.typical_idle_kw,
                "latest_temp_c": round(latest_t.temperature_c, 1) if latest_t else 25.0,
                "latest_occupancy": latest_t.occupancy if latest_t else 0,
                "is_scheduled_now": latest_t.scheduled if latest_t else False
            })
        return results

    def get_room_detail(self, db: Session, room_id: str) -> Optional[Dict[str, Any]]:
        r = db.query(Room).filter_by(id=room_id).first()
        if not r:
            return None

        latest_t = db.query(Telemetry).filter_by(room_id=r.id).order_by(Telemetry.timestamp.desc()).first()

        return {
            "id": r.id,
            "building_id": r.building_id,
            "name": r.name,
            "room_type": r.room_type,
            "floor": r.floor,
            "capacity": r.capacity,
            "typical_idle_kw": r.typical_idle_kw,
            "typical_active_kw": r.typical_active_kw,
            "current_state": r.current_state,
            "latest_power_kw": round(latest_t.power_kw, 3) if latest_t else r.typical_idle_kw,
            "latest_temp_c": round(latest_t.temperature_c, 1) if latest_t else 25.0,
            "latest_occupancy": latest_t.occupancy if latest_t else 0,
            "is_scheduled_now": latest_t.scheduled if latest_t else False,
            "equipment": r.equipment,
            "devices": r.devices,
            "timetables": r.timetables
        }

campus_service = CampusService()
