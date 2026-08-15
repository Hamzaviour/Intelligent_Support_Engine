# Technical Requirement Document — Intelligent Support Engine

**Project:** Intelligent Support Engine (ISE)
**Version:** 0.1.0 (TRD v1)
**Status:** Draft
**Last Updated:** 2026-08-07

---

## 1. Architectural Overview

The ISE is a **multi-agent orchestrator** built on a "Hub-and-Spoke" model. A central **Conversation Agent** manages the user interface, while a **Planning Agent** (powered by LangGraph) coordinates specialized agents to solve the problem.

### 1.1 Conceptual Architecture
`Customer` $\rightarrow$ `Omnichannel Gateway` $\rightarrow$ `Conversation Agent` $\rightarrow$ `Planning Agent` $\rightarrow$ `Specialized Agents (Knowledge, CRM, Ticket, etc.)` $\rightarrow$ `Action/Response`

### 1.2 High-Level Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion.
- **Backend:** FastAPI (Python 3.12+), Pydantic AI.
- **Orchestration:** LangGraph (StateGraph) for multi-agent workflow.
- **LLM Gateway:** LiteLLM (routing to Groq Llama 3.3 70B).
- **Vector DB:** Qdrant (Hybrid search: Vector + BM25).
- **Database:** PostgreSQL (Relational data, chat history).
- **Cache/Queue:** Redis (Session state, Celery tasks).
- **Auth:** Clerk (Customer sessions).
- **Observability:** Langfuse (LLM tracing), Prometheus/Grafana (System metrics).

---

## 2. Detailed Agent Specifications

### 2.1 The "Front-Office" Agents

| Agent | Role | Core Logic | Tools / Inputs |
|---|---|---|---|
| **Conversation Agent** | Interface Manager | Natural language bridge, routing, streaming, translation. | System prompts for tone, tool-calling for Planning Agent. |
| **Intent Agent** | Classifier | Map user input to specific intents (e.g., `refund_request`, `tech_issue`). | Few-shot classification prompt $\rightarrow$ Enum. |
| **Memory Agent** | Context Provider | Retrieve customer history, VIP status, previous tickets. | Postgres (User Profile) + Qdrant (Chat Memory). |
| **Sentiment Agent** | Emotion Monitor | Continuous sentiment scoring (Happy $\rightarrow$ Angry). | Sentiment Analysis prompt $\rightarrow$ Score (-1 to 1). |

### 2.2 The "Back-Office" Agents (Tool-focused)

| Agent | Role | Core Logic | Tools / APIs |
|---|---|---|---|
| **Knowledge Agent** | RAG Specialist | Semantic search over docs $\rightarrow$ synthesis of answer. | Qdrant search, PDF/Doc parser, Reranker. |
| **Ticket Agent** | Ticket Manager | Create/Update tickets, SLA estimation, category tagging. | Internal Ticket API (Postgres). |
| **CRM Agent** | Profile Manager | Read/Write customer data, membership status, LTV. | Mock CRM API $\rightarrow$ Local DB. |
| **Refund Agent** | Policy Executor | (Policy $\rightarrow$ Eligibility $\rightarrow$ Approval $\rightarrow$ Trigger). | Mock Refund Gateway $\rightarrow$ DB. |
| **Escalation Agent** | Handoff Specialist | Determine if human intervention is needed; summarize context. | Logic: (Sentiment < -0.7) OR (Confidence < 0.6). |
| **Analytics Agent** | Metric Tracker | Log resolution time, CSAT, accuracy. | Prometheus / Custom Postgres Logs. |

---

## 3. Data Architecture

### 3.1 Database Schema (PostgreSQL)
- **Users:** `id, clerk_id, email, name, vip_status, created_at`
- **Conversations:** `id, user_id, status (active/resolved/escalated), started_at`
- **Messages:** `id, conversation_id, role (user/assistant/system), content, token_count, timestamp`
- **Tickets:** `id, conversation_id, user_id, priority, status, category, summary, sla_deadline`
- **SentimentLogs:** `id, conversation_id, score, message_id, timestamp`

### 3.2 Vector Store (Qdrant)
- **Collections:**
    - `kb_docs`: Documentation chunks (Text, Metadata: source, page).
    - `user_memory`: Past a-priori facts about users (e.g., "Customer owns a 2023 Macbook Air").
- **Search Strategy:**
    - Hybrid: Dense Vector (Cosine) + Sparse Vector (BM25).
    - Reranking: Cohere or BGE-Reranker for top-k precision.

---

## 4. Orchestration Logic (LangGraph)

We will use a **StateGraph** where the state is a `TypedDict` containing:
- `messages`: Sequence of all messages.
- `intent`: Current detected intent.
- `sentiment`: Current sentiment score.
- `context`: Metadata from Memory/CRM Agents.
- `next_step`: Next node to visit.
- `resolved`: Boolean.

### 4.1 Graph Nodes
1. `detect_intent`: Input $\rightarrow$ Intent Agent $\rightarrow$ Updated State.
2. `load_context`: Intent $\rightarrow$ Memory/CRM Agent $\rightarrow$ Updated State.
3. `process_request`:
    - If `intent == knowledge` $\rightarrow$ `knowledge_agent`.
    - If `intent == refund` $\rightarrow$ `refund_agent`.
    - Etc.
4. `sentiment_check`: Check if sentiment dropped $\rightarrow$ possible `escalation_agent`.
5. `generate_response`: Synthesize final answer $\rightarrow$ `Conversation Agent`.

---

## 5. API Design

### 5.1 Chat API (FastAPI)
- `POST /chat/message`: Send user message, get streamed response.
- `GET /chat/history/{conversation_id}`: Retrieve previous messages.
- `POST /chat/feedback`: Submit CSAT rating.

### 5.2 Internal Tool APIs (FastAPI)
- `POST /tools/ticket/create`
- `GET /tools/crm/profile/{user_id}`
- `POST /tools/refund/process`

---

## 6. Non-Functional Specifications

- **Concurrency:** FastAPI with `asyncio` for non-blocking I/O.
- **LLM Performance:** Groq for near-instant inference on Llama 3.3.
- **Reliability:** Exponential backoff for API calls; dead-letter queue in Redis for failed ticket updates.
- **Observability:** Langfuse integration via `langfuse-python` wrapper around LLM calls.
- **Deployment:** Multi-container Docker Compose (`backend`, `frontend`, `postgres`, `redis`, `qdrant`).

---

## 7. Security Requirements

- **Secrets:** Environment variables via `.env` (loaded by Pydantic Settings).
- **Authentication:** Clerk JWT verification on every backend request.
- **Rate Limiting:** Redis-based rate limiting per `user_id` (e.g., 10 messages/minute).
- **Sanitization:** Pydantic models for all input validation.
