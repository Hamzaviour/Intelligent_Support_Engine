"""Conversation Agent - Front-end persona managing the conversation."""
from typing import Dict, Any, AsyncGenerator, List
import structlog
from app.agents.base import BaseAgent
from app.services.llm import llm_service

logger = structlog.get_logger()


class ConversationAgent(BaseAgent):
    """Agent responsible for high-level conversation flow and response generation."""

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Generate conversation response."""
        messages: List[Dict[str, str]] = state.get("messages", [])
        intent = state.get("intent", "greeting")
        context = state.get("context", {})
        sentiment = state.get("sentiment", "neutral")

        # Build system prompt
        system_prompt = f"""You are a helpful, empathetic customer support assistant.
Question or Statement: "{messages[-1]['content'] if messages else ''}"

Instructions:
- Be concise and friendly (max 3 sentences)
- Acknowledge the customer's feelings
- Use the intent: {intent}
- Keep tone suitable for sentiment: {sentiment}
- If you need more information, ask one clear question"""

        # Prepare conversation history (last 10 messages)
        conversation_history = messages[-10:] if messages else []

        # Generate response
        user_prompt = conversation_history[-1]["content"] if conversation_history else "Say hello."

        final_messages = [{"role": "system", "content": system_prompt}] + conversation_history

        # Create response message
        response = {
            "role": "assistant",
            "content": "",
            "tool_calls": None,
        }

        return {
            "conversation_response": user_prompt,
            "assistant_response": final_messages,
        }