"""Ask Sentinel Natural Language Query Endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.intelligence import AssistantQueryRequest, AssistantQueryResponse
from app.assistant.query_service import assistant_query_service

router = APIRouter(prefix="/assistant", tags=["Assistant"])

@router.post("/query", response_model=AssistantQueryResponse)
async def query_assistant(payload: AssistantQueryRequest, db: Session = Depends(get_db)):
    """Ask Sentinel natural language query endpoint with deterministic facts and transparent answers."""
    result = await assistant_query_service.answer_query(db, payload.query)
    return result
