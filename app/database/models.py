import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database.connection import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Campus(Base):
    __tablename__ = "campuses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False, unique=True)
    location = Column(String(200), nullable=False)
    timezone = Column(String(50), default="Asia/Kolkata")
    created_at = Column(DateTime, default=utc_now)

    buildings = relationship("Building", back_populates="campus", cascade="all, delete-orphan")
    weather_records = relationship("Weather", back_populates="campus", cascade="all, delete-orphan")

class Building(Base):
    __tablename__ = "buildings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campus_id = Column(String(36), ForeignKey("campuses.id"), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(20), nullable=False, unique=True)
    total_floors = Column(Integer, default=4)
    building_type = Column(String(50), default="academic")  # academic, library, hostel, admin
    baseline_base_load_kw = Column(Float, default=10.0)
    created_at = Column(DateTime, default=utc_now)

    campus = relationship("Campus", back_populates="buildings")
    rooms = relationship("Room", back_populates="building", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(50), primary_key=True)  # e.g., "LAB-204"
    building_id = Column(String(36), ForeignKey("buildings.id"), nullable=False)
    name = Column(String(100), nullable=False)
    room_type = Column(String(50), nullable=False)  # laboratory, classroom, library, hostel_dorm
    floor = Column(Integer, default=1)
    capacity = Column(Integer, default=40)
    typical_idle_kw = Column(Float, default=0.8)
    typical_active_kw = Column(Float, default=4.5)
    current_state = Column(String(50), default="IDLE")  # IDLE, ACTIVE, MAINTENANCE, ANOMALOUS
    created_at = Column(DateTime, default=utc_now)

    building = relationship("Building", back_populates="rooms")
    devices = relationship("Device", back_populates="room", cascade="all, delete-orphan")
    equipment = relationship("Equipment", back_populates="room", cascade="all, delete-orphan")
    timetables = relationship("Timetable", back_populates="room", cascade="all, delete-orphan")
    telemetry = relationship("Telemetry", back_populates="room", cascade="all, delete-orphan")
    anomalies = relationship("Anomaly", back_populates="room", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="room", cascade="all, delete-orphan")
    work_orders = relationship("WorkOrder", back_populates="room", cascade="all, delete-orphan")

class Device(Base):
    __tablename__ = "devices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    room_id = Column(String(50), ForeignKey("rooms.id"), nullable=False)
    device_code = Column(String(50), nullable=False, unique=True)
    device_type = Column(String(50), default="ESP32_POWER_MONITOR")
    ip_address = Column(String(45), nullable=True)
    status = Column(String(20), default="ONLINE")
    last_seen = Column(DateTime, default=utc_now)
    created_at = Column(DateTime, default=utc_now)

    room = relationship("Room", back_populates="devices")

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    room_id = Column(String(50), ForeignKey("rooms.id"), nullable=False)
    name = Column(String(100), nullable=False)
    equipment_type = Column(String(50), nullable=False)  # hvac, lighting, computer_cluster, projector, lab_rig, router
    rated_power_kw = Column(Float, default=1.0)
    status = Column(String(20), default="STANDBY")  # STANDBY, RUNNING, OFF, FAULT
    is_critical = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    room = relationship("Room", back_populates="equipment")

class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    room_id = Column(String(50), ForeignKey("rooms.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    power_kw = Column(Float, nullable=False)
    expected_power_kw = Column(Float, nullable=True)
    temperature_c = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    occupancy = Column(Integer, default=0)
    scheduled = Column(Boolean, default=False)
    source = Column(String(20), default="simulated")  # simulated, manual_import, physical
    created_at = Column(DateTime, default=utc_now)

    __table_args__ = (
        UniqueConstraint('room_id', 'timestamp', name='uq_room_timestamp'),
        Index('idx_room_timestamp', 'room_id', 'timestamp'),
    )

    room = relationship("Room", back_populates="telemetry")

class Timetable(Base):
    __tablename__ = "timetables"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    room_id = Column(String(50), ForeignKey("rooms.id"), nullable=False)
    course_name = Column(String(100), nullable=False)
    instructor = Column(String(100), nullable=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(String(5), nullable=False)  # HH:MM (24-hour)
    end_time = Column(String(5), nullable=False)    # HH:MM (24-hour)
    expected_occupancy = Column(Integer, default=30)
    created_at = Column(DateTime, default=utc_now)

    room = relationship("Room", back_populates="timetables")

class Weather(Base):
    __tablename__ = "weather"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campus_id = Column(String(36), ForeignKey("campuses.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    outside_temp_c = Column(Float, default=28.0)
    humidity_pct = Column(Float, default=60.0)
    conditions = Column(String(50), default="Partly Cloudy")
    created_at = Column(DateTime, default=utc_now)

    campus = relationship("Campus", back_populates="weather_records")

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    room_id = Column(String(50), ForeignKey("rooms.id"), nullable=False, index=True)
    detected_at = Column(DateTime, default=utc_now, index=True)
    actual_power_kw = Column(Float, nullable=False)
    expected_power_kw = Column(Float, nullable=False)
    deviation_pct = Column(Float, nullable=False)
    anomaly_type = Column(String(50), nullable=False)  # UNEXPECTED_SPIKE, IDLE_RUNNING, OUT_OF_SCHEDULE, CONSUMPTION_DRIFT
    severity = Column(String(20), default="MEDIUM")   # LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Float, default=0.85)
    root_cause_hypothesis = Column(String(200), nullable=True)
    evidence_metadata = Column(JSON, nullable=True)
    status = Column(String(20), default="ACTIVE")      # ACTIVE, RESOLVED, SUPPRESSED
    created_at = Column(DateTime, default=utc_now)

    room = relationship("Room", back_populates="anomalies")
    incidents = relationship("Incident", back_populates="anomaly")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_code = Column(String(20), unique=True, nullable=False)  # e.g., "INC-2041"
    room_id = Column(String(50), ForeignKey("rooms.id"), nullable=False, index=True)
    anomaly_id = Column(String(36), ForeignKey("anomalies.id"), nullable=True)
    title = Column(String(200), nullable=False)
    severity = Column(String(20), default="HIGH")     # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(20), default="NEW")        # NEW, INVESTIGATING, ACKNOWLEDGED, RESOLVED, VERIFIED
    reason = Column(Text, nullable=False)
    possible_cause = Column(String(200), nullable=True)
    duration_minutes = Column(Integer, default=0)
    excess_power_kw = Column(Float, default=0.0)
    excess_energy_kwh = Column(Float, default=0.0)
    estimated_cost_impact = Column(Float, default=0.0)
    estimated_carbon_kg = Column(Float, default=0.0)
    evidence = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    resolved_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)

    room = relationship("Room", back_populates="incidents")
    anomaly = relationship("Anomaly", back_populates="incidents")
    recommendations = relationship("Recommendation", back_populates="incident", cascade="all, delete-orphan")
    work_orders = relationship("WorkOrder", back_populates="incident")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_id = Column(String(36), ForeignKey("incidents.id"), nullable=False)
    title = Column(String(200), nullable=False)
    recommended_action = Column(Text, nullable=False)
    estimated_savings_kwh_day = Column(Float, default=0.0)
    estimated_cost_savings_daily = Column(Float, default=0.0)
    estimated_carbon_savings_daily = Column(Float, default=0.0)
    priority = Column(String(20), default="HIGH")
    created_at = Column(DateTime, default=utc_now)

    incident = relationship("Incident", back_populates="recommendations")

class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    work_order_code = Column(String(20), unique=True, nullable=False)  # e.g., "WO-2041"
    incident_id = Column(String(36), ForeignKey("incidents.id"), nullable=True)
    room_id = Column(String(50), ForeignKey("rooms.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    priority = Column(String(20), default="HIGH")     # LOW, MEDIUM, HIGH, CRITICAL
    order_type = Column(String(50), default="HVAC / Energy")
    status = Column(String(20), default="OPEN")        # OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, VERIFIED
    assigned_team = Column(String(100), default="Facilities HVAC Team")
    assigned_to_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    description = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    estimated_impact_kwh_day = Column(Float, default=0.0)
    estimated_cost_savings = Column(Float, default=0.0)
    estimated_carbon_savings = Column(Float, default=0.0)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    resolved_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)

    room = relationship("Room", back_populates="work_orders")
    incident = relationship("Incident", back_populates="work_orders")
    assigned_user = relationship("User", back_populates="work_orders")
    updates = relationship("WorkOrderUpdate", back_populates="work_order", cascade="all, delete-orphan")

class WorkOrderUpdate(Base):
    __tablename__ = "work_order_updates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    work_order_id = Column(String(36), ForeignKey("work_orders.id"), nullable=False)
    author = Column(String(100), default="System")
    update_text = Column(Text, nullable=False)
    previous_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=utc_now)

    work_order = relationship("WorkOrder", back_populates="updates")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    role = Column(String(50), default="OPERATOR")  # OPERATOR, TECHNICIAN, MANAGER, ADMIN
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    work_orders = relationship("WorkOrder", back_populates="assigned_user")
