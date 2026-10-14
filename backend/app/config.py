from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "Intelligent Support Engine"
    app_env: str = "development"
    debug: bool = True
    log_level: str = "info"

    # LLM (Groq via LiteLLM)
    groq_api_key: str = ""
    groq_model_primary: str = "groq/llama-3.3-70b-versatile"
    groq_model_fast: str = "groq/llama-3.1-8b-instant"

    # Database
    database_url: str = "postgresql+asyncpg://ise:ise_dev_password@localhost:5432/ise_db"

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_url: str = ""  # e.g. rediss://default:pw@host:6379 (Upstash); overrides host/port

    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_api_key: str = ""
    qdrant_url: str = ""  # e.g. https://xxx.cloud.qdrant.io:6333 (Qdrant Cloud); overrides host/port

    # MinIO
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "ise-uploads"
    minio_secure: bool = False

    # Clerk
    clerk_secret_key: str = ""
    clerk_publishable_key: str = ""

    # Langfuse
    langfuse_public_key: str = ""
    langfuse_secret_key: str = ""
    langfuse_host: str = "http://localhost:3001"

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Rate limiting
    rate_limit_messages_per_minute: int = 10

    # Email
    resend_api_key: str = ""
    email_from: str = "support@ise.local"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


settings = Settings()
