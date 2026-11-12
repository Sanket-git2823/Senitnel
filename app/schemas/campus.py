from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class EquipmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    equipment_type: str
    rated_power_kw: float
    status: str
    is_critical: bool

class DeviceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    device_code: str
    device_type: str
    ip_address: Optional[str] = None
    status: str
    last_seen: Optional[datetime] = None

class TimetableResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    course_name: str
    instructor: Optional[str] = None
    day_of_week: int
    start_time: str
    end_time: str
    expected_occupancy: int

class RoomBase(BaseModel):
    id: str
    name: str
    room_type: str
    floor: int
    capacity: int
    typical_idle_kw: float
    typical_active_kw: float
    current_state: str

class RoomResponse(RoomBase):
    model_config = ConfigDict(from_attributes=True)
    building_id: str
    latest_power_kw: Optional[float] = None
    latest_temp_c: Optional[float] = None
    latest_occupancy: Optional[int] = None
    is_scheduled_now: Optional[bool] = None

class RoomDetailResponse(RoomResponse):
    model_config = ConfigDict(from_attributes=True)
    equipment: List[EquipmentResponse] = []
    devices: List[DeviceResponse] = []
    timetables: List[TimetableResponse] = []

class BuildingBase(BaseModel):
    id: str
    name: str
    code: str
    total_floors: int
    building_type: str
    baseline_base_load_kw: float

class BuildingResponse(BuildingBase):
    model_config = ConfigDict(from_attributes=True)
    campus_id: str
    total_rooms: int = 0
    current_power_kw: float = 0.0
    status: str = "NORMAL"

class BuildingDetailResponse(BuildingResponse):
    rooms: List[RoomResponse] = []

class CampusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    location: str
    timezone: str
    buildings: List[BuildingResponse] = []
