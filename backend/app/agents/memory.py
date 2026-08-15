"""Memory Retrieval Agent."""
from typing import Dict, Any, List
import structlog

from app.agents.base import BaseAgent

logger = structlog.get_logger()


class MemoryAgent(BaseAgent):
    """Agent for retrieving customer context and past information."""

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Load customer context from database and memory."""
        user_id = state.get("user_id")
        current_intent = state.get("intent", "")
        messages = state.get("messages", [])
        context: Dict[str, Any] = {}

        if not user_id:
            return {"context": context}

        # Retrieve recent tickets
        from app.db.models import Ticket
        from app.db.models.order import Order

        # TODO: Implement full ticket retrieval from DB
        # context["tickets"] = []

        # Summarize recent messages
        recent_messages = messages[-5:] if messages else []
        context["message_history"] = [
            {"role": m["role"], "content": m["content"][:100] + "..." if len(m["content"]) > 100 else m["content"]}
            for m in recent_messages
        ]

        # Store in state for other agents
        return {
            "context": context,
            "recent_messages": recent_messages,
        }