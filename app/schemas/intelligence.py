from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AnomalyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    room_id: str
    detected_at: datetime
    actual_power_kw: float
    expected_power_kw: float
    deviation_pct: float
    anomaly_type: str
    severity: str
    confidence: float
    root_cause_hypothesis: Optional[str] = None
    evidence_metadata: Optional[Dict[str, Any]] = None
    status: str

class IntelligenceOverviewResponse(BaseModel):
    timestamp: datetime
    active_anomalies_count: int
    critical_rooms: List[str]
    total_excess_kw: float
    detection_methods_used: List[str]

class InsightItem(BaseModel):
    id: str
    room_id: str
    building_name: str
    title: str
    severity: str
    category: str
    description: str
    financial_impact_monthly: float
    suggested_action: str

class ForecastPoint(BaseModel):
    timestamp: str
    expected_power_kw: float
    projected_power_kw: float
    upper_bound_kw: float
    lower_bound_kw: float

class ForecastResponse(BaseModel):
    room_id: str
    generated_at: datetime
    forecast_horizon_hours: int
    points: List[ForecastPoint]

class AssistantQueryRequest(BaseModel):
    query: str

class AssistantQueryResponse(BaseModel):
    query: str
    intent: str
    target_room: Optional[str] = None
    data_context: Dict[str, Any]
    explanation: str
    suggested_actions: List[str]
    source: str # "rules_and_data_engine" or "llm_enhanced"
