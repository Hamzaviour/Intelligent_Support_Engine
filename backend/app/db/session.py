"""Database session and engine setup — NeonDB/asyncpg with SSL."""
import ssl
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator

from app.config import settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


# NeonDB (and any TLS-required PG) needs ssl=True passed via connect_args.
# We also strip any stray ?sslmode=... from the URL because asyncpg
# handles SSL through connect_args, not query params.
def _build_engine():
    url = settings.database_url

    # Build connect_args: enable SSL when pointing at a remote/cloud host
    is_remote = not any(h in url for h in ("localhost", "127.0.0.1", "::1"))
    connect_args = {}
    if is_remote:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False          # NeonDB SNI works without it
        ssl_ctx.verify_mode = ssl.CERT_NONE     # skip cert verify for simplicity
        connect_args["ssl"] = ssl_ctx

    return create_async_engine(
        url,
        echo=False,                 # disable verbose SQL logging in production
        pool_pre_ping=True,         # detect stale connections
        pool_size=5,                # NeonDB free tier has limited connections
        max_overflow=10,
        pool_timeout=30,
        pool_recycle=1800,          # recycle connections every 30 min
        connect_args=connect_args,
    )


engine = _build_engine()

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for FastAPI endpoints."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
