"""Equipment and Room Device Power Profiles for SENTINEL Virtual ESP32 Simulator."""

from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class EquipmentProfile:
    name: str
    rated_kw: float
    idle_factor: float = 0.05
    active_factor: float = 1.0

# Base device parameters
EQUIPMENT_PROFILES = {
    "hvac_split_1_5_ton": EquipmentProfile("Split AC 1.5 Ton", rated_kw=1.8, idle_factor=0.03, active_factor=1.0),
    "hvac_central_vav": EquipmentProfile("Central AHU VAV", rated_kw=4.5, idle_factor=0.15, active_factor=1.0),
    "workstation_pc": EquipmentProfile("Workstation PC", rated_kw=0.18, idle_factor=0.08, active_factor=0.85),
    "led_light_panel": EquipmentProfile("LED Ceiling Panel", rated_kw=0.04, idle_factor=0.0, active_factor=1.0),
    "laser_projector": EquipmentProfile("Laser Projector", rated_kw=0.35, idle_factor=0.01, active_factor=1.0),
    "network_switch": EquipmentProfile("Managed Switch & Gateway", rated_kw=0.25, idle_factor=0.90, active_factor=1.0),
    "lab_test_bench": EquipmentProfile("Lab Bench Power & Scope", rated_kw=1.5, idle_factor=0.05, active_factor=0.8),
}

ROOM_CONFIGS = {
    "LAB-204": {
        "building_code": "AB-A",
        "room_type": "laboratory",
        "capacity": 35,
        "base_idle_kw": 0.91,
        "base_active_kw": 4.85,
        "hvac_units": 2,
        "hvac_kw_each": 1.8, # Total HVAC = 3.6 kW
        "pc_count": 25,
        "lighting_kw": 0.5,
        "standby_kw": 0.35,
    },
    "LAB-205": {
        "building_code": "AB-A",
        "room_type": "laboratory",
        "capacity": 30,
        "base_idle_kw": 0.88,
        "base_active_kw": 4.20,
        "hvac_units": 1,
        "hvac_kw_each": 2.0,
        "pc_count": 10,
        "lighting_kw": 0.45,
        "standby_kw": 0.30,
    },
    "CLASS-301": {
        "building_code": "AB-B",
        "room_type": "classroom",
        "capacity": 60,
        "base_idle_kw": 0.32,
        "base_active_kw": 2.85,
        "hvac_units": 2,
        "hvac_kw_each": 1.5,
        "pc_count": 1,
        "lighting_kw": 0.40,
        "standby_kw": 0.15,
    },
    "CLASS-302": {
        "building_code": "AB-B",
        "room_type": "classroom",
        "capacity": 50,
        "base_idle_kw": 0.30,
        "base_active_kw": 2.60,
        "hvac_units": 1,
        "hvac_kw_each": 1.8,
        "pc_count": 1,
        "lighting_kw": 0.35,
        "standby_kw": 0.15,
    },
    "LIBRARY-01": {
        "building_code": "CL",
        "room_type": "library",
        "capacity": 120,
        "base_idle_kw": 1.95,
        "base_active_kw": 7.40,
        "hvac_units": 1,
        "hvac_kw_each": 4.2,
        "pc_count": 40,
        "lighting_kw": 1.4,
        "standby_kw": 0.80,
    },
    "HOSTEL-A-105": {
        "building_code": "HST-A",
        "room_type": "hostel_dorm",
        "capacity": 2,
        "base_idle_kw": 0.12,
        "base_active_kw": 1.45,
        "hvac_units": 1,
        "hvac_kw_each": 1.1,
        "pc_count": 2,
        "lighting_kw": 0.20,
        "standby_kw": 0.05,
    },
    "HOSTEL-B-203": {
        "building_code": "HST-B",
        "room_type": "hostel_dorm",
        "capacity": 2,
        "base_idle_kw": 0.12,
        "base_active_kw": 1.50,
        "hvac_units": 1,
        "hvac_kw_each": 1.1,
        "pc_count": 2,
        "lighting_kw": 0.20,
        "standby_kw": 0.05,
    },
}
