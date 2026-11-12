"""Transparent Explanation Generator for SENTINEL AI Intelligence Engine."""

def generate_transparent_explanation(
    room_id: str,
    room_name: str,
    anomaly_type: str,
    actual_kw: float,
    expected_kw: float,
    deviation_pct: float,
    occupancy: int,
    scheduled: bool,
    probable_cause: str,
    severity: str
) -> str:
    """Generates clear, fact-backed, transparent operational explanations without hallucination."""
    sched_desc = "during a scheduled timetable session" if scheduled else "while no class is scheduled"
    occ_desc = f"with {occupancy} persons detected" if occupancy > 0 else "with zero occupancy detected"

    if anomaly_type == "IDLE_RUNNING":
        return (
            f"{room_name} ({room_id}) is drawing {actual_kw:.2f} kW, which is {deviation_pct:+.1f}% "
            f"above the expected idle baseline ({expected_kw:.2f} kW). The space is currently unoccupied ({occ_desc}) "
            f"and {sched_desc}. Supporting operational telemetry strongly indicates {probable_cause}."
        )
    elif anomaly_type == "OUT_OF_SCHEDULE":
        return (
            f"Power consumption in {room_id} ({actual_kw:.2f} kW) deviates +{deviation_pct:.1f}% from expected baseline "
            f"outside scheduled operational hours. Telemetry indicates {probable_cause}."
        )
    elif anomaly_type == "UNEXPECTED_SPIKE":
        return (
            f"A sharp power surge of {actual_kw:.2f} kW was captured in {room_id} (baseline: {expected_kw:.2f} kW, "
            f"+{deviation_pct:.1f}% surge). Indicative of {probable_cause}."
        )
    elif anomaly_type == "CONSUMPTION_DRIFT":
        return (
            f"Equipment in {room_id} has drifted +{deviation_pct:.1f}% above expected nominal operating curves "
            f"({actual_kw:.2f} kW vs {expected_kw:.2f} kW). Probable cause: {probable_cause}."
        )
    else:
        return (
            f"Anomalous electrical telemetry detected in {room_id}: {actual_kw:.2f} kW recorded vs {expected_kw:.2f} kW expected. "
            f"Operational context: {occ_desc}, {sched_desc}."
        )
