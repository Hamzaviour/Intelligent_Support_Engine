"""Ticket API endpoints."""
from fastapi import APIRouter
from pydantic import BaseModel
import structlog

router = APIRouter()
logger = structlog.get_logger()


class TicketCreate(BaseModel):
    subject: str
    description: str
    priority: str = "medium"


@router.get("/list")
async def get_tickets(
    priority: str = None,
    status: str = None,
):
    """Get list of tickets with optional filters."""
    return {"tickets": [], "count": 0}


@router.get("/{ticket_id}")
async def get_ticket(
    ticket_id: str,
):
    """Get a specific ticket by ID."""
    return {"ticket_id": ticket_id, "subject": "Demo Ticket"}


@router.post("/create")
async def create_ticket(
    ticket: TicketCreate,
):
    """Create a new ticket."""
    return {"ticket_id": "123", **ticket.model_dump()}
