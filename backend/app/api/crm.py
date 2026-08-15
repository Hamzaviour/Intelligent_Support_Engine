"""CRM API endpoints."""
from fastapi import APIRouter
import structlog

router = APIRouter()
logger = structlog.get_logger()


@router.get("/profile/{user_id}")
async def get_crm_profile(
    user_id: str,
):
    """Get customer CRM profile."""
    return {
        "user_id": user_id,
        "name": "Demo Customer",
        "vip_status": False,
        "membership_tier": "standard",
        "lifetime_value": 0.0,
        "purchase_count": 0,
    }
