"""High-level cache service wrapper around Redis."""
import structlog
from typing import Optional, Any
import hashlib

from app.config import settings
from app.services.redis_client import redis_service

logger = structlog.get_logger()


def generate_cache_key(name: str, *args) -> str:
    """Generate a cache key from name and arguments."""
    key_parts = [name] + list(str(arg) for arg in args)
    key_str = ":".join(key_parts)
    return f"cache:{key_str}:v1"


class CacheService:
    """Service for high-level caching operations."""

    @staticmethod
    async def get(name: str, key: str) -> Optional[Any]:
        """Get cached value."""
        full_key = generate_cache_key(name, key)
        cached = await redis_service.get(full_key)
        if cached:
            try:
                return cached  # Already JSON string from pydantic
            except:
                return cached
        return None

    @staticmethod
    async def set(
        name: str,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
    ):
        """Set cached value."""
        full_key = generate_cache_key(name, key)
        serialized = value
        await redis_service.set(full_key, serialized, ttl)

    @staticmethod
    async def delete(name: str, key: str):
        """Delete cached value."""
        full_key = generate_cache_key(name, key)
        await redis_service.delete(full_key)

    @staticmethod
    async def invalidate_prefix(prefix: str):
        """Invalidate all cache keys with given prefix."""
        # In a full implementation, this would use SCAN to find matching keys
        # For MVP, we'll just log a warning
        logger.warning("cache.invalidate_prefix", prefix=prefix)


cache_service = CacheService()  # Alias for compatibility