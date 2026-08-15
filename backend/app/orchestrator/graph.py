"""LangGraph workflow orchestration."""
from typing import Dict, Any, Literal
import structlog

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolExecutor

from app.agents.conversation import ConversationAgent
from app.agents.intent import IntentAgent
from app.agents.memory import MemoryAgent
from app.agents.sentiment import SentimentAgent
from app.agents.knowledge import KnowledgeAgent
from app.agents.crm import CRMAgent
from app.agents.ticket import TicketAgent
from app.agents.refund import RefundAgent
from app.agents.escalation import EscalationAgent
from app.agents.analytics import AnalyticsAgent
from app.orchestrator.state import AgentState, create_initial_state

logger = structlog.get_logger()


# Initialize agents
conversation_agent = ConversationAgent("conversation")
intent_agent = IntentAgent("intent")
memory_agent = MemoryAgent("memory")
sentiment_agent = SentimentAgent("sentiment")
knowledge_agent = KnowledgeAgent("knowledge")
crm_agent = CRMAgent("crm")
ticket_agent = TicketAgent("ticket")
refund_agent = RefundAgent("refund")
escalation_agent = EscalationAgent("escalation")
analytics_agent = AnalyticsAgent("analytics")


def should_escalate(state: AgentState) -> Literal["human_handoff", "resolve"]:
    """Determine if conversation should escalate."""
    if state.get("should_escalate"):
        return "human_handoff"
    return "resolve"


def should_create_ticket(state: AgentState) -> Literal["create_ticket", "skip_ticket"]:
    """Determine if a ticket should be created."""
    if state.get("ticket_created", False):
        return "skip_ticket"

    # Auto-create ticket for certain intents
    if state.get("intent") in ["complaint", "technical", "billing", "cancelled"]:
        return "create_ticket"

    return "skip_ticket"


def should_process_refund(state: AgentState) -> Literal["process_refund", "skip_refund"]:
    """Determine if refund should be processed."""
    if state.get("intent") == "refund":
        return "process_refund"
    return "skip_refund"


# Define workflow nodes
async def detect_intent_node(state: AgentState) -> AgentState:
    """Intent detection node."""
    result = await intent_agent.execute(state)
    state["intent"] = result.get("intent", "")
    state["intent_confidence"] = result.get("intent_confidence", 0.5)
    return state


async def analyze_sentiment_node(state: AgentState) -> AgentState:
    """Sentiment analysis node."""
    result = await sentiment_agent.execute(state)
    state["sentiment"] = result.get("sentiment", "neutral")
    state["sentiment_score"] = result.get("sentiment_score", 0.0)
    state["sentiment_confidence"] = result.get("sentiment_confidence", 0.5)
    state["should_escalate"] = result.get("should_escalate", False)
    return state


async def load_context_node(state: AgentState) -> AgentState:
    """Load context nodes."""
    result = await memory_agent.execute(state)
    crm_result = await crm_agent.execute(state)

    state["context"].update(result.get("context", {}))
    state["crm_data"].update(crm_result.get("crm_data", {}))

    return state


async def process_request_node(state: AgentState) -> AgentState:
    """Process request based on intent."""
    intent = state.get("intent", "")

    if intent == "knowledge":
        result = await knowledge_agent.execute(state)
        state["conversation_response"] = result.get("knowledge_answer", "")
    elif intent == "refund":
        result = await refund_agent.execute(state)
        state["refund"] = result.get("refund")
        state["refund_status"] = result.get("refund_status", "pending")

    return state


async def create_ticket_node(state: AgentState) -> AgentState:
    """Create ticket."""
    result = await ticket_agent.execute(state)
    state["ticket"] = result.get("ticket", {})
    state["ticket_created"] = result.get("should_create_ticket", False)
    return state


async def check_escalation_node(state: AgentState) -> AgentState:
    """Check if escalation is needed."""
    if state.get("ticket") and state.get("ticket_created"):
        result = await escalation_agent.execute(state)
        state["should_escalate"] = result.get("should_escalate", False)
        state["escalation_reason"] = result.get("escalation_reason")
        state["escalation_summary"] = result.get("escalation_summary")
    return state


async def generate_response_node(state: AgentState) -> AgentState:
    """Generate final response."""
    result = await conversation_agent.execute(state)
    state["assistant_response"] = result.get("assistant_response")
    return state


async def track_analytics_node(state: AgentState) -> AgentState:
    """Track analytics."""
    result = await analytics_agent.execute(state)
    state["analytics"].update(result.get("analytics", {}))
    state["resolved"] = not state.get("should_escalate", False)
    return state


# Build the LangGraph workflow
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("detect_intent", detect_intent_node)
workflow.add_node("analyze_sentiment", analyze_sentiment_node)
workflow.add_node("load_context", load_context_node)
workflow.add_node("process_request", process_request_node)
workflow.add_node("create_ticket", create_ticket_node)
workflow.add_node("check_escalation", check_escalation_node)
workflow.add_node("generate_response", generate_response_node)
workflow.add_node("track_analytics", track_analytics_node)

# Add edges (initial flow)
workflow.set_entry_point("detect_intent")
workflow.add_edge("detect_intent", "analyze_sentiment")
workflow.add_edge("analyze_sentiment", "load_context")
workflow.add_edge("load_context", "process_request")

# Conditional edges for ticket
workflow.add_conditional_edges(
    "process_request",
    should_create_ticket,
    {
        "create_ticket": "create_ticket",
        "skip_ticket": "check_escalation",
    },
)

workflow.add_edge("create_ticket", "check_escalation")

# Conditional edge for escalation
workflow.add_conditional_edges(
    "check_escalation",
    should_escalate,
    {
        "human_handoff": "track_analytics",
        "resolve": "generate_response",
    },
)

workflow.add_edge("track_analytics", END)
workflow.add_edge("generate_response", "track_analytics")

# Compile the graph
app = workflow.compile()

logger.info("orchestrator.graph_built")