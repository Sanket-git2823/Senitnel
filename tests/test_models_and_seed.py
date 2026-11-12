from app.database.connection import SessionLocal
from app.database.models import Campus, Building, Room, Equipment, Timetable, Telemetry

def test_database_seed_integrity():
    db = SessionLocal()
    try:
        campus = db.query(Campus).filter_by(name="DEMO CAMPUS").first()
        assert campus is not None
        assert campus.name == "DEMO CAMPUS"

        buildings = db.query(Building).all()
        assert len(buildings) == 8
        codes = [b.code for b in buildings]
        assert "AB-A" in codes
        assert "AB-B" in codes
        assert "CL" in codes
        assert "HST-A" in codes

        rooms = db.query(Room).all()
        assert len(rooms) >= 7
        room_ids = [r.id for r in rooms]
        assert "LAB-204" in room_ids
        assert "LAB-205" in room_ids
        assert "CLASS-301" in room_ids
        assert "CLASS-302" in room_ids
        assert "LIBRARY-01" in room_ids
        assert "HOSTEL-A-105" in room_ids

        # Equipment check for LAB-204
        eq = db.query(Equipment).filter_by(room_id="LAB-204").all()
        assert len(eq) >= 4
        eq_names = [e.name for e in eq]
        assert any("AC" in name for name in eq_names)
        assert any("Workstation" in name for name in eq_names)

        # Timetable check
        tt = db.query(Timetable).filter_by(room_id="LAB-204").all()
        assert len(tt) > 0

        # Telemetry check
        telem_count = db.query(Telemetry).count()
        assert telem_count >= 500
    finally:
        db.close()
