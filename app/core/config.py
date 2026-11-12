import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "SENTINEL Operational Intelligence")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sentinel.db")
    
    # Campus economics
    DEFAULT_CAMPUS_NAME: str = os.getenv("DEFAULT_CAMPUS_NAME", "DEMO CAMPUS")
    ENERGY_TARIFF_PER_KWH: float = float(os.getenv("ENERGY_TARIFF_PER_KWH", "12.0"))
    EMISSION_FACTOR_KG_CO2_PER_KWH: float = float(os.getenv("EMISSION_FACTOR_KG_CO2_PER_KWH", "0.82"))
    
    # Simulator
    SIMULATOR_INTERVAL_SECONDS: float = float(os.getenv("SIMULATOR_INTERVAL_SECONDS", "5.0"))
    SIMULATOR_AUTO_START: bool = os.getenv("SIMULATOR_AUTO_START", "false").lower() in ("true", "1")
    
    # Assistant / Optional LLM
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "kimi-latest")

settings = Settings()
