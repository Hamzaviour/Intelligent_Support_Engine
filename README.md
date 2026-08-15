# Intelligent Support Engine (ISE)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-orange)](https://github.com/langchain-ai/langgraph)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://typescriptlang.org/)

Enterprise customer support platform powered by a **10-Agent Multi-Agent System**. Every customer request is dynamically analyzed, classified, and resolved by specialized AI agents working in concert via LangGraph orchestration.

---

## What It Does

A customer opens a live chat. Behind the scenes, 10 specialized agents collaborate in real time:

| # | Agent | Role |
|---|-------|------|
| 1 | **Memory Agent** | Loads conversation history and session context |
| 2 | **CRM Agent** | Fetches user profile, VIP tier, past orders |
| 3 | **Intent Agent** | Classifies request type (refund, technical, billing, complaint) |
| 4 | **Sentiment Agent** | Scores customer emotion and frustration level |
| 5 | **Knowledge Agent** | RAG vector search over support knowledge base (Qdrant) |
| 6 | **Refund Agent** | Validates refund rules and processes automatic returns |
| 7 | **Ticket Agent** | Creates and manages support tickets with SLAs |
| 8 | **Escalation Agent** | Triggers human handoff for high-frustration cases |
| 9 | **Conversation Agent** | Generates natural-language responses with persona steering |
| 10 | **Analytics Agent** | Tracks FRT, resolution rate, latency, CSAT |

The system handles the full lifecycle: intake → classification → context enrichment → resolution or escalation → analytics capture.

---

## Flow Overview

```
Customer message
    → Intent Agent (classify) + Sentiment Agent (score)
    → Memory Agent + CRM Agent (load context)
    → Knowledge Agent (RAG search if needed)
    → Refund Agent / Ticket Agent / Escalation Agent (action)
    → Conversation Agent (compose response)
    → Analytics Agent (log metrics)
    → SSE-streamed response to frontend
```

**Escalation path**: Sentiment score below threshold triggers Escalation Agent, which auto-fills a ticket and hands off to a human agent session.

**RAG path**: Technical queries flow through Knowledge Agent, embedding the query with a local model and searching the Qdrant `kb_docs` collection. Responses include source citations.

---

## Tech Stack

### Backend
- **FastAPI** — async REST + SSE API
- **LangGraph** — multi-agent state machine orchestration
- **SQLAlchemy 2.0** (async) — PostgreSQL ORM
- **Qdrant** — vector search (RAG knowledge base)
- **Redis** — session cache and rate limiting
- **PostgreSQL 16** — primary relational database
- **Groq / LiteLLM** — LLM inference routing
- **python-jose** — JWT auth
- **Celery + Flower** — async task queue (monitoring)
- **Langfuse** — LLM observability and tracing

### Frontend
- **Next.js 14** (App Router) — SSR + API routing
- **React 18** + **TypeScript 5**
- **Tailwind CSS** + **Tailwind CSS Animate** — utility-first styling
- **Framer Motion** — page and component animations
- **shadcn/ui** (Radix UI) — accessible component primitives
- **Recharts** — analytics dashboard charts
- **Axios** — HTTP client
- **Clerk** — authentication (optional; demo accounts also supported)

### Infrastructure
- **Docker Compose** — one-command stack up (Postgres, Redis, Qdrant, MinIO, Langfuse)
- **MinIO** — S3-compatible object storage (ticket attachments)

---

## Target Audience

- **Enterprise support teams** that want AI-first triage and resolution
- **SaaS companies** handling high-volume customer queries
- **Product teams** prototyping multi-agent AI systems
- **Developers** studying LangGraph-based agent orchestration patterns

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker + Docker Compose

### 1. Start infrastructure

```bash
cd infra
docker compose up -d
```

This starts Postgres, Redis, Qdrant, MinIO, and Langfuse.

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in GROQ_API_KEY and other vars
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## Project Structure

```
Intelligent Support Engine/
├── backend/               # FastAPI + LangGraph agents
│   ├── app/
│   │   ├── agents/        # 10 specialized agent modules
│   │   ├── api/           # FastAPI route handlers
│   │   ├── db/models/     # SQLAlchemy ORM models
│   │   ├── orchestrator/  # LangGraph state graph
│   │   └── services/      # Redis, Qdrant, LLM clients
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/              # Next.js 14 + React + Tailwind
│   ├── src/app/           # Pages and components
│   └── package.json
├── infra/
│   └── docker-compose.yml # Full service stack
├── docs/
│   ├── APP_FLOW.md        # Request flow diagrams
│   ├── BACKEND_SCHEMA.md  # DB and API schema
│   ├── PRD.md             # Product requirements
│   └── TRD.md             # Technical design doc
└── tests/                 # Integration and agent tests
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/chat/stream` | SSE streaming chat with 10-agent metadata |
| POST | `/api/v1/chat/message` | Non-streaming chat fallback |
| GET | `/api/v1/chat/history/{session_id}` | Conversation turn history |
| POST | `/api/v1/auth/login` | JWT login |
| POST | `/api/v1/auth/register` | Register new account |
| POST | `/api/v1/auth/logout` | Revoke token |
| GET | `/api/v1/auth/me` | Current user profile |
| GET | `/api/v1/tickets` | List support tickets |
| POST | `/api/v1/tickets` | Create ticket |
| GET | `/api/v1/analytics` | FRT, resolution rate, latency metrics |

---

## UI Themes

Four built-in glassmorphic themes, selectable from the nav bar:
- **Indigo Electric** — high-contrast corporate dark
- **Emerald Care** — calming wellness green
- **Sunset Coral** — vibrant gradient
- **Sapphire Corporate** — premium enterprise blue

---

## Observability

- **Langfuse** (`http://localhost:3001`) — trace every agent call, LLM token usage, latency, and cost
- **Flower** — Celery task monitoring (when tasks are enabled)

---

## License

MIT — Copyright 2026 Intelligent Support Engine
