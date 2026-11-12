"""Deterministic Query Service for Ask Sentinel Assistant."""

import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.models import Room, Building, Telemetry, Anomaly, Incident, WorkOrder
from app.assistant.llm_client import llm_client
from app.core.config import settings

class AssistantQueryService:
    def __init__(self):
        pass

    async def answer_query(self, db: Session, query_text: str) -> Dict[str, Any]:
        normalized = query_text.lower().strip()
        
        # 1. Detect target room if mentioned
        room_match = re.search(r'\b(lab-\d+|class-\d+|library-\d+|hostel-[a-z]-\d+)\b', normalized, re.IGNORECASE)
        target_room_id = room_match.group(1).upper() if room_match else None

        # 2. Intent Classification
        if "why" in normalized and ("flagged" in normalized or "alert" in normalized or "incident" in normalized or target_room_id):
            return await self._handle_why_flagged(db, query_text, target_room_id or "LAB-204")

        elif "wasting" in normalized or "waste" in normalized or "highest consumption" in normalized or "highest power" in normalized:
            return await self._handle_highest_waste(db, query_text)

        elif "critical" in normalized or "anomaly" in normalized or "anomalies" in normalized:
            return await self._handle_critical_anomalies(db, query_text)

        elif "saving" in normalized or "save" in normalized or "cost" in normalized or "carbon" in normalized:
            return await self._handle_savings_impact(db, query_text)

        elif "status" in normalized or "overview" in normalized:
            return await self._handle_general_status(db, query_text)

        else:
            # Default to room check if room ID found, otherwise general energy breakdown
            if target_room_id:
                return await self._handle_why_flagged(db, query_text, target_room_id)
            return await self._handle_highest_waste(db, query_text)

    async def _handle_why_flagged(self, db: Session, query: str, room_id: str) -> Dict[str, Any]:
        room = db.query(Room).filter_by(id=room_id).first()
        latest_t = db.query(Telemetry).filter_by(room_id=room_id).order_by(Telemetry.timestamp.desc()).first()
        active_inc = db.query(Incident).filter(
            Incident.room_id == room_id,
            Incident.status.in_(["NEW", "INVESTIGATING", "ACKNOWLEDGED"])
        ).first()

        actual_kw = latest_t.power_kw if latest_t else (room.typical_idle_kw if room else 1.0)
        expected_kw = (latest_t.expected_power_kw if latest_t and latest_t.expected_power_kw else (room.typical_idle_kw if room else 0.9))
        occ = latest_t.occupancy if latest_t else 0
        sched = latest_t.scheduled if latest_t else False
        dev_pct = round(((actual_kw - expected_kw) / max(0.1, expected_kw)) * 100, 1)

        data_context = {
            "room_id": room_id,
            "room_name": room.name if room else room_id,
            "actual_power_kw": actual_kw,
            "expected_power_kw": expected_kw,
            "deviation_pct": dev_pct,
            "occupancy": occ,
            "scheduled": sched,
            "active_incident_code": active_inc.incident_code if active_inc else None,
            "incident_severity": active_inc.severity if active_inc else "NORMAL",
            "possible_cause": active_inc.possible_cause if active_inc else "HVAC / Standby"
        }

        # Deterministic ground-truth explanation
        if dev_pct > 30:
            cause = active_inc.possible_cause if active_inc else "an active HVAC cluster or equipment"
            explanation = (
                f"{room_id} is flagged because current power consumption ({actual_kw:.2f} kW) is {dev_pct:+.1f}% "
                f"above its expected baseline ({expected_kw:.2f} kW). The room currently has {occ} occupants and "
                f"{'a class is scheduled' if sched else 'no class scheduled'}. The primary hypothesis is {cause}."
            )
            suggested_actions = [
                f"Dispatch Facilities HVAC Team to {room_id}",
                f"Review Incident {active_inc.incident_code if active_inc else 'records'}",
                "Create maintenance work order"
            ]
        else:
            explanation = (
                f"{room_id} is operating nominally at {actual_kw:.2f} kW (expected {expected_kw:.2f} kW). "
                f"Occupancy is {occ} persons with {'scheduled activity' if sched else 'no scheduled class'}."
            )
            suggested_actions = ["No immediate corrective action required."]

        source = "rules_and_data_engine"
        if llm_client.is_configured:
            prompt = f"Explain to campus facility manager why {room_id} is flagged using verified facts: {data_context}."
            llm_text = await llm_client.generate_explanation(
                "You are SENTINEL AI assistant. Provide concise, factual campus facility explanations. Never invent numbers.",
                prompt
            )
            if llm_text:
                explanation = llm_text
                source = "llm_enhanced"

        return {
            "query": query,
            "intent": "ROOM_ANOMALY_EXPLANATION",
            "target_room": room_id,
            "data_context": data_context,
            "explanation": explanation,
            "suggested_actions": suggested_actions,
            "source": source
        }

    async def _handle_highest_waste(self, db: Session, query: str) -> Dict[str, Any]:
        rooms = db.query(Room).all()
        ranked = []
        for r in rooms:
            latest = db.query(Telemetry).filter_by(room_id=r.id).order_by(Telemetry.timestamp.desc()).first()
            if latest:
                exp = latest.expected_power_kw or r.typical_idle_kw
                diff = max(0.0, latest.power_kw - exp)
                ranked.append((r.id, latest.power_kw, exp, diff, r.name))

        ranked.sort(key=lambda x: x[3], reverse=True)
        top = ranked[0] if ranked else ("LAB-204", 3.82, 0.91, 2.91, "IoT Lab")

        data_context = {
            "top_waste_room": top[0],
            "actual_power_kw": top[1],
            "expected_power_kw": top[2],
            "excess_power_kw": round(top[3], 2),
            "room_name": top[4]
        }

        explanation = (
            f"The room currently wasting the highest energy is {top[0]} ({top[4]}). "
            f"It is drawing {top[1]:.2f} kW against an expected baseline of {top[2]:.2f} kW, "
            f"generating {top[3]:.2f} kW of excess consumption."
        )

        return {
            "query": query,
            "intent": "HIGHEST_ENERGY_WASTE",
            "target_room": top[0],
            "data_context": data_context,
            "explanation": explanation,
            "suggested_actions": [f"Inspect equipment in {top[0]}", "Acknowledge active alerts"],
            "source": "rules_and_data_engine"
        }

    async def _handle_critical_anomalies(self, db: Session, query: str) -> Dict[str, Any]:
        anomalies = db.query(Anomaly).filter_by(status="ACTIVE").order_by(Anomaly.deviation_pct.desc()).all()
        critical_rooms = [a.room_id for a in anomalies]
        data_context = {
            "active_anomalies_count": len(anomalies),
            "rooms_affected": critical_rooms,
            "highest_deviation_room": critical_rooms[0] if critical_rooms else None
        }

        if anomalies:
            explanation = (
                f"There are currently {len(anomalies)} active anomalies across campus. "
                f"The highest priority deviation is in {critical_rooms[0]} (+{anomalies[0].deviation_pct:.1f}% deviation, {anomalies[0].actual_power_kw} kW)."
            )
        else:
            explanation = "No active critical anomalies are currently detected across campus."

        return {
            "query": query,
            "intent": "ACTIVE_ANOMALIES_SUMMARY",
            "target_room": critical_rooms[0] if critical_rooms else None,
            "data_context": data_context,
            "explanation": explanation,
            "suggested_actions": ["Review open incident tickets", "Deploy maintenance technicians"],
            "source": "rules_and_data_engine"
        }

    async def _handle_savings_impact(self, db: Session, query: str) -> Dict[str, Any]:
        incidents = db.query(Incident).filter(Incident.status.in_(["NEW", "INVESTIGATING", "ACKNOWLEDGED"])).all()
        total_excess_kw = sum(inc.excess_power_kw for inc in incidents)
        daily_kwh = total_excess_kw * 8.0
        daily_cost = daily_kwh * settings.ENERGY_TARIFF_PER_KWH
        monthly_cost = daily_cost * 26.0

        data_context = {
            "total_excess_kw": round(total_excess_kw, 2),
            "projected_daily_savings_kwh": round(daily_kwh, 2),
            "projected_daily_savings_cost": round(daily_cost, 2),
            "projected_monthly_savings_cost": round(monthly_cost, 2),
            "emission_factor": settings.EMISSION_FACTOR_KG_CO2_PER_KWH
        }

        explanation = (
            f"By resolving current operational anomalies across campus, Sentinel estimates potential savings of "
            f"{daily_kwh:.1f} kWh/day, representing approximately ₹{daily_cost:,.0f} per day (₹{monthly_cost:,.0f}/month) "
            f"and preventing {daily_kwh * settings.EMISSION_FACTOR_KG_CO2_PER_KWH:.1f} kg of CO2 emissions daily."
        )

        return {
            "query": query,
            "intent": "POTENTIAL_SAVINGS_ESTIMATE",
            "target_room": None,
            "data_context": data_context,
            "explanation": explanation,
            "suggested_actions": ["Dispatch technicians for open work orders", "Audit HVAC shutdown routines"],
            "source": "rules_and_data_engine"
        }

    async def _handle_general_status(self, db: Session, query: str) -> Dict[str, Any]:
        total_rooms = db.query(Room).count()
        anomalies_count = db.query(Anomaly).filter_by(status="ACTIVE").count()
        return {
            "query": query,
            "intent": "GENERAL_SYSTEM_STATUS",
            "target_room": None,
            "data_context": {"monitored_rooms": total_rooms, "active_anomalies": anomalies_count},
            "explanation": f"Sentinel is currently monitoring {total_rooms} rooms across DEMO CAMPUS with {anomalies_count} active anomaly alert(s).",
            "suggested_actions": ["Access executive dashboard"],
            "source": "rules_and_data_engine"
        }

assistant_query_service = AssistantQueryService()
