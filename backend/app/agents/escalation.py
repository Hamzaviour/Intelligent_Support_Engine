"""Escalation Agent."""
from typing import Dict, Any
import structlog
from app.agents.base import BaseAgent

logger = structlog.get_logger()


class EscalationAgent(BaseAgent):
    """Agent for determining when to escalate to human."""

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Check if escalation is needed."""
        sentiment = state.get("sentiment", "neutral")
        intent = state.get("intent", "")
        ticket = state.get("ticket", {})
        confidence = state.get("intent_confidence", 0.0)

        should_escalate = False
        escalation_reason = ""

        # Escalation triggers
        if sentiment in ["frustrated", "angry"]:
            should_escalate = True
            escalation_reason = f"High sentiment: {sentiment}"

        if intent == "complaint" and confidence < 0.6:
            should_escalate = True
            escalation_reason = f"Low confidence on complaint: {confidence:.2f}"

        if ticket.get("priority") == "urgent" and not state.get("ticket_created"):
            should_escalate = True
            escalation_reason = "Urgent priority ticket"

        # Generate escalation summary
        messages = state.get("messages", [])
        conversation_summary = "\n".join(
            f"{m['role']}: {m['content'][:100]}" for m in messages[-3:]
        )

        if should_escalate:
            logger.info(
                "escalation.triggered",
                reason=escalation_reason,
                conversation_summary=conversation_summary,
            )

        return {
            "should_escalate": should_escalate,
            "escalation_reason": escalation_reason,
            "escalation_summary": conversation_summary,
        }