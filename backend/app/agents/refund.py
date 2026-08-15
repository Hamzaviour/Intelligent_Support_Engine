"""Refund Processing Agent (Mocked for MVP)."""
from typing import Dict, Any
from datetime import datetime
import structlog

from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base import BaseAgent

logger = structlog.get_logger()


class RefundAgent(BaseAgent):
    """Agent for processing refund requests."""

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Process refund request based on policy."""
        intent = state.get("intent", "")
        should_create_ticket = state.get("should_create_ticket", False)
        user_id = state.get("user_id")
        messages = state.get("messages", [])

        if intent != "refund" and not should_create_ticket:
            return {
                "refund": None,
                "refund_status": "not_applicable",
            }

        # Mock refund decision (always approve for MVP)
        refund_status = "approved"
        refund_amount = 150.00

        refund_data = {
            "id": str(user_id),  # Mock ID
            "order_id": f"order-{user_id}",
            "amount": refund_amount,
            "status": refund_status,
            "reason": "Product issue (MVP mock)",
            "approved_at": datetime.utcnow(),
        }

        logger.info("refund.processed", status=refund_status, amount=refund_amount)

        return {
            "refund": refund_data,
            "refund_status": refund_status,
            "status": refund_status,
        }