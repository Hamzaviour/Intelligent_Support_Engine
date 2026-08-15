"""LangGraph agent state definition."""
from typing import Annotated, List, Literal, TypedDict, Optional, Any
from typing_extensions import TypedDict


class AgentState(TypedDict):
    """Shared state for all agents in the LangGraph workflow."""

    # Conversation state
    messages: List[Dict[str, Any]]
    conversation_response: Optional[str]
    assistant_response: Optional[list]

    # Agent outputs
    intent: str
    intent_confidence: Optional[float]
    sentiment: str
    sentiment_score: float
    sentiment_confidence: Optional[float]
    context: Dict[str, Any]
    recent_messages: List[Dict[str, Any]]

    # Ticket and CRM
    ticket: Optional[Dict[str, Any]]
    ticket_created: bool
    crm_data: Dict[str, Any]

    # Refund
    refund: Optional[Dict[str, Any]]
    refund_status: str

    # Other
    should_escalate: bool
    escalation_reason: Optional[str]
    escalation_summary: Optional[str]
    analytics: Dict[str, Any]

    # Control
    resolved: bool
    next_step: Optional[Literal["human_handoff", "final_response"]]


# Initial state factory
def create_initial_state(user_id: Optional[str] = None) -> AgentState:
    """Create initial empty state for new conversation."""
    return {
        "messages": [],
        "conversation_response": None,
        "assistant_response": None,
        "intent": "",
        "intent_confidence": None,
        "sentiment": "",
        "sentiment_score": 0.0,
        "sentiment_confidence": None,
        "context": {},
        "recent_messages": [],
        "ticket": None,
        "ticket_created": False,
        "crm_data": {},
        "refund": None,
        "refund_status": "not_applicable",
        "should_escalate": False,
        "escalation_reason": None,
        "escalation_summary": None,
        "analytics": {},
        "resolved": False,
        "next_step": None,
    }