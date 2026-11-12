"""Virtual ESP32 Telemetry Generator for SENTINEL."""

import asyncio
import random
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import numpy as np

from app.core.config import settings
from app.core.logging import logger
from app.simulator.device_profiles import ROOM_CONFIGS
from app.simulator.scenarios import SCENARIOS

class SimulatorGenerator:
    def __init__(self):
        self.is_running: bool = False
        self.is_paused: bool = False
        self.interval_seconds: float = settings.SIMULATOR_INTERVAL_SECONDS
        self.current_scenario_id: str = "normal_operation"
        self.active_injections: Dict[str, Dict[str, Any]] = {}
        self._task: Optional[asyncio.Task] = None
        self._iteration_count: int = 0
        self.ingestion_callback = None # Set by main / service

    def set_ingestion_callback(self, callback):
        self.ingestion_callback = callback

    def start(self):
        if self.is_running:
            logger.info("Simulator already running.")
            return
        self.is_running = True
        self.is_paused = False
        logger.info(f"Starting Virtual ESP32 Simulator with interval {self.interval_seconds}s...")
        self._task = asyncio.create_task(self._simulation_loop())

    def stop(self):
        if not self.is_running:
            return
        self.is_running = False
        self.is_paused = False
        if self._task and not self._task.done():
            self._task.cancel()
        logger.info("Virtual ESP32 Simulator stopped.")

    def pause(self):
        self.is_paused = True
        logger.info("Simulator paused.")

    def resume(self):
        self.is_paused = False
        logger.info("Simulator resumed.")

    def set_scenario(self, scenario_id: str) -> bool:
        if scenario_id not in SCENARIOS:
            logger.warning(f"Unknown scenario ID: {scenario_id}")
            return False
        self.current_scenario_id = scenario_id
        # Reset one-off injections when switching scenarios
        self.active_injections.clear()
        logger.info(f"Switched simulation scenario to: {scenario_id} ({SCENARIOS[scenario_id]['name']})")
        return True

    def inject_anomaly(self, room_id: str, power_kw: float, anomaly_type: str = "IDLE_RUNNING", root_cause: str = "Manual Anomaly Injection"):
        self.active_injections[room_id] = {
            "power_kw": power_kw,
            "anomaly_active": True,
            "anomaly_type": anomaly_type,
            "root_cause": root_cause,
            "occupancy": 0,
            "scheduled": False
        }
        logger.info(f"Injected anomaly into {room_id}: {power_kw} kW ({anomaly_type})")

    def resolve_room_anomaly(self, room_id: str):
        """Simulates technician fixing the issue and power returning to baseline."""
        if room_id in self.active_injections:
            del self.active_injections[room_id]
        
        # If scenario specifically overrides this room, we also clear the override
        if self.current_scenario_id in SCENARIOS:
            overrides = SCENARIOS[self.current_scenario_id].get("overrides", {})
            if room_id in overrides:
                # Switch back to normal operation
                self.current_scenario_id = "normal_operation"
        logger.info(f"Resolved anomaly in {room_id}. Power restored to baseline.")

    def reset(self):
        self.current_scenario_id = "normal_operation"
        self.active_injections.clear()
        self._iteration_count = 0
        logger.info("Simulator reset to default normal campus state.")

    def generate_room_reading(self, room_id: str, cfg: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        hour = now.hour
        weekday = now.weekday()

        # Check default schedule status
        is_scheduled = False
        if room_id in ("LAB-204", "LAB-205"):
            if weekday < 5 and 9 <= hour < 17:
                is_scheduled = True
        elif room_id in ("CLASS-301", "CLASS-302"):
            if weekday < 5 and 9 <= hour < 16:
                is_scheduled = True
        elif room_id == "LIBRARY-01":
            if 8 <= hour < 22:
                is_scheduled = True
        elif room_id.startswith("HOSTEL"):
            if hour >= 18 or hour < 8:
                is_scheduled = True

        # Default normal power calculation
        if is_scheduled:
            occ = random.randint(int(cfg["capacity"] * 0.6), cfg["capacity"])
            power = cfg["base_active_kw"] + np.random.normal(0, 0.05)
            temp = 24.2 + np.random.normal(0, 0.3)
        else:
            occ = 0
            power = cfg["base_idle_kw"] + np.random.normal(0, 0.02)
            temp = 26.8 + np.random.normal(0, 0.3)

        humidity = 55.0 + np.random.normal(0, 2.0)

        # Check scenario overrides
        scenario = SCENARIOS.get(self.current_scenario_id, {})
        overrides = scenario.get("overrides", {}).get(room_id, {})

        # Check direct ad-hoc injections (highest precedence)
        if room_id in self.active_injections:
            overrides = self.active_injections[room_id]

        if "power_kw" in overrides:
            power = overrides["power_kw"] + np.random.normal(0, 0.02)
        if "occupancy" in overrides:
            occ = overrides["occupancy"]
        if "scheduled" in overrides:
            is_scheduled = overrides["scheduled"]
        if "temperature_c" in overrides:
            temp = overrides["temperature_c"]
        if "humidity" in overrides:
            humidity = overrides["humidity"]

        return {
            "room_id": room_id,
            "timestamp": now.isoformat(),
            "power_kw": max(0.01, round(float(power), 3)),
            "temperature_c": round(float(temp), 1),
            "humidity": round(float(humidity), 1),
            "occupancy": int(occ),
            "scheduled": bool(is_scheduled),
            "source": "simulated"
        }

    async def _simulation_loop(self):
        while self.is_running:
            try:
                if not self.is_paused:
                    self._iteration_count += 1
                    readings = []
                    for room_id, cfg in ROOM_CONFIGS.items():
                        reading = self.generate_room_reading(room_id, cfg)
                        readings.append(reading)

                    if self.ingestion_callback:
                        await self.ingestion_callback(readings)

                await asyncio.sleep(self.interval_seconds)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in simulator loop: {e}", exc_info=True)
                await asyncio.sleep(self.interval_seconds)

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "is_paused": self.is_paused,
            "interval_seconds": self.interval_seconds,
            "current_scenario": self.current_scenario_id,
            "scenario_details": SCENARIOS.get(self.current_scenario_id, {}),
            "active_injections": list(self.active_injections.keys()),
            "iterations_completed": self._iteration_count
        }

simulator_instance = SimulatorGenerator()
