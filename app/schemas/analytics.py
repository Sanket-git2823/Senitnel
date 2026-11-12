from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class OverviewResponse(BaseModel):
    campus_name: str
    timestamp: datetime
    total_power_kw: float
    expected_power_kw: float
    excess_power_kw: float
    active_anomalies_count: int
    open_incidents_count: int
    pending_work_orders_count: int
    estimated_daily_excess_cost: float
    estimated_daily_excess_co2_kg: float
    system_mode: str

class SystemStatusResponse(BaseModel):
    status: str
    database: str
    simulator_running: bool
    active_scenario: Optional[str]
    websocket_connections: int
    uptime_seconds: float
    timestamp: datetime

class EnergyAnalyticsResponse(BaseModel):
    interval: str
    timestamps: List[str]
    actual_kwh: List[float]
    expected_kwh: List[float]
    excess_kwh: List[float]

class CostAnalyticsResponse(BaseModel):
    currency: str
    total_excess_cost: float
    cost_by_building: Dict[str, float]
    cost_by_equipment_type: Dict[str, float]

class CarbonAnalyticsResponse(BaseModel):
    emission_factor_kg_per_kwh: float
    total_excess_co2_kg: float
    co2_by_building: Dict[str, float]
    equivalent_trees_needed: float
    equivalent_car_km: float

class BuildingAnalyticsResponse(BaseModel):
    building_code: str
    building_name: str
    current_power_kw: float
    expected_power_kw: float
    efficiency_score: float # 0 - 100
    active_issues: int
