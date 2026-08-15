"""Base agent class with common functionality."""
from typing import Dict, Any, Optional
from abc import ABC, abstractmethod
import structlog

from app.services.llm import llm_service
from app.services.redis_client import redis_service

logger = structlog.get_logger()


class BaseAgent(ABC):
    """Abstract base class for all agents."""

    def __init__(self, name: str):
        """
        Initialize agent.

        Args:
            name: Agent name for logging
        """
        self.name = name
        self.logger = structlog.get_logger(f"agent.{name}")

    @abstractmethod
    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute agent logic.

        Args:
            state: Shared state dict from LangGraph

        Returns:
            Updated state
        """
        pass

    async def log(self, level: str, message: str, **kwargs):
        """Log agent activity."""
        log_fn = getattr(self.logger, level.lower(), self.logger.info)
        log_fn(
            f"{self.name}.{message}",
            agent=self.name,
            **kwargs,
        )

    async def rate_limited_call(self, limit_key: str, max_calls: int = 5, timeout: int = 60):
        """Rate limiting helper."""
        if not redis_service.redis:
            return

        current = await redis_service.get(limit_key)
        if current and int(current) >= max_calls:
            await redis_service.expire(limit_key, timeout)
            return False
        await redis_service.incr(limit_key)
        if int(current) == 0:
            await redis_service.expire(limit_key, timeout)
        return True