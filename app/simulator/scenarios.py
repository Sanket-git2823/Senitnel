"""Demo Scenarios and Injected Anomaly Rules for SENTINEL."""

from typing import Dict, Any

SCENARIOS = {
    "normal_operation": {
        "id": "normal_operation",
        "name": "Normal Campus Operation",
        "description": "Standard schedule compliance across all campus rooms with normal idle baselines.",
        "overrides": {}
    },
    "lab_204_ac_waste": {
        "id": "lab_204_ac_waste",
        "name": "AC Left Running in Empty Lab (LAB-204)",
        "description": "Class in LAB-204 ended, occupancy dropped to 0, scheduled is False, but dual AC units remain on drawing 3.82 kW (expected 0.91 kW).",
        "overrides": {
            "LAB-204": {
                "power_kw": 3.82,
                "occupancy": 0,
                "scheduled": False,
                "temperature_c": 27.4,
                "humidity": 58.0,
                "anomaly_active": True,
                "anomaly_type": "IDLE_RUNNING",
                "root_cause": "HVAC cluster left running after scheduled session"
            }
        }
    },
    "lights_left_on": {
        "id": "lights_left_on",
        "name": "Lights & Projector Left On (CLASS-301)",
        "description": "Smart classroom empty with lighting grid and podium projector active.",
        "overrides": {
            "CLASS-301": {
                "power_kw": 0.95,
                "occupancy": 0,
                "scheduled": False,
                "temperature_c": 26.2,
                "humidity": 54.0,
                "anomaly_active": True,
                "anomaly_type": "OUT_OF_SCHEDULE",
                "root_cause": "Lighting grid & AV projector left on after lecture"
            }
        }
    },
    "unexpected_equipment_spike": {
        "id": "unexpected_equipment_spike",
        "name": "Sudden Lab Equipment Spike (LAB-205)",
        "description": "Sudden power spike in electronics test bench during off-hours.",
        "overrides": {
            "LAB-205": {
                "power_kw": 3.90,
                "occupancy": 0,
                "scheduled": False,
                "temperature_c": 28.1,
                "humidity": 59.0,
                "anomaly_active": True,
                "anomaly_type": "UNEXPECTED_SPIKE",
                "root_cause": "Unattended high-load equipment test bench running"
            }
        }
    },
    "consumption_drift": {
        "id": "consumption_drift",
        "name": "Gradual Equipment Drift (LIBRARY-01)",
        "description": "Library AHU compressor efficiency degradation drifting 35% above expected baseline.",
        "overrides": {
            "LIBRARY-01": {
                "power_kw": 9.95, # Expected ~7.4
                "occupancy": 65,
                "scheduled": True,
                "temperature_c": 25.0,
                "humidity": 52.0,
                "anomaly_active": True,
                "anomaly_type": "CONSUMPTION_DRIFT",
                "root_cause": "VAV air handling unit compressor drift / clogged filters"
            }
        }
    },
    "evening_shutdown": {
        "id": "evening_shutdown",
        "name": "Evening Campus Shutdown",
        "description": "All academic buildings shut down to idle standby loads. Hostels active.",
        "overrides": {
            "LAB-204": {"occupancy": 0, "scheduled": False, "power_kw": 0.90},
            "LAB-205": {"occupancy": 0, "scheduled": False, "power_kw": 0.88},
            "CLASS-301": {"occupancy": 0, "scheduled": False, "power_kw": 0.30},
            "CLASS-302": {"occupancy": 0, "scheduled": False, "power_kw": 0.28},
            "LIBRARY-01": {"occupancy": 10, "scheduled": False, "power_kw": 2.10},
        }
    }
}
