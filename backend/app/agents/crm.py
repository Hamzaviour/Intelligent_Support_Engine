"""Mock CRM Agent."""
from typing import Dict, Any, List
import structlog

from app.agents.base import BaseAgent

logger = structlog.get_logger()


class CRMAgent(BaseAgent):
    """Agent for retrieving customer profile information (mocked for MVP)."""

    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Load customer profile information."""
        user_id = state.get("user_id")

        if not user_id:
            return {"crm_data": {}}

        # Try to convert user_id to int for mock logic; fallback to default
        try:
            user_id_int = int(user_id)
            is_vip = user_id_int < 1000
        except (ValueError, TypeError):
            is_vip = False

        # Mock CRM data for MVP
        crm_data = {
            "user_id": str(user_id),
            "vip_status": is_vip,
            "membership_tier": "gold" if is_vip else "standard",
            "lifetime_value": 5000.00,
            "purchase_count": 5,
        }

        return {
            "crm_data": crm_data,
        }