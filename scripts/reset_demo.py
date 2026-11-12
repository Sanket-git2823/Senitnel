"""Reset Sentinel Demo Environment to pristine initial state."""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.connection import SessionLocal
from app.database.seed import seed_database
from app.simulator.generator import simulator_instance

def reset_demo():
    print("Resetting SENTINEL demo environment...")
    simulator_instance.reset()
    db = SessionLocal()
    try:
        seed_database(db, force=True)
        print("[OK] Database and telemetry re-seeded to initial normal campus baseline.")
    finally:
        db.close()
    print("[OK] Reset complete. Ready for new demonstration.")

if __name__ == "__main__":
    reset_demo()
