"""Refund API endpoints."""
from fastapi import APIRouter
from pydantic import BaseModel
import structlog

router = APIRouter()
logger = structlog.get_logger()


class RefundProcess(BaseModel):
    order_id: str
    amount: float
    reason: str


@router.post("/process")
async def process_refund(
    refund: RefundProcess,
):
    """Process a refund request."""
    return {
        "refund_id": "456",
        "status": "approved",
        "amount": refund.amount,
        "message": "Refund processed successfully",
    }
