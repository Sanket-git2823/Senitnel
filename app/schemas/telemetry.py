from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class TelemetryCreate(BaseModel):
    room_id: str = Field(..., description="Room identifier e.g. LAB-204")
    timestamp: datetime = Field(..., description="ISO 8601 timestamp of measurement")
    power_kw: float = Field(..., ge=0.0, le=100.0, description="Active power in kW")
    temperature_c: float = Field(..., ge=-10.0, le=60.0, description="Ambient temperature in Celsius")
    humidity: float = Field(..., ge=0.0, le=100.0, description="Relative humidity percentage")
    occupancy: int = Field(0, ge=0, description="Observed person count")
    scheduled: bool = Field(False, description="Whether an activity is scheduled")
    source: str = Field("simulated", description="Data origin (simulated, manual_import, physical)")

class TelemetryBulkCreate(BaseModel):
    readings: List[TelemetryCreate]

class TelemetryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    room_id: str
    timestamp: datetime
    power_kw: float
    expected_power_kw: Optional[float] = None
    temperature_c: float
    humidity: float
    occupancy: int
    scheduled: bool
    source: str
    created_at: datetime

class TelemetryHistoryResponse(BaseModel):
    room_id: str
    count: int
    data: List[TelemetryResponse]

class TelemetryLatestResponse(BaseModel):
    timestamp: datetime
    readings: List[TelemetryResponse]
