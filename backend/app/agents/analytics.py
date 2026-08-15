"""Analytics Agent."""
from typing import Dict, Any
from datetime import datetime, timedelta

import structlog
from app.agents.base import BaseAgent

logger = structlog.get_logger()


class AnalyticsAgent(BaseAgent):
    """Agent for tracking and recording analytics metrics."""

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Record conversation analytics."""
        messages = state.get("messages", [])
        intent = state.get("intent", "")
        refund = state.get("refund", {})
        escalation = state.get("should_escalate", False)
        ticket = state.get("ticket", {})

        # Calculate metrics
        total_messages = len(messages)
        avg_message_length = sum(len(m.get("content", "")) for m in messages) / max(total_messages, 1)
        has_refund = refund.get("status") == "approved"
        has_ticket = ticket.get("ticket_number") is not None

        # Determine conversation outcome
        outcome = "resolved"
        if escalation:
            outcome = "escalated"
        elif intent == "greeting":
            outcome = "smalltalk"
        elif intent in ["complaint", "billing"]:
            outcome = "requires_assistance"

        analytics_data = {
            "conversation_start": messages[0].get("created_at", datetime.utcnow()) if messages else datetime.utcnow(),
            "conversation_end": datetime.utcnow(),
            "total_messages": total_messages,
            "avg_message_length": round(avg_message_length, 2),
            "intent_detected": intent,
            "has_refund": has_refund,
            "ticket_created": has_ticket,
            "escalated": escalation,
            "outcome": outcome,
        }

        logger.info("analytics.tracked", **analytics_data)

        return {
            "analytics": analytics_data,
        }