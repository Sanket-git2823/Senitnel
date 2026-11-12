"""Analytics and Comparative Metrics API Endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.analytics import (
    EnergyAnalyticsResponse, CostAnalyticsResponse, CarbonAnalyticsResponse, BuildingAnalyticsResponse
)
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/energy", response_model=EnergyAnalyticsResponse)
def get_energy_analytics(
    interval: str = Query("daily", description="daily, weekly, monthly"),
    db: Session = Depends(get_db)
):
    """Energy consumption curves comparing actual vs expected baseline kWh."""
    return analytics_service.get_energy_analytics(db, interval)

@router.get("/cost", response_model=CostAnalyticsResponse)
def get_cost_analytics(db: Session = Depends(get_db)):
    """Financial impact breakdown by campus building and equipment category."""
    return analytics_service.get_cost_analytics(db)

@router.get("/carbon", response_model=CarbonAnalyticsResponse)
def get_carbon_analytics(db: Session = Depends(get_db)):
    """Carbon footprint impact (kgCO2) and environmental offset equivalents."""
    return analytics_service.get_carbon_analytics(db)

@router.get("/buildings", response_model=List[BuildingAnalyticsResponse])
def get_buildings_efficiency(db: Session = Depends(get_db)):
    """Multi-building comparative efficiency scorecard."""
    return analytics_service.get_building_analytics(db)
