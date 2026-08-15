"""Analytics API endpoints."""
from fastapi import APIRouter
from pydantic import BaseModel
import structlog

router = APIRouter()
logger = structlog.get_logger()


class TimeRange(BaseModel):
    start: str
    end: str


@router.get("/metrics")
async def get_metrics(
    time_range: TimeRange,
):
    """Get support analytics metrics."""
    return {
        "total_conversations": 100,
        "resolved_count": 85,
        "escalated_count": 15,
        "average_resolution_time": 150,
        "csat_score": 4.2,
        "refunds_count": 10,
    }
