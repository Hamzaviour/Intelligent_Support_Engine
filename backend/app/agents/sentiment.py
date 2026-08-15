"""Sentiment Analysis Agent."""
from typing import Dict, Any, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base import BaseAgent
from app.services.llm import llm_service


class SentimentAgent(BaseAgent):
    """Agent for analyzing customer sentiment."""

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze sentiment of latest message."""
        messages = state.get("messages", [])
        latest_message = messages[-1] if messages else {}
        user_id = state.get("user_id")

        user_input = latest_message.get("content", "")
        sentiment_label = "neutral"

        if user_input:
            # Get sentiment score using fast model
            prompt = f"""Analyze the sentiment of this customer message.

Options (choose ONE):
- happy
- neutral
- frustrated
- angry

Message: "{user_input}"

Response format: {{"label": "name"}}"""

            messages = [{"role": "user", "content": prompt}]
            response_text = await llm_service.fast_generate(messages)

            # Extract label
            if "angry" in response_text.lower():
                sentiment_label = "angry"
            elif "frustrated" in response_text.lower():
                sentiment_label = "frustrated"
            elif "happy" in response_text.lower():
                sentiment_label = "happy"

        # Determine escalation threshold
        should_escalate = sentiment_label in ["frustrated", "angry"]
        confidence = 0.8

        await self.log("info", "sentiment_analyzed", label=sentiment_label, escalate=should_escalate)

        return {
            "sentiment": sentiment_label,
            "sentiment_score": 0.0,  # TODO: Add numeric score
            "should_escalate": should_escalate,
            "sentiment_confidence": confidence,
        }