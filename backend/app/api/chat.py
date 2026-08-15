"""Chat API endpoints — multi-agent session-based conversation orchestration."""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import structlog
from typing import AsyncGenerator, Dict, Any, List
import json
import uuid
import time

from app.services.llm import llm_service
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

router = APIRouter()
logger = structlog.get_logger()

# Initialize all 10 agents
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

_SESSIONS: Dict[str, Dict[str, Any]] = {}
_SESSION_TTL_SECONDS = 60 * 60  # 1 hour idle timeout

SYSTEM_PROMPT = (
    "You are a helpful, empathetic customer support specialist for the "
    "Intelligent Support Engine (ISE). Be friendly, concise, and clear. "
    "Always acknowledge the customer's feelings when they are upset. "
    "Use context from earlier in the conversation to give coherent, "
    "personalised replies."
)


def _get_session(session_id: str) -> List[Dict[str, str]]:
    """Return the message history list for this session, creating it if new."""
    now = time.time()
    if session_id not in _SESSIONS:
        _SESSIONS[session_id] = {"history": [], "last_active": now}
        logger.info("session.created", session_id=session_id)
    else:
        _SESSIONS[session_id]["last_active"] = now
    return _SESSIONS[session_id]["history"]


def _save_turn(session_id: str, user_msg: str, assistant_msg: str) -> None:
    """Append a completed user/assistant exchange to the session history."""
    history = _get_session(session_id)
    history.append({"role": "user", "content": user_msg})
    history.append({"role": "assistant", "content": assistant_msg})
    logger.info("session.turn_saved", session_id=session_id, turns=len(history) // 2)


def _build_messages(session_id: str, new_user_message: str, agent_context: str = "") -> List[Dict[str, str]]:
    """Build the full message list: system prompt with agent context + history + new user turn."""
    history = _get_session(session_id)
    sys_prompt = SYSTEM_PROMPT
    if agent_context:
        sys_prompt += f"\n\n[Active Multi-Agent Context]:\n{agent_context}"
    return [
        {"role": "system", "content": sys_prompt},
        *history,
        {"role": "user", "content": new_user_message},
    ]


def _purge_expired_sessions() -> None:
    """Remove sessions that have been idle past the TTL."""
    cutoff = time.time() - _SESSION_TTL_SECONDS
    expired = [sid for sid, s in _SESSIONS.items() if s["last_active"] < cutoff]
    for sid in expired:
        del _SESSIONS[sid]
        logger.info("session.expired", session_id=sid)


@router.post("/session/new")
async def create_session():
    """Create a new isolated chat session and return its ID."""
    session_id = str(uuid.uuid4())
    _get_session(session_id)
    return {"success": True, "session_id": session_id}


@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Discard a session and its history."""
    if session_id in _SESSIONS:
        del _SESSIONS[session_id]
        logger.info("session.deleted", session_id=session_id)
    return {"success": True}


async def _run_multi_agent_pipeline(user_message: str, user_id: str, session_id: str) -> Dict[str, Any]:
    """Run full 10-Agent evaluation pipeline."""
    history = _get_session(session_id)
    state = {
        "messages": [{"role": "user", "content": user_message}],
        "user_id": user_id,
        "context": {},
        "conversation_response": user_message,
        "session_history": history,
    }

    # 1. Memory Agent
    memory_res = await memory_agent.execute(state)
    state["context"].update(memory_res.get("context", {}))

    # 2. CRM Agent
    crm_res = await crm_agent.execute(state)
    crm_data = crm_res.get("crm_data", {})
    state["crm_data"] = crm_data

    # 3. Intent Agent
    intent_res = await intent_agent.execute(state)
    intent = intent_res.get("intent", "general")
    confidence = intent_res.get("intent_confidence", 0.9)
    state["intent"] = intent
    state["intent_confidence"] = confidence

    # 4. Sentiment Agent
    sentiment_res = await sentiment_agent.execute(state)
    sentiment = sentiment_res.get("sentiment", "neutral")
    should_escalate_sentiment = sentiment_res.get("should_escalate", False)
    state["sentiment"] = sentiment

    # 5. Knowledge RAG Agent
    knowledge_res = await knowledge_agent.execute(state)
    knowledge_answer = knowledge_res.get("knowledge_answer", "")

    # 6. Refund Agent
    refund_status = "n/a"
    if intent == "refund":
        refund_res = await refund_agent.execute(state)
        refund_status = refund_res.get("status", "eligible")
        state["refund"] = refund_res

    # 7. Ticket Agent
    ticket_created = False
    ticket_id = None
    if intent in ["complaint", "technical", "billing"] or should_escalate_sentiment:
        ticket_res = await ticket_agent.execute(state)
        ticket_created = ticket_res.get("should_create_ticket", False)
        ticket_id = ticket_res.get("ticket_id", f"T-{uuid.uuid4().hex[:6].upper()}")
        state["ticket"] = ticket_res

    # 8. Escalation Agent
    escalation_res = await escalation_agent.execute(state)
    should_escalate = escalation_res.get("should_escalate", False) or should_escalate_sentiment
    escalation_reason = escalation_res.get("escalation_reason", "")

    # 9. Conversation Agent (Persona steering)
    conv_res = await conversation_agent.execute(state)

    # 10. Analytics Agent
    analytics_res = await analytics_agent.execute(state)
    analytics_data = analytics_res.get("analytics", {})

    agent_name = "Support Specialist"
    if intent == "refund":
        agent_name = "Refund Specialist"
    elif intent == "technical":
        agent_name = "Technical Support Engineer"
    elif intent == "shipping":
        agent_name = "Logistics Specialist"
    elif should_escalate or intent == "complaint":
        agent_name = "Customer Resolution Concierge"

    agent_context_notes = (
        f"Detected Intent: {intent} (confidence: {confidence:.2f}). "
        f"Sentiment: {sentiment}. Active Agent: {agent_name}."
    )
    if knowledge_answer:
        agent_context_notes += f" RAG Knowledge Chunk: {knowledge_answer[:150]}"

    return {
        "intent": intent,
        "confidence": confidence,
        "sentiment": sentiment,
        "should_escalate": should_escalate,
        "escalation_reason": escalation_reason,
        "agent": agent_name,
        "crm_data": crm_data,
        "refund_status": refund_status,
        "ticket_created": ticket_created,
        "ticket_id": ticket_id,
        "analytics": analytics_data,
        "agent_context": agent_context_notes,
        "agents_evaluated": [
            {"name": "Memory Agent", "status": "Active", "detail": "Retrieved chat memory"},
            {"name": "CRM Agent", "status": "Active", "detail": f"Profile: {crm_data.get('tier', 'Standard')}"},
            {"name": "Intent Agent", "status": "Active", "detail": f"Classified: {intent} ({confidence:.0%})"},
            {"name": "Sentiment Agent", "status": "Active", "detail": f"State: {sentiment}"},
            {"name": "Knowledge Agent", "status": "Active", "detail": "RAG search executed"},
            {"name": "Refund Agent", "status": "Active" if intent == "refund" else "Standby", "detail": refund_status},
            {"name": "Ticket Agent", "status": "Active" if ticket_created else "Standby", "detail": ticket_id or "No ticket required"},
            {"name": "Escalation Agent", "status": "Triggered" if should_escalate else "Monitoring", "detail": escalation_reason or "Normal flow"},
            {"name": "Conversation Agent", "status": "Active", "detail": f"Assigned: {agent_name}"},
            {"name": "Analytics Agent", "status": "Active", "detail": f"Tracked outcome: {analytics_data.get('outcome', 'resolved')}"},
        ],
    }


@router.post("/message")
async def send_message(message: Dict[str, Any]):
    """Send a message and receive a non-streaming AI response."""
    _purge_expired_sessions()

    user_message = message.get("content", "").strip()
    user_id = message.get("user_id", "guest")
    session_id = message.get("session_id") or str(uuid.uuid4())

    if not user_message:
        return {"success": False, "content": "Empty message.", "session_id": session_id}

    logger.info("chat.received", session_id=session_id, user_id=user_id, length=len(user_message))

    # Run Multi-Agent System
    agent_meta = await _run_multi_agent_pipeline(user_message, user_id, session_id)
    messages_payload = _build_messages(session_id, user_message, agent_meta["agent_context"])

    response = await llm_service.generate(messages_payload, stream=False)

    if not response or not isinstance(response, dict):
        return {"success": False, "content": "No response from LLM.", "session_id": session_id}

    content = response.get("content", "")
    _save_turn(session_id, user_message, content)

    logger.info("chat.responded", session_id=session_id, tokens=response.get("tokens_used", 0))

    return {
        "success": True,
        "content": content,
        "session_id": session_id,
        "agent": agent_meta["agent"],
        "intent": agent_meta["intent"],
        "sentiment": agent_meta["sentiment"],
        "confidence": agent_meta["confidence"],
        "should_escalate": agent_meta["should_escalate"],
        "agents_evaluated": agent_meta["agents_evaluated"],
    }


async def _stream_session_response(
    session_id: str,
    user_message: str,
    user_id: str,
) -> AsyncGenerator[str, None]:
    """Stream tokens with multi-agent orchestration metadata."""
    # 1. Run multi-agent pipeline first
    agent_meta = await _run_multi_agent_pipeline(user_message, user_id, session_id)

    # Yield agent metadata header event first
    yield json.dumps({
        "type": "meta",
        "agent": agent_meta["agent"],
        "intent": agent_meta["intent"],
        "sentiment": agent_meta["sentiment"],
        "confidence": agent_meta["confidence"],
        "should_escalate": agent_meta["should_escalate"],
        "agents_evaluated": agent_meta["agents_evaluated"],
    })

    messages_payload = _build_messages(session_id, user_message, agent_meta["agent_context"])
    full_response = ""

    async for token in llm_service.stream_generate(messages_payload):
        full_response += token
        yield json.dumps({"token": token})

    # Persist turn
    _save_turn(session_id, user_message, full_response)

    yield json.dumps({
        "type": "done",
        "content": full_response,
        "session_id": session_id,
        "agent": agent_meta["agent"],
        "intent": agent_meta["intent"],
        "sentiment": agent_meta["sentiment"],
        "agents_evaluated": agent_meta["agents_evaluated"],
    })


@router.post("/stream")
async def stream_message(message: Dict[str, Any]):
    """Stream a session-aware AI response token-by-token with Multi-Agent metadata."""
    _purge_expired_sessions()

    user_message = message.get("content", "").strip()
    user_id = message.get("user_id", "guest")
    session_id = message.get("session_id") or str(uuid.uuid4())

    if not user_message:
        async def _empty():
            yield json.dumps({"error": "Empty message."})
        return StreamingResponse(_empty(), media_type="text/event-stream")

    logger.info("chat.stream_start", session_id=session_id, user_id=user_id)

    async def event_stream() -> AsyncGenerator[bytes, None]:
        try:
            async for chunk in _stream_session_response(session_id, user_message, user_id):
                yield f"{chunk}\n\n"
        except Exception as e:
            logger.error("stream.error", session_id=session_id, error=str(e))
            yield json.dumps({"error": str(e), "session_id": session_id}) + "\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/history/{session_id}")
async def get_conversation_history(session_id: str):
    """Return the stored message history for a session."""
    history = _SESSIONS.get(session_id, {}).get("history", [])
    return {
        "success": True,
        "session_id": session_id,
        "messages": history,
        "turn_count": len(history) // 2,
    }


@router.post("/feedback")
async def submit_feedback(feedback: Dict[str, Any]):
    """Submit CSAT feedback for a conversation."""
    session_id = feedback.get("session_id", "unknown")
    logger.info("feedback.received", session_id=session_id, score=feedback.get("score"))
    return {"success": True, "message": "Feedback recorded"}