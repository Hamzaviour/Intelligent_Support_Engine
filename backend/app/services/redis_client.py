"""Redis client service."""
import redis.asyncio as redis
import structlog
from typing import Optional, Any

from app.config import settings

logger = structlog.get_logger()


class RedisService:
    """Service for Redis operations."""

    def __init__(self):
        self.redis: Optional[redis.Redis] = None

    async def connect(self):
        """Connect to Redis."""
        try:
            self.redis = redis.Redis(
                host=settings.redis_host,
                port=settings.redis_port,
                db=settings.redis_db,
                decode_responses=True,
            )
            await self.redis.ping()
            logger.info("redis.connected", host=settings.redis_host, port=settings.redis_port)
        except Exception as e:
            logger.error("redis.connect_failed", error=str(e))
            raise

    async def disconnect(self):
        """Disconnect from Redis."""
        if self.redis:
            await self.redis.close()
            logger.info("redis.disconnected")

    async def get(self, key: str) -> Optional[str]:
        """Get value from Redis."""
        if not self.redis:
            return None
        return await self.redis.get(key)

    async def set(self, key: str, value: str, ttl: Optional[int] = None):
        """Set value in Redis."""
        if not self.redis:
            return
        if ttl:
            await self.redis.setex(key, ttl, value)
        else:
            await self.redis.set(key, value)

    async def delete(self, *keys: str):
        """Delete keys from Redis."""
        if self.redis:
            await self.redis.delete(*keys)

    def exists(self, key: str) -> bool:
        """Check if key exists."""
        return self.redis and self.redis.exists(key) > 0


# Global service instance
redis_service = RedisService()