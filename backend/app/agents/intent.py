"""Intent Detection Agent."""
from typing import Dict, Any

from app.agents.base import BaseAgent
from app.services.llm import llm_service


class IntentAgent(BaseAgent):
    """Agent for detecting customer intent from messages."""

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Parse user message and detect intent."""
        messages = state.get("messages", [])
        latest_message = messages[-1] if messages else {}

        user_input = latest_message.get("content", "")
        userId = state.get("user_id")

        # Inputs: User ID for personalized few-shot examples
        # Outputs: intent, confidence

        # Perform intent classification
        intent, confidence = await llm_service.classify_intent(user_input)

        # Log results
        await self.log("info", "intent_detected", intent=intent, confidence=confidence)

        return {
            "intent": intent,
            "intent_confidence": confidence,
        }