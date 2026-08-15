# Development Rules — Intelligent Support Engine

**Created:** 2026-08-07
**Version:** 0.1.0

---

## 1. Architecture Rules

### 1.1 Agent Communication
- All agents communicate via the **Planning Agent** (LangGraph workflow).
- Agents MUST NOT talk directly to each other; they publish to and consume from the shared `AgentState`.
- Every agent invocation is traced via Langfuse.

### 1.2 State Management
- The `AgentState` (TypedDict) is the single source of truth for the workflow.
- Agents MUST NOT maintain hidden state; everything flows through the state dict.
- State schema is defined in `backend/app/orchestrator/state.py`.

### 1.3 Tool Calling
- Tools are functions that agents can call via the LLM.
- Every tool call is logged with: tool name, parameters, result, timestamp.
- Tools MUST return structured data (dict or Pydantic model), not raw strings.

### 1.4 Error Handling
- Each agent has a `try/except` block.
- On error, agents log the error and return a fallback response.
- Critical failures (database down, LLM timeout) trigger immediate escalation.

---

## 2. Code Organization Rules

### 2.1 Backend
```
backend/app/
├── agents/          # One file per agent (base.py + one per agent)
├── db/models/       # One file per model
├── orchestrator/    # LangGraph workflow
├── services/        # External services (LLM, email, qdrant)
└── api/             # FastAPI routes
```

### 2.2 Frontend
```
frontend/src/
├── app/             # Next.js App Router pages
├── components/      # React components (organized by feature)
├── hooks/           # Custom hooks
├── lib/             # Utilities, API clients
└── types/           # TypeScript types
```

### 2.3 Naming Conventions
- **Python:** `snake_case` for functions/variables, `PascalCase` for classes
- **TypeScript:** `camelCase` for variables/functions, `PascalCase` for components/types
- **Files:** `kebab-case` for all files
- **Components:** PascalCase with descriptive names (e.g., `ChatWindow`, `MessageBubble`)

---

## 3. API Rules

### 3.1 REST Endpoints
- Base URL: `/api/v1/`
- Use standard HTTP methods: GET, POST, PUT, PATCH, DELETE
- Return JSON with consistent shape:
```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": { "page": 1, "limit": 20 }
}
```

### 3.2 Authentication
- All endpoints except `/health` and `/api/v1/auth/*` require Clerk JWT.
- Verify JWT in FastAPI middleware (`verify_auth`).
- Return 401 for invalid/missing tokens.

### 3.3 Rate Limiting
- 10 messages per minute per user (Redis-based).
- Return 429 with `Retry-After` header when exceeded.

---

## 4. LLM Usage Rules

### 4.1 Model Selection
- **Primary:** `groq/llama-3.3-70b-versatile` (complex reasoning, response generation)
- **Fast:** `groq/llama-3.1-8b-instant` (intent classification, sentiment analysis)
- **Fallback:** If Groq is rate-limited, switch to smaller model with exponential backoff.

### 4.2 Prompt Engineering
- Every agent has a clear system prompt in its own file.
- Use few-shot examples for classification tasks.
- Always include: role, task, output format, constraints.

### 4.3 Streaming
- All chat responses MUST stream (SSE on backend, `createStreamResponse` on frontend).
- First token must arrive within 800ms (p95).
- Show typing indicator immediately on message receive.

### 4.4 Cost Tracking
- Log token counts for every LLM call.
- Calculate cost per conversation.
- Alert if cost per conversation exceeds $0.05.

---

## 5. Database Rules

### 5.1 SQL Alchemy
- Use async session (`async_sessionmaker`).
- All queries must be awaited.
- Use relationship loading strategies (`joinedload`, `selectinload`).

### 5.2 Migrations
- All schema changes go through Alembic.
- Never edit the schema manually.
- Test migrations on fresh database before applying.

### 5.3 Data Retention
- Conversations: 90 days retention, then anonymized.
- Tickets: 1 year retention.
- PII: Never log in LLM prompts or traces.

---

## 6. Security Rules

### 6.1 Secrets
- NEVER commit `.env` files.
- Use `.env.example` to document required variables.
- Rotate API keys every 90 days.

### 6.2 Input Validation
- All user input validated with Pydantic models.
- Sanitize file uploads (MIME type, size limit: 10MB).
- Reject SQL injection patterns (handled by ORM).

### 6.3 Output Security
- Sanitize HTML in messages (prevent XSS).
- Redact PII in logs and traces.
- Enforce CORS (allow only `http://localhost:3000` in dev).

---

## 7. Testing Rules

### 7.1 Unit Tests
- Every agent must have unit tests (pytest).
- Mock LLM calls in unit tests (use `unittest.mock`).
- Target: 80%+ code coverage on backend.

### 7.2 Integration Tests
- Test each agent workflow end-to-end.
- Use test database (separate Postgres database).
- Seed data before each test.

### 7.3 E2E Tests
- Use Playwright for frontend tests.
- Test critical user journeys:
  - Refund request flow
  - Escalation flow
  - Login flow

---

## 8. Git Rules

### 8.1 Branching
- `main`: Production-ready code.
- `develop`: Integration branch.
- Feature branches: `feature/<name>` (e.g., `feature/refund-agent`).

### 8.2 Commits
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Squash merge feature branches to main.
- NEVER force push to main.

### 8.3 PRs
- Every change requires a PR.
- PR must pass all checks (tests, lint, type check).
- At least one reviewer required.

---

## 9. Performance Rules

### 9.1 Latency Targets
- First token: < 800ms
- Full response: < 3s
- API response: < 200ms (excluding LLM)

### 9.2 Caching
- Cache CRM profiles for 5 minutes.
- Cache knowledge chunks after first query.
- Use Redis for all caches.

### 9.3 Concurrency
- FastAPI handles async requests.
- Celery for long-running tasks (email sending, PDF processing).
- Max 100 concurrent WebSocket connections.

---

## 10. Documentation Rules

### 10.1 Code Comments
- Comment non-obvious logic (why, not what).
- Use docstrings for public functions/classes.
- No commented-out code in production.

### 10.2 API Docs
- Auto-generate from FastAPI decorators.
- Keep OpenAPI schema updated.
- Document all error responses.

### 10.3 README
- Include: overview, features, quickstart, API docs link, troubleshooting.
- Update README on every breaking change.

---

## 11. Debugging Rules

### 11.1 Logging
- Use `structlog` for structured logging.
- Log levels: DEBUG (dev), INFO (prod), WARNING, ERROR.
- Include: request ID, user ID, timestamp, agent name.

### 11.2 Tracing
- Every LLM call traced in Langfuse.
- Every tool call logged with parameters/results.
- Every agent transition logged.

### 11.3 Error Reporting
- Catch all unhandled exceptions.
- Log full stack trace.
- Send alert to Slack (future) on critical errors.

---

## 12. MVP Scope Rules

### 12.1 In Scope
- Web chat channel
- Email channel
- 10 agents (all implemented)
- Clerk auth
- Docker Compose local dev

### 12.2 Out of Scope (MVP)
- WhatsApp, Voice, Slack live integrations
- Real CRM/payment gateway integrations
- Production deployment (Kubernetes, CI/CD)
- Multi-region deployment

### 12.3 Deferred to Future
- Voice conversations
- Proactive outbound notifications
- Customer self-service portal
- Agent-to-agent billing

---

## 13. Quality Gates

### Before Merging to Develop
- [ ] All tests passing
- [ ] No lint errors
- [ ] Type checking passes (`tsc --noEmit`, `mypy`)
- [ ] Documentation updated
- [ ] No hardcoded secrets

### Before Merging to Main
- [ ] All integration tests passing
- [ ] End-to-end flows verified
- [ ] Performance benchmarks acceptable
- [ ] Security review completed
- [ ] README updated

---

## 14. Emergency Procedures

### 14.1 LLM Service Down
- Enable fallback to smaller model.
- Show maintenance message to users.
- Queue requests for retry (max 3 attempts).

### 14.2 Database Down
- Stop accepting new requests.
- Show "Service Unavailable" page.
- Alert on-call engineer.

### 14.3 Escalation Flood
- Rate limit escalations per minute.
- Queue escalations for retry.
- Notify human agent team via email.

---

**Review these rules at the start of every development session. When in doubt, consult this document first.**
