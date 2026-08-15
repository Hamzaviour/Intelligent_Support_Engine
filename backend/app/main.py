from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import structlog

from app.config import settings
from app.api import chat, tickets, crm, refunds, auth, analytics
from app.db.session import engine, Base
from app.services.llm import llm_service
from app.services.qdrant_client import qdrant_service
from app.services.cache import redis_service

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("app.startup", name=settings.app_name, env=settings.app_env)

    # Initialize services (with graceful fallback if services are unavailable)
    try:
        await qdrant_service.connect()
        await qdrant_service.ensure_collections()
    except Exception as e:
        logger.warning("qdrant.connect_failed", error=str(e), detail="Running without vector search")
    try:
        await redis_service.connect()
    except Exception as e:
        logger.warning("redis.connect_failed", error=str(e), detail="Running without caching")

    # Create database tables (in production, use Alembic)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("db.tables_created")
    except Exception as e:
        logger.warning("db.tables_failed", error=str(e))

    yield

    logger.info("app.shutdown")
    await redis_service.disconnect()
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    description="Multi-agent AI support platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(tickets.router, prefix="/api/v1/tickets", tags=["tickets"])
app.include_router(crm.router, prefix="/api/v1/crm", tags=["crm"])
app.include_router(refunds.router, prefix="/api/v1/refunds", tags=["refunds"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": "0.1.0",
        "env": settings.app_env,
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.app_name}",
        "docs": "/docs",
        "health": "/health",
    }
