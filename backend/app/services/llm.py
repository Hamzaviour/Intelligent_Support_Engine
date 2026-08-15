"""LLM service using LiteLLM with Groq."""
import inspect
import json
import litellm
import structlog
from typing import AsyncGenerator, Dict, Any, List

from app.config import settings

logger = structlog.get_logger()


class LLMService:
    """Service for managing LLM interactions via LiteLLM."""

    def __init__(self):
        litellm.api_key = settings.groq_api_key
        self.primary_model = settings.groq_model_primary
        self.fast_model = settings.groq_model_fast

    async def stream_generate(
        self,
        messages: List[Dict[str, str]],
        model: str = None,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        """Stream completion tokens from LLM as an async generator."""
        if model is None:
            model = self.primary_model

        try:
            res = litellm.acompletion(
                model=model,
                messages=messages,
                stream=True,
                temperature=temperature,
            )
            if inspect.isawaitable(res):
                res = await res

            async for chunk in res:
                if hasattr(chunk, "choices") and chunk.choices:
                    delta = chunk.choices[0].delta.content or ""
                    if delta:
                        yield delta

        except Exception as e:
            logger.error("llm.stream_error", model=model, error=str(e))
            raise

    async def generate(
        self,
        messages: List[Dict[str, str]],
        model: str = None,
        stream: bool = False,
        temperature: float = 0.7,
    ) -> Any:
        """
        Generate completion from LLM.
        Returns dict {"content": str, "model": str, "tokens_used": int, "finish_reason": str}
        """
        if model is None:
            model = self.primary_model

        try:
            res = litellm.acompletion(
                model=model,
                messages=messages,
                stream=False,
                temperature=temperature,
            )
            if inspect.isawaitable(res):
                response = await res
            else:
                response = res

            content = response.choices[0].message.content or ""
            tokens = getattr(response.usage, "total_tokens", 0) if hasattr(response, "usage") and response.usage else 0
            finish_reason = response.choices[0].finish_reason if response.choices else "stop"

            return {
                "content": content,
                "model": model,
                "tokens_used": tokens,
                "finish_reason": finish_reason,
            }

        except Exception as e:
            logger.error("llm.error", model=model, error=str(e))
            raise

    async def fast_generate(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.1,
    ) -> str:
        """Generate fast response (used for classification, sentiment)."""
        res = await self.generate(
            messages=messages,
            model=self.fast_model,
            temperature=temperature,
        )
        return res.get("content", "")

    async def classify_intent(self, user_input: str) -> tuple[str, float]:
        """
        Classify user intent with confidence score.

        Intents: refund, complaint, technical, billing, password_reset, subscription, shipping, account_deletion
        """
        prompt = f"""Classify the following customer message into one of these intents:

- refund: Customer wants a refund
- complaint: Customer is complaining about a problem
- technical: Customer has a technical issue
- billing: Customer has billing questions
- password_reset: Customer wants to reset password
- subscription: Customer has subscription questions
- shipping: Customer has shipping questions
- account_deletion: Customer wants to delete account

Customer message: "{user_input}"

Response format: {{"intent": "name", "confidence": 0.0-1.0}}"""

        messages = [{"role": "user", "content": prompt}]
        response_text = await self.fast_generate(messages)

        try:
            result = json.loads(response_text)
            return result["intent"], float(result.get("confidence", 0.9))
        except (json.JSONDecodeError, KeyError, ValueError):
            logger.warning("intent.classify_failed", response=response_text)
            return "technical", 0.5


# Global service instance
llm_service = LLMService()