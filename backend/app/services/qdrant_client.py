"""Qdrant vector database client service."""
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
import structlog
from typing import List, Optional
import uuid

from app.config import settings

logger = structlog.get_logger()


class QdrantService:
    """Service for Qdrant vector search operations."""

    def __init__(self):
        self.client: Optional[QdrantClient] = None
        self.collection_name = "kb_docs"

    async def connect(self):
        """Connect to Qdrant."""
        try:
            self.client = QdrantClient(
                host=settings.qdrant_host,
                port=settings.qdrant_port,
                api_key=settings.qdrant_api_key if settings.qdrant_api_key else None,
            )

            # Check if collection exists, create if not
            collections = self.client.get_collections().collections
            collection_names = [c.name for c in collections]

            if self.collection_name not in collection_names:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
                )
                logger.info("qdrant.collection_created", collection=self.collection_name)

            logger.info("qdrant.connected", host=settings.qdrant_host, port=settings.qdrant_port)

        except Exception as e:
            logger.error("qdrant.connect_failed", error=str(e))
            raise

    async def ensure_collections(self):
        """Ensure all required collections exist."""
        # For MVP, we only need kb_docs
        await self.connect()

    async def search(
        self,
        query_vector: List[float],
        limit: int = 3,
        filter_condition: Optional[dict] = None,
    ) -> List[dict]:
        """
        Search for similar documents.

        Args:
            query_vector: Query vector
            limit: Number of results
            filter_condition: Optional filter dict

        Returns:
            List of matching documents with payload
        """
        if not self.client:
            logger.warning("qdrant.not_connected", collection=self.collection_name)
            return []

        try:
            if filter_condition:
                # Build filter for Qdrant
                must = []
                if "document_id" in filter_condition:
                    must.append(
                        FieldCondition(
                            key="document_id",
                            match=MatchValue(value=filter_condition["document_id"]),
                        )
                    )
                if "user_id" in filter_condition:
                    must.append(
                        FieldCondition(
                            key="user_id",
                            match=MatchValue(value=filter_condition["user_id"]),
                        )
                    )

                filter_obj = Filter(must=must) if must else None
            else:
                filter_obj = None

            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=limit,
                query_filter=filter_obj,
            )

            return [
                {
                    "id": r.id,
                    "score": r.score,
                    "payload": r.payload,
                }
                for r in results
            ]

        except Exception as e:
            logger.error("qdrant.search_failed", error=str(e))
            return []

    async def upsert(self, documents: List[dict]):
        """
        Upsert documents into Qdrant.

        Args:
            documents: List of document dicts with 'id', 'vector', and 'payload' keys
        """
        if not self.client:
            logger.warning("qdrant.not_connected")
            return

        try:
            points = [
                PointStruct(
                    id=d["id"],
                    vector=d["vector"],
                    payload=d["payload"],
                )
                for d in documents
            ]

            self.client.upload_points(
                collection_name=self.collection_name,
                points=points,
            )
            logger.info("qdrant.upsert_complete", count=len(documents))

        except Exception as e:
            logger.error("qdrant.upsert_failed", error=str(e))


# Global service instance
qdrant_service = QdrantService()