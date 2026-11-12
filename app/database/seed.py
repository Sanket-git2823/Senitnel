import random
from datetime import datetime, timedelta, timezone
import numpy as np
from sqlalchemy.orm import Session
from app.database.connection import engine, SessionLocal, Base
from app.database.models import (
    Campus, Building, Room, Device, Equipment, Timetable, Telemetry, Weather, User
)
from app.core.logging import logger

def seed_database(db: Session, force: bool = False):
    """Seed campus, buildings, rooms, equipment, schedules, and historical telemetry."""
    # Ensure all tables are created
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    existing_campus = db.query(Campus).filter_by(name="DEMO CAMPUS").first()
    if existing_campus and not force:
        logger.info("Database already seeded with DEMO CAMPUS.")
        return existing_campus

    if force:
        logger.info("Force re-seeding database. Dropping and re-creating all tables...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    logger.info("Seeding database with campus hierarchy, equipment, and historical telemetry...")
    random.seed(42)
    np.random.seed(42)

    # 1. Campus
    campus = Campus(
        id="CAMPUS-DEMO-01",
        name="DEMO CAMPUS",
        location="North Campus Tech Hub, Silicon Valley / Bengaluru",
        timezone="Asia/Kolkata"
    )
    db.add(campus)
    db.flush()

    # 2. Users
    users_data = [
        User(id="USR-001", username="admin", full_name="Sentinel Administrator", email="admin@sentinel.campus.edu", role="ADMIN"),
        User(id="USR-002", username="rajesh_ops", full_name="Rajesh Kumar (Ops Lead)", email="rajesh.ops@sentinel.campus.edu", role="OPERATOR"),
        User(id="USR-003", username="sunil_hvac", full_name="Sunil Verma (HVAC Tech)", email="sunil.hvac@sentinel.campus.edu", role="TECHNICIAN"),
    ]
    for u in users_data:
        db.add(u)

    # 3. Buildings
    buildings_specs = [
        {"id": "BLD-AB-A", "name": "Academic Block A", "code": "AB-A", "floors": 4, "type": "academic", "base_load": 14.5},
        {"id": "BLD-AB-B", "name": "Academic Block B", "code": "AB-B", "floors": 4, "type": "academic", "base_load": 12.0},
        {"id": "BLD-AB-C", "name": "Academic Block C", "code": "AB-C", "floors": 4, "type": "academic", "base_load": 11.5},
        {"id": "BLD-RC", "name": "Research Center", "code": "RC", "floors": 5, "type": "research", "base_load": 22.0},
        {"id": "BLD-CL", "name": "Central Library", "code": "CL", "floors": 3, "type": "library", "base_load": 18.0},
        {"id": "BLD-HST-A", "name": "Hostel A", "code": "HST-A", "floors": 6, "type": "hostel", "base_load": 16.0},
        {"id": "BLD-HST-B", "name": "Hostel B", "code": "HST-B", "floors": 6, "type": "hostel", "base_load": 15.5},
        {"id": "BLD-ADMIN", "name": "Administration Building", "code": "ADMIN", "floors": 3, "type": "administration", "base_load": 9.5},
    ]

    building_map = {}
    for b in buildings_specs:
        b_obj = Building(
            id=b["id"],
            campus_id=campus.id,
            name=b["name"],
            code=b["code"],
            total_floors=b["floors"],
            building_type=b["type"],
            baseline_base_load_kw=b["base_load"]
        )
        db.add(b_obj)
        building_map[b["code"]] = b_obj
    db.flush()

    # 4. Rooms
    rooms_data = [
        {
            "id": "LAB-204",
            "building_id": building_map["AB-A"].id,
            "name": "Advanced IoT & Computing Lab",
            "room_type": "laboratory",
            "floor": 2,
            "capacity": 35,
            "typical_idle_kw": 0.91,
            "typical_active_kw": 4.85,
            "current_state": "IDLE"
        },
        {
            "id": "LAB-205",
            "building_id": building_map["AB-A"].id,
            "name": "Electronics & Sensors Lab",
            "room_type": "laboratory",
            "floor": 2,
            "capacity": 30,
            "typical_idle_kw": 0.88,
            "typical_active_kw": 4.20,
            "current_state": "IDLE"
        },
        {
            "id": "CLASS-301",
            "building_id": building_map["AB-B"].id,
            "name": "Lecture Hall 301",
            "room_type": "classroom",
            "floor": 3,
            "capacity": 60,
            "typical_idle_kw": 0.32,
            "typical_active_kw": 2.85,
            "current_state": "IDLE"
        },
        {
            "id": "CLASS-302",
            "building_id": building_map["AB-B"].id,
            "name": "Interactive Classroom 302",
            "room_type": "classroom",
            "floor": 3,
            "capacity": 50,
            "typical_idle_kw": 0.30,
            "typical_active_kw": 2.60,
            "current_state": "IDLE"
        },
        {
            "id": "LIBRARY-01",
            "building_id": building_map["CL"].id,
            "name": "Main Digital Reading Commons",
            "room_type": "library",
            "floor": 1,
            "capacity": 120,
            "typical_idle_kw": 1.95,
            "typical_active_kw": 7.40,
            "current_state": "ACTIVE"
        },
        {
            "id": "HOSTEL-A-105",
            "building_id": building_map["HST-A"].id,
            "name": "Hostel A Dorm 105",
            "room_type": "hostel_dorm",
            "floor": 1,
            "capacity": 2,
            "typical_idle_kw": 0.12,
            "typical_active_kw": 1.45,
            "current_state": "ACTIVE"
        },
        {
            "id": "HOSTEL-B-203",
            "building_id": building_map["HST-B"].id,
            "name": "Hostel B Dorm 203",
            "room_type": "hostel_dorm",
            "floor": 2,
            "capacity": 2,
            "typical_idle_kw": 0.12,
            "typical_active_kw": 1.50,
            "current_state": "ACTIVE"
        }
    ]

    for r in rooms_data:
        r_obj = Room(**r)
        db.add(r_obj)
    db.flush()

    # 5. Devices & Equipment
    equipment_map = {
        "LAB-204": [
            ("Dual Inverter AC Unit 1", "hvac", 1.8, "STANDBY", True),
            ("Dual Inverter AC Unit 2", "hvac", 1.8, "STANDBY", True),
            ("30x Student Workstations", "computer_cluster", 2.2, "STANDBY", False),
            ("Ceiling High-Efficiency LED Grid", "lighting", 0.5, "OFF", False),
            ("4K Laser Projector", "projector", 0.35, "OFF", False),
            ("Lab Switch & Edge Gateways", "router", 0.30, "RUNNING", True),
        ],
        "LAB-205": [
            ("Split AC Unit", "hvac", 2.0, "STANDBY", True),
            ("Bench Power Supplies & Scopes", "lab_rig", 1.6, "STANDBY", False),
            ("LED Grid", "lighting", 0.45, "OFF", False),
            ("Instructor Terminal", "computer_cluster", 0.25, "STANDBY", False),
        ],
        "CLASS-301": [
            ("Classroom AC Unit 1", "hvac", 1.5, "STANDBY", False),
            ("Classroom AC Unit 2", "hvac", 1.5, "STANDBY", False),
            ("Recessed LED Lights", "lighting", 0.4, "OFF", False),
            ("Smart AV Podium", "projector", 0.3, "OFF", False),
        ],
        "CLASS-302": [
            ("Classroom AC Unit", "hvac", 1.8, "STANDBY", False),
            ("Recessed LED Lights", "lighting", 0.35, "OFF", False),
            ("Smart Screen & Audio", "projector", 0.3, "OFF", False),
        ],
        "LIBRARY-01": [
            ("Central AHU VAV Terminal", "hvac", 4.2, "RUNNING", True),
            ("Architectural Ambient Lighting", "lighting", 1.4, "RUNNING", False),
            ("40x Thin Client Terminals", "computer_cluster", 1.8, "RUNNING", False),
        ],
        "HOSTEL-A-105": [
            ("Dorm Window AC 1.0 Ton", "hvac", 1.1, "RUNNING", False),
            ("Room Lights & Ceiling Fan", "lighting", 0.2, "RUNNING", False),
        ],
        "HOSTEL-B-203": [
            ("Dorm Window AC 1.0 Ton", "hvac", 1.1, "RUNNING", False),
            ("Room Lights & Ceiling Fan", "lighting", 0.2, "RUNNING", False),
        ]
    }

    for room_id, eq_list in equipment_map.items():
        # Device
        dev = Device(
            room_id=room_id,
            device_code=f"ESP32-{room_id}",
            device_type="ESP32_POWER_MONITOR",
            ip_address=f"10.16.2.{random.randint(10, 240)}",
            status="ONLINE",
            last_seen=datetime.now(timezone.utc)
        )
        db.add(dev)

        # Equipment
        for eq_name, eq_type, rated_kw, status, critical in eq_list:
            eq = Equipment(
                room_id=room_id,
                name=eq_name,
                equipment_type=eq_type,
                rated_power_kw=rated_kw,
                status=status,
                is_critical=critical
            )
            db.add(eq)
    db.flush()

    # 6. Timetables (Weekly recurring schedule)
    # Days: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    timetables_data = [
        # LAB-204: Mon, Wed, Fri 14:00-17:00, Tue, Thu 10:00-12:00
        {"room_id": "LAB-204", "course_name": "CS302: IoT Systems Lab", "instructor": "Prof. Alan Turing", "day_of_week": 0, "start_time": "14:00", "end_time": "17:00", "expected_occupancy": 32},
        {"room_id": "LAB-204", "course_name": "CS302: IoT Systems Lab", "instructor": "Prof. Alan Turing", "day_of_week": 2, "start_time": "14:00", "end_time": "17:00", "expected_occupancy": 32},
        {"room_id": "LAB-204", "course_name": "CS302: IoT Systems Lab", "instructor": "Prof. Alan Turing", "day_of_week": 4, "start_time": "14:00", "end_time": "17:00", "expected_occupancy": 32},
        {"room_id": "LAB-204", "course_name": "CS401: Cloud Computing Practicum", "instructor": "Dr. Barbara Liskov", "day_of_week": 1, "start_time": "10:00", "end_time": "12:00", "expected_occupancy": 28},
        {"room_id": "LAB-204", "course_name": "CS401: Cloud Computing Practicum", "instructor": "Dr. Barbara Liskov", "day_of_week": 3, "start_time": "10:00", "end_time": "12:00", "expected_occupancy": 28},

        # LAB-205: Mon-Thu 09:00-12:00
        {"room_id": "LAB-205", "course_name": "EE201: Analog Circuits Lab", "instructor": "Prof. Claude Shannon", "day_of_week": 0, "start_time": "09:00", "end_time": "12:00", "expected_occupancy": 25},
        {"room_id": "LAB-205", "course_name": "EE201: Analog Circuits Lab", "instructor": "Prof. Claude Shannon", "day_of_week": 1, "start_time": "09:00", "end_time": "12:00", "expected_occupancy": 25},
        {"room_id": "LAB-205", "course_name": "EE201: Analog Circuits Lab", "instructor": "Prof. Claude Shannon", "day_of_week": 2, "start_time": "09:00", "end_time": "12:00", "expected_occupancy": 25},
        {"room_id": "LAB-205", "course_name": "EE201: Analog Circuits Lab", "instructor": "Prof. Claude Shannon", "day_of_week": 3, "start_time": "09:00", "end_time": "12:00", "expected_occupancy": 25},
    ]
    # CLASS-301: Mon-Fri 09:00-11:00
    for d in range(5):
        timetables_data.append({
            "room_id": "CLASS-301", "course_name": "MATH101: Linear Algebra", "instructor": "Dr. Katherine Johnson",
            "day_of_week": d, "start_time": "09:00", "end_time": "11:00", "expected_occupancy": 55
        })
    # CLASS-302: Mon-Fri 11:30-13:30
    for d in range(5):
        timetables_data.append({
            "room_id": "CLASS-302", "course_name": "CS201: Data Structures", "instructor": "Dr. Donald Knuth",
            "day_of_week": d, "start_time": "11:30", "end_time": "13:30", "expected_occupancy": 48
        })

    for tt in timetables_data:
        db.add(Timetable(**tt))
    db.flush()

    # 7. Weather history (past 7 days hourly)
    now = datetime.now(timezone.utc)
    for h in range(7 * 24):
        t = now - timedelta(hours=7*24 - h)
        hour = t.hour
        base_temp = 24.0 + 8.0 * np.sin((hour - 8) * np.pi / 12)  # Peak at 14:00
        temp = round(float(base_temp + np.random.normal(0, 0.8)), 1)
        humidity = round(float(max(30.0, min(90.0, 75.0 - (temp - 24.0) * 2.2))), 1)
        w = Weather(
            campus_id=campus.id,
            timestamp=t,
            outside_temp_c=temp,
            humidity_pct=humidity,
            conditions="Clear" if temp > 28 else "Partly Cloudy"
        )
        db.add(w)

    # 8. Deterministic Historical Telemetry (Past 7 days, 1-hour interval for baseline & isolation forest training)
    logger.info("Generating 7 days of realistic baseline telemetry across demo rooms...")
    telemetry_batch = []
    
    # We will step hourly for past 7 days up to now
    for room_info in rooms_data:
        r_id = room_info["id"]
        idle_kw = room_info["typical_idle_kw"]
        active_kw = room_info["typical_active_kw"]

        for h in range(7 * 24):
            t = now - timedelta(hours=7*24 - h)
            day = t.weekday()
            hour = t.hour

            # Check if scheduled active
            is_scheduled = False
            if r_id == "LAB-204":
                if day in (0, 2, 4) and 14 <= hour < 17:
                    is_scheduled = True
                elif day in (1, 3) and 10 <= hour < 12:
                    is_scheduled = True
            elif r_id == "LAB-205":
                if day in (0, 1, 2, 3) and 9 <= hour < 12:
                    is_scheduled = True
            elif r_id in ("CLASS-301", "CLASS-302"):
                if day < 5 and 9 <= hour < 16:
                    is_scheduled = True
            elif r_id == "LIBRARY-01":
                if 8 <= hour < 22:
                    is_scheduled = True
            elif r_id.startswith("HOSTEL"):
                if hour >= 18 or hour < 8:
                    is_scheduled = True

            if is_scheduled:
                occ = random.randint(int(room_info["capacity"] * 0.6), room_info["capacity"])
                power = active_kw * (0.85 + 0.3 * (occ / room_info["capacity"])) + np.random.normal(0, 0.08)
                temp = 24.0 + np.random.normal(0, 0.5)
            else:
                occ = 0
                power = idle_kw + np.random.normal(0, 0.04)
                temp = 26.5 + np.random.normal(0, 0.4)

            power = max(0.05, round(float(power), 3))
            expected_power = round(float(active_kw if is_scheduled else idle_kw), 3)

            telem = Telemetry(
                room_id=r_id,
                timestamp=t,
                power_kw=power,
                expected_power_kw=expected_power,
                temperature_c=round(float(temp), 1),
                humidity=round(float(55.0 + np.random.normal(0, 3)), 1),
                occupancy=occ,
                scheduled=is_scheduled,
                source="simulated"
            )
            telemetry_batch.append(telem)

    db.bulk_save_objects(telemetry_batch)
    db.commit()
    logger.info(f"Database seeded successfully: {len(buildings_specs)} buildings, {len(rooms_data)} rooms, {len(telemetry_batch)} historical telemetry points.")
    return campus

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db, force=True)
    finally:
        db.close()
