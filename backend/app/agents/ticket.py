"""Ticket Management Agent."""
from typing import Dict, Any
import uuid
from datetime import datetime, timedelta

import structlog
from app.agents.base import BaseAgent

logger = structlog.get_logger()


class TicketAgent(BaseAgent):
    """Agent for creating and managing tickets."""

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Create ticket based on conversation context."""
        user_id = state.get("user_id")
        intent = state.get("intent", "")
        messages = state.get("messages", [])
        sentiment = state.get("sentiment", "neutral")

        # Determine ticket priority based on sentiment and intent
        priority = "medium"
        if intent == "complaint" and sentiment in ["frustrated", "angry"]:
            priority = "high"
        elif intent == "refund" and sentiment in ["frustrated", "angry"]:
            priority = "urgent"

        # Determine category
        category = {
            "refund": "billing",
            "complaint": "complaints",
            "technical": "technical",
            "billing": "billing",
            "password_reset": "technical",
        }.get(intent, "general")

        # Generate ticket number
        ticket_number = f"TIX-{uuid.uuid4().hex[:4].upper()}"

        # Create ticket data (would go to DB in real system)
        ticket_data = {
            "ticket_number": ticket_number,
            "user_id": user_id,
            "priority": priority,
            "category": category,
            "status": "open",
            "created_at": datetime.utcnow(),
        }

        logger.info("ticket.created", ticket_number=ticket_number, priority=priority, category=category)

        return {
            "ticket": ticket_data,
            "should_create_ticket": True,
        }