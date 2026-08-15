# Implementation Plan — Intelligent Support Engine

**Version:** 0.1.0
**Created:** 2026-08-07
**Last Updated:** 2026-08-07

---

## Project Overview

This document details the step-by-step implementation of the Intelligent Support Engine — a multi-agent AI support system that combines 10+ specialized agents to provide intelligent customer support.

**Goal:** Deploy a working MVP on `localhost:3000` with web chat and email channels, powered by Groq LLM, LangGraph orchestration, and a full backend stack.

---

## Phase 1: Foundation & Infrastructure (Days 1-2)

### 1.1 Project Structure Setup
**Objective:** Create the monorepo structure with frontend, backend, and infrastructure directories.

**Actions:**
- [ ] Initialize project root at `/Intelligent Support Engine/`
- [ ] Create directory structure:
  ```
  Intelligent-Support-Engine/
  ├── docs/                    # Documentation
  ├── frontend/                # Next.js 15 app
  ├── backend/                 # FastAPI + Python agents
  ├── infra/                   # Docker, configs
  └── tests/                   # Integration tests
  ```
- [ ] Create `.gitignore`, `README.md`, and `package.json` (workspace)
- [ ] Set up Python virtual environment in `backend/`

**Deliverable:** Project structure with all directories, basic configs, and documentation in `docs/` (PRD, TRD, Schema, etc.)

---

### 1.2 Docker Compose Infrastructure
**Objective:** Containerize all required services for local development.

**Services:**
- `postgres` — PostgreSQL 16 (port 5432)
- `redis` — Redis 7 (port 6379)
- `qdrant` — Vector DB (port 6333)
- `minio` — Object storage (port 9000, console 9001)
- `langfuse` — LLM observability (port 3001)
- `backend` — FastAPI app (port 8000)
- `frontend` — Next.js (port 3000)

**Actions:**
- [ ] Write `infra/docker-compose.yml` with all services
- [ ] Write `backend/Dockerfile` (multi-stage build)
- [ ] Write `frontend/Dockerfile` (multi-stage build)
- [ ] Write `.env.example` with all environment variables
- [ ] Create `infra/Makefile` with common commands (`make up`, `make down`, `make logs`)

**Deliverable:** `docker compose up -d` brings up the entire stack.

---

### 1.3 Database Setup
**Objective:** Implement and migrate the PostgreSQL schema.

**Actions:**
- [ ] Create `backend/app/db/models/` with SQLAlchemy models
- [ ] Write Alembic migration for all tables (users, conversations, messages, tickets, orders, refunds, sentiment, csat)
- [ ] Create seed data script (`backend/scripts/seed.py`)
- [ ] Run `alembic upgrade head` in Docker
- [ ] Verify all tables created with `docker exec -it ... psql`

**Deliverable:** Database with all tables and seed data running on `localhost:5432`.

---

## Phase 2: Backend Core & Agent System (Days 3-5)

### 2.1 FastAPI Application Scaffold
**Objective:** Build the main API server with core dependencies.

**Actions:**
- [ ] Create `backend/app/main.py` with FastAPI app
- [ ] Set up CORS middleware for frontend
- [ ] Add health check endpoint (`GET /health`)
- [ ] Configure structured logging (structlog)
- [ ] Set up Pydantic settings with `.env` loading
- [ ] Create API router structure:
  - `/api/v1/chat/` — Chat endpoints
  - `/api/v1/auth/` — Clerk auth verification
  - `/api/v1/tickets/` — Ticket management
  - `/api/v1/crm/` — Customer profile (mocked)
  - `/api/v1/refunds/` — Refund processing (mocked)

**Deliverable:** Running FastAPI server at `localhost:8000` with OpenAPI docs at `/docs`.

---

### 2.2 LLM Gateway & Configuration
**Objective:** Set up Groq API integration with LiteLLM routing.

**Actions:**
- [ ] Install dependencies: `litellm`, `groq`, `openai`
- [ ] Create `backend/app/services/llm.py` with:
  - LiteLLM configuration for Groq
  - Model routing (use `groq/llama-3.3-70b-versatile` for general, `groq/llama-3.1-8b-instant` for fast tasks)
  - Streaming support for real-time responses
  - Error handling with fallback
- [ ] Implement token counting for cost tracking
- [ ] Add rate limiting via Redis

**Deliverable:** LLM service that can generate responses via Groq with streaming.

---

### 2.3 Agent Base Classes
**Objective:** Create the foundation for all specialized agents.

**Actions:**
- [ ] Create `backend/app/agents/base.py` with:
  - `BaseAgent` abstract class
  - Context management (shared state between agents)
  - Tool calling infrastructure
  - Async execution model
- [ ] Implement agent registry pattern
- [ ] Create common tool definitions (search, ticket_create, refund_process, etc.)

**Deliverable:** Reusable agent framework with tool calling capability.

---

### 2.4 Core Agents Implementation
**Objective:** Build the essential agents that handle customer interactions.

**Agents to implement:**

#### Conversation Agent (`backend/app/agents/conversation.py`)
- [ ] Handle greeting and conversation flow
- [ ] Manage message streaming
- [ ] Translate across 6 languages (detected automatically)
- [ ] Coordinate with Planning Agent

#### Intent Agent (`backend/app/agents/intent.py`)
- [ ] Classify user input into intents: refund, complaint, technical, billing, password_reset, subscription, shipping, account_deletion
- [ ] Use few-shot prompting with examples
- [ ] Return intent + confidence score

#### Memory Agent (`backend/app/agents/memory.py`)
- [ ] Load customer context from database
- [ ] Query Qdrant for similar past conversations
- [ ] Provide memory snippets to Planning Agent

#### Sentiment Agent (`backend/app/agents/sentiment.py`)
- [ ] Score sentiment (-1.0 to 1.0) on each message
- [ ] Detect emotional states: happy, neutral, frustrated, angry
- [ ] Trigger escalation if frustration rises

#### Knowledge Agent (`backend/app/agents/knowledge.py`)
- [ ] Implement RAG with Qdrant
- [ ] Hybrid search: vector + BM25
- [ ] Return relevant document chunks with citations
- [ ] Confidence scoring on retrieved knowledge

**Deliverable:** All 5 core agents operational and tested.

---

### 2.5 Tool Agents Implementation
**Objective:** Build agents that execute real actions.

**Agents to implement:**

#### CRM Agent (`backend/app/agents/crm.py`)
- [ ] Mock CRM data for MVP
- [ ] Load customer profile, orders, membership, LTV
- [ ] Integrate with database for real customer data

#### Ticket Agent (`backend/app/agents/ticket.py`)
- [ ] Create tickets with priority, category, SLA estimation
- [ ] Auto-generate summaries from conversation
- [ ] Update ticket status

#### Refund Agent (`backend/app/agents/refund.py`)
- [ ] Check purchase date against refund policy
- [ ] Validate eligibility (damage, dissatisfaction, etc.)
- [ ] Process refund via mock payment gateway
- [ ] Update order and refund records

#### Escalation Agent (`backend/app/agents/escalation.py`)
- [ ] Trigger on: angry sentiment, low confidence, VIP customer, high-value purchase
- [ ] Generate AI conversation summary for human agent
- [ ] Create escalated ticket

#### Analytics Agent (`backend/app/agents/analytics.py`)
- [ ] Track: FRT, resolution time, CSAT, refund rate, escalation rate
- [ ] Store metrics in Postgres
- [ ] Expose via API for dashboard

**Deliverable:** All tool agents implemented with database integration.

---

### 2.6 LangGraph Orchestration
**Objective:** Build the central state machine that coordinates all agents.

**Actions:**
- [ ] Create `backend/app/orchestrator/graph.py`
- [ ] Define `AgentState` TypedDict with:
  - `messages`: List of all messages
  - `intent`: Current intent
  - `sentiment`: Current sentiment score
  - `context`: Agent context (CRM, memory)
  - `next_step`: Next node to visit
  - `resolved`: Boolean
- [ ] Implement graph nodes:
  - `detect_intent` → `load_context` → `process_request` → `sentiment_check` → `generate_response`
- [ ] Add conditional edges for different intent paths
- [ ] Implement human handoff edge
- [ ] Add self-evaluation node before response

**Deliverable:** Working LangGraph workflow that routes conversations to the right agents.

---

## Phase 3: Frontend Development (Days 6-8)

### 3.1 Next.js Setup
**Objective:** Scaffold the frontend with modern stack.

**Actions:**
- [ ] Initialize Next.js 15 app with TypeScript
- [ ] Configure Tailwind CSS with dark mode default
- [ ] Install and configure shadcn/ui
- [ ] Set up Clerk for authentication
- [ ] Add Framer Motion for animations
- [ ] Configure environment variables

**Deliverable:** Running Next.js app at `localhost:3000`.

---

### 3.2 Authentication
**Objective:** Implement Clerk auth integration.

**Actions:**
- [ ] Set up Clerk SDK (`@clerk/nextjs`)
- [ ] Create sign-in/sign-up pages
- [ ] Implement protected routes
- [ ] Add user profile component
- [ ] Verify JWT on backend (middleware)

**Deliverable:** Users can sign in and their identity is validated on the backend.

---

### 3.3 Chat Interface
**Objective:** Build the main customer-facing chat UI.

**Actions:**
- [ ] Create `ChatWindow` component with:
  - Message list (user/assistant bubbles)
  - Typing indicator animation
  - Auto-scroll to bottom
  - Loading states
- [ ] Implement `MessageInput` with:
  - Text input
  - File attachment support
  - Send button with keyboard shortcut (Enter)
- [ ] Add real-time streaming with Server-Sent Events (SSE)
- [ ] Implement multi-language UI (English, Spanish, French, German, Arabic, Hindi)
- [ ] Add voice input placeholder (stub)

**Deliverable:** Functional chat interface with streaming responses.

---

### 3.4 Support Dashboard (Human Agents)
**Objective:** Build the dashboard for human support agents.

**Actions:**
- [ ] Create dashboard layout with sidebar
- [ ] Build `TicketList` component with filters
- [ ] Implement `ConversationView` with full transcript
- [ ] Add `AISummary` component showing:
  - AI confidence score
  - Recommended actions
  - Sentiment history
- [ ] Create quick action buttons (Reopen, Close, Escalate)

**Deliverable:** Human agent dashboard with ticket management.

---

### 3.5 Analytics Dashboard
**Objective:** Build metrics visualization for operations.

**Actions:**
- [ ] Create `MetricsOverview` with KPI cards:
  - First response time
  - Resolution time
  - CSAT score
  - Escalation rate
- [ ] Add charts (recharts) for trends
- [ ] Implement time range selector
- [ ] Add data export functionality

**Deliverable:** Analytics dashboard with real metrics from the system.

---

## Phase 4: Integration & Testing (Days 9-10)

### 4.1 End-to-End Chat Flow
**Objective:** Verify the complete customer journey works.

**Test Scenarios:**
1. Customer sends refund request → System detects intent → Checks policy → Processes refund → Confirms to user
2. Customer with technical issue → RAG search → Knowledge agent responds with guide
3. Angry customer → Sentiment detects anger → Escalation triggers → Human dashboard notified
4. Returning customer → Memory loaded → System references previous conversations

**Actions:**
- [ ] Run each scenario manually
- [ ] Log all agent decisions in Langfuse
- [ ] Verify database records created correctly

**Deliverable:** Confirmed working end-to-end chat flows.

---

### 4.2 Email Integration (MVP)
**Objective:** Enable email as a support channel.

**Actions:**
- [ ] Set up Resend/SendGrid in backend
- [ ] Create email parser for inbound messages
- [ ] Route emails through the same agent system
- [ ] Implement email response templates
- [ ] Add reply-to threading

**Deliverable:** Customers can email support and receive AI responses.

---

### 4.3 Observability
**Objective:** Ensure full traceability of all agent decisions.

**Actions:**
- [ ] Configure Langfuse with FastAPI middleware
- [ ] Add tracing to every agent call
- [ ] Set up Grafana dashboard (basic)
- [ ] Create alerting for failed escalations
- [ ] Log all tool calls with parameters and results

**Deliverable:** Full observability of the multi-agent system.

---

### 4.4 Testing
**Objective:** Write tests for critical paths.

**Actions:**
- [ ] Unit tests for all agents
- [ ] Integration tests for LangGraph workflow
- [ ] E2E tests for chat flow (Playwright)
- [ ] Load test with Locust (100 concurrent users)
- [ ] Test sentiment escalation triggers

**Deliverable:** 80%+ code coverage on core logic.

---

## Phase 5: Polish & Deployment (Days 11-12)

### 5.1 Performance Optimization
**Actions:**
- [ ] Profile LLM response times, optimize prompts
- [ ] Add Redis caching for CRM profiles
- [ ] Implement response streaming (already in place)
- [ ] Optimize Qdrant queries (pagination, filters)
- [ ] Add database query indexing verification

### 5.2 Error Handling & Edge Cases
**Actions:**
- [ ] Handle LLM rate limits gracefully
- [ ] Implement fallback responses for service failures
- [ ] Add retry logic with exponential backoff
- [ ] Test network disconnection scenarios
- [ ] Handle malformed user inputs

### 5.3 Documentation & README
**Actions:**
- [ ] Write comprehensive `README.md`
- [ ] Document API endpoints
- [ ] Create contributor guide
- [ ] Document deployment steps
- [ ] Add troubleshooting section

### 5.4 Final Verification
**Checklist:**
- [ ] `http://localhost:3000` shows chat interface
- [ ] Customer can sign in via Clerk
- [ ] Customer can send messages and receive AI responses
- [ ] Refund flow works end-to-end
- [ ] Escalation creates ticket in dashboard
- [ ] Email channel works
- [ ] All services run via Docker Compose
- [ ] Langfuse shows traces
- [ ] No console errors

---

## File Structure (Target State)

```
Intelligent-Support-Engine/
├── docs/
│   ├── PRD.md                    # Product Requirements
│   ├── TRD.md                    # Technical Requirements
│   ├── APP_FLOW.md               # Application Flow
│   ├── UI_UX_Details.md          # Design Brief
│   ├── BACKEND_SCHEMA.md         # Database Schema
│   └── IMPLEMENTATION_PLAN.md    # This file
│
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── (auth)/           # Auth routes
│   │   │   ├── (dashboard)/      # Dashboard routes
│   │   │   ├── chat/             # Chat interface
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── chat/             # Chat components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   └── ui/               # shadcn/ui
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # Utilities
│   │   └── types/                # TypeScript types
│   ├── package.json
│   └── Dockerfile
│
├── backend/
│   ├── app/
│   │   ├── agents/               # Agent implementations
│   │   │   ├── base.py
│   │   │   ├── conversation.py
│   │   │   ├── intent.py
│   │   │   ├── memory.py
│   │   │   ├── sentiment.py
│   │   │   ├── knowledge.py
│   │   │   ├── crm.py
│   │   │   ├── ticket.py
│   │   │   ├── refund.py
│   │   │   ├── escalation.py
│   │   │   └── analytics.py
│   │   ├── db/
│   │   │   ├── models/           # SQLAlchemy models
│   │   │   ├── migrations/       # Alembic
│   │   │   └── session.py
│   │   ├── orchestrator/         # LangGraph workflow
│   │   │   ├── graph.py
│   │   │   └── state.py
│   │   ├── services/
│   │   │   ├── llm.py            # Groq/LiteLLM
│   │   │   ├── email.py          # Resend
│   │   │   └── qdrant.py         # Vector search
│   │   ├── api/                  # FastAPI routes
│   │   └── main.py
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── infra/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── Makefile
│
├── tests/
│   └── e2e/                      # Playwright tests
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Dependencies Summary

### Frontend
- `next@15`
- `react@19`
- `typescript`
- `tailwindcss`
- `@clerk/nextjs`
- `framer-motion`
- `recharts` (analytics)
- `shadcn/ui` components
- `@ai-sdk/openai` (for AI SDK)

### Backend
- `fastapi`
- `uvicorn[standard]`
- `sqlalchemy[asyncio]`
- `asyncpg`
- `alembic`
- `langgraph`
- `langchain`
- `litellm`
- `groq`
- `qdrant-client`
- `redis`
- `pydantic-ai`
- `resend`
- `celery` (async tasks)
- `structlog`

### Infrastructure
- PostgreSQL 16
- Redis 7
- Qdrant
- MinIO
- Langfuse

---

## Success Criteria (MVP)

The system is considered "working on localhost" when:

1. ✅ `docker compose up -d` starts all services
2. ✅ `http://localhost:3000` loads the chat interface
3. ✅ Customer can sign in via Clerk
4. ✅ Customer sends a refund request → receives AI response
5. ✅ Refund is processed and ticket created
6. ✅ Customer with angry sentiment gets escalated
7. ✅ Human agent sees ticket in dashboard
8. ✅ All agent decisions are traced in Langfuse
9. ✅ `http://localhost:8000/docs` shows API docs
10. ✅ No critical errors in console/logs

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| LLM hallucination | RAG-grounded responses, confidence scoring, refusal when unsure |
| Agent coordination bugs | Explicit LangGraph state machine, unit tests for each node |
| Docker setup failures | Test on clean machine, provide Makefile with health checks |
| Groq API limits | Implement rate limiting, fallback to smaller model |
| Time overruns | Prioritize core flow (refund + escalation), defer analytics dashboard |

---

## Notes

- Use **Groq API** key provided by user for LLM calls
- The ruflo plugins (from marketplace) are **optional** — the system works without them
- **MCP tools** (Gmail, Stripe, etc.) are stubbed for MVP; actual integrations are future work
- Focus on getting the **refund + escalation flows** working perfectly before adding complexity
