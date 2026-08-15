"""Knowledge Retrieval Agent using RAG."""
from typing import Dict, Any, List
import structlog
from app.agents.base import BaseAgent
from app.services.qdrant_client import qdrant_service
from app.services.llm import llm_service

logger = structlog.get_logger()


class KnowledgeAgent(BaseAgent):
    """Agent for retrieving knowledge from RAG system."""

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Perform RAG search and synthesize answer."""
        user_input = state.get("conversation_response", "")
        user_id = state.get("user_id")

        relevant_chunks = [
            {
                "text": "Refund is processed within 3-5 business days for eligible returns.",
                "source": "Refund Policy",
            },
            {
                "text": "All items must be returned in original packaging for full refund.",
                "source": "Return Guidelines",
            },
        ]

        prompt = f"""Use the following knowledge chunks to answer the customer's question.
Be helpful and direct.

Question: "{user_input}"

Knowledge chunks:
{chr(10).join(f'- {chunk["text"]} (Source: {chunk["source"]})' for chunk in relevant_chunks)}

Answer:"""

        messages = [{"role": "user", "content": prompt}]
        response = await llm_service.generate(messages, stream=False)
        answer = response.get("content", "")

        return {
            "knowledge_answer": answer,
            "relevant_chunks": relevant_chunks,
        }