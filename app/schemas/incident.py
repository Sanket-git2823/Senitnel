from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    incident_id: str
    title: str
    recommended_action: str
    estimated_savings_kwh_day: float
    estimated_cost_savings_daily: float
    estimated_carbon_savings_daily: float
    priority: str

class IncidentBase(BaseModel):
    room_id: str
    title: str
    severity: str = "HIGH"
    reason: str
    possible_cause: Optional[str] = None
    duration_minutes: int = 0
    excess_power_kw: float = 0.0
    excess_energy_kwh: float = 0.0
    estimated_cost_impact: float = 0.0
    estimated_carbon_kg: float = 0.0
    evidence: Optional[Any] = None

class IncidentCreate(IncidentBase):
    anomaly_id: Optional[str] = None

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    possible_cause: Optional[str] = None

class IncidentResponse(IncidentBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    incident_code: str
    anomaly_id: Optional[str] = None
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    recommendations: List[RecommendationResponse] = []
