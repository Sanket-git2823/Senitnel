"""Impact Calculation Engine for Financial and Environmental Metrics."""

from typing import Dict, Any
from app.core.config import settings

class ImpactEngine:
    def __init__(
        self,
        tariff_per_kwh: float = settings.ENERGY_TARIFF_PER_KWH,
        emission_factor_kg_co2_per_kwh: float = settings.EMISSION_FACTOR_KG_CO2_PER_KWH
    ):
        self.tariff_per_kwh = tariff_per_kwh
        self.emission_factor_kg_co2_per_kwh = emission_factor_kg_co2_per_kwh

    def calculate_incident_impact(
        self,
        actual_power_kw: float,
        expected_power_kw: float,
        duration_hours: float = 1.0
    ) -> Dict[str, Any]:
        """Calculates instantaneous excess and projected savings if anomaly is resolved."""
        excess_power_kw = max(0.0, actual_power_kw - expected_power_kw)
        excess_energy_kwh = excess_power_kw * duration_hours

        # Projections assuming 8 hours idle waste per day if unmitigated
        daily_excess_kwh = excess_power_kw * 8.0
        monthly_excess_kwh = daily_excess_kwh * 26.0 # 26 working days

        daily_cost_estimate = daily_excess_kwh * self.tariff_per_kwh
        monthly_cost_estimate = monthly_excess_kwh * self.tariff_per_kwh

        daily_co2_estimate_kg = daily_excess_kwh * self.emission_factor_kg_co2_per_kwh
        monthly_co2_estimate_kg = monthly_excess_kwh * self.emission_factor_kg_co2_per_kwh

        # Environmental equivalents (illustrative)
        # 1 mature tree absorbs ~22 kg CO2 per year (~0.06 kg/day)
        equivalent_trees_needed = round(daily_co2_estimate_kg / 0.06, 1)

        return {
            "excess_power_kw": round(excess_power_kw, 3),
            "excess_energy_kwh": round(excess_energy_kwh, 3),
            "estimated_cost_impact": round(excess_energy_kwh * self.tariff_per_kwh, 2),
            "estimated_carbon_kg": round(excess_energy_kwh * self.emission_factor_kg_co2_per_kwh, 2),
            "projections": {
                "daily_excess_kwh": round(daily_excess_kwh, 2),
                "daily_cost_savings_estimate": round(daily_cost_estimate, 2),
                "daily_carbon_savings_estimate_kg": round(daily_co2_estimate_kg, 2),
                "monthly_excess_kwh": round(monthly_excess_kwh, 2),
                "monthly_cost_savings_estimate": round(monthly_cost_estimate, 2),
                "monthly_carbon_savings_estimate_kg": round(monthly_co2_estimate_kg, 2),
                "equivalent_trees_needed": equivalent_trees_needed,
                "disclaimer": "All figures are modeled projections based on current deviation and configured tariffs."
            }
        }

impact_engine = ImpactEngine()
