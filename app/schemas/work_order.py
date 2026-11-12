from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class WorkOrderUpdateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    author: str
    update_text: str
    previous_status: Optional[str] = None
    new_status: str
    created_at: datetime

class WorkOrderBase(BaseModel):
    room_id: str
    incident_id: Optional[str] = None
    title: str
    priority: str = "HIGH"
    order_type: str = "HVAC / Energy"
    assigned_team: str = "Facilities HVAC Team"
    description: str
    recommended_action: str
    estimated_impact_kwh_day: float = 0.0
    estimated_cost_savings: float = 0.0
    estimated_carbon_savings: float = 0.0

class WorkOrderCreate(WorkOrderBase):
    pass

class WorkOrderAssignRequest(BaseModel):
    assigned_team: Optional[str] = None
    assigned_to_user_id: Optional[str] = None
    notes: Optional[str] = None

class WorkOrderResolveRequest(BaseModel):
    resolution_notes: str
    resolved_by: str = "Technician"

class WorkOrderVerifyRequest(BaseModel):
    notes: Optional[str] = "Power consumption verified returning to normal baseline."

class WorkOrderResponse(WorkOrderBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    work_order_code: str
    status: str
    assigned_to_user_id: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    updates: List[WorkOrderUpdateResponse] = []
