# Product Requirements Document — Intelligent Support Engine

**Project:** Intelligent Support Engine (ISE)
**Version:** 0.1.0 (PRD v1)
**Status:** Draft for MVP
**Last Updated:** 2026-08-07
**Owner:** Hamza

---

## 1. Vision

A customer-facing support surface that feels like one highly capable assistant, but is in fact a coordinated team of 10+ specialized AI agents working together. The customer should never see the seams — they should feel heard, understood, and resolved in as few turns as possible.

The platform is designed for B2C companies that handle high-volume, repetitive support (refunds, account access, shipping, tech troubleshooting) but also receive emotionally charged, complex issues that need human judgment.

## 2. Problem Statement

Most support automation today is brittle:

- **Single-LLM chatbots** hallucinate on policy details, can't take real actions, and frustrate users with loops.
- **Rule-based deflection** ("press 1 for...") drops customers who actually need help.
- **Routing playbooks** hand customers to humans for things AI could solve — humans then drown in tickets.

We need a system that:

1. Converses naturally across languages.
2. Remembers context across sessions.
3. Actually executes actions (refunds, ticket creation, escalations).
4. Knows when to stop and hand off — without making the customer re-explain.
5. Improves from every resolved ticket.

## 3. Target Users

### 3.1 Primary — End Customers
- Buyers needing refunds, order tracking, account help, technical troubleshooting.
- Multilingual; expect responses in their language.
- Mixed technical literacy — the UI must work for a 70-year-old and a 25-year-old power user.

### 3.2 Secondary — Support Agents / Human Team
- Receive escalated, AI-summarized conversations.
- Need a dashboard with: full transcript, customer profile, suggested actions, prior tickets, sentiment history.
- Should not have to re-read raw AI reasoning to understand what happened.

### 3.3 Tertiary — Operations / CX Leaders
- See analytics: FRT, resolution time, CSAT, refund rate, escalation rate, AI accuracy.
- Want confidence that the system is improving, not regressing.

## 4. Core Value Propositions

1. **Single conversation, infinite expertise.** The customer never hears "let me transfer you to billing." The agents coordinate silently.
2. **Real actions, not just talk.** Refunds, ticket creation, CRM updates, escalations — all happen in the same turn.
3. **Persistent memory.** "I still have the same laptop issue." → system knows exactly which laptop, which warranty, which fixes, which engineer.
4. **Tone-aware.** Sentiment shifts the AI's tone, the escalation threshold, and the response cadence.
5. **Self-improving.** Resolved tickets feed the knowledge base; low-confidence responses get reviewed and patched.

## 5. Scope

### 5.1 In Scope (MVP)

| Capability | Detail |
|---|---|
| **Channels** | Web chat (primary), Email (SendGrid/Resend inbound + outbound) |
| **Auth** | Clerk for customer identity (sign-in via email, Google, magic link) |
| **Languages** | English, Spanish, French, German, Arabic, Hindi (detected, not asked) |
| **Agents** | Conversation, Intent, Memory, Sentiment, Knowledge (RAG), Ticket, CRM (mocked), Refund (mocked), Escalation, Analytics |
| **Tools** | RAG over docs/FAQs/PDFs, ticket CRUD, mock refund flow, mock CRM lookup |
| **Orchestration** | LangGraph with explicit state machine; A2A over an internal message bus |
| **Observability** | Langfuse for LLM traces; structured logs for workflow events |
| **Local infra** | Docker Compose: Postgres, Redis, Qdrant, MinIO |

### 5.2 Out of Scope (MVP)

- WhatsApp / Voice / Slack live integrations (stubs only).
- Real CRM integrations (HubSpot/Salesforce/Zoho) — backend ready, mocks return synthetic data.
- Real payment gateway (Stripe) — Refund Agent operates on a mock gateway.
- Production-grade auth (Clerk works for dev; production needs SAML/SSO hooks).
- Mobile native apps.
- Billing/subscription management for the ISE itself (i.e., this is a product, not a platform).

### 5.3 Future

- Voice via LiveKit + ElevenLabs.
- WhatsApp via Twilio.
- Real CRM/payment integrations.
- Customer-side voice/video handoff to human.
- Proactive outbound (notify customer before they ask).

## 6. User Stories

### 6.1 Customer Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| C1 | Customer | Describe a problem in my native language | I don't have to translate to get help |
| C2 | Customer | Be remembered when I return | I don't have to re-explain my laptop issue |
| C3 | Customer | Get a refund without chatting with a human | My issue is resolved quickly |
| C4 | Customer | Know my issue is being taken seriously | I trust the system even if I don't get a human |
| C5 | Customer | Upload a photo or PDF of an error | The AI can see what I see |
| C6 | Customer | Get escalated to a human when I need one | My complex issue gets real attention |
| C7 | Customer | See a clear summary of what happened | I know what was done and what's next |

### 6.2 Support Agent Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| A1 | Support agent | See the full conversation + AI summary | I can pick up without asking the customer to repeat |
| A2 | Support agent | See customer profile, past tickets, sentiment | I have context |
| A3 | Support agent | See AI's suggested next action | I can respond faster |
| A4 | Support agent | Mark resolution outcome | The system learns from what worked |

### 6.3 Operations Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| O1 | CX leader | See real-time resolution metrics | I can spot problems early |
| O2 | CX leader | See AI confidence per resolution | I know where the system is weak |
| O3 | CX leader | See knowledge base gaps | I can prioritize documentation |

## 7. Success Metrics

### 7.1 MVP Success (must hit before call it a v1)

- **Containment rate:** ≥ 60% of conversations resolved without human escalation.
- **Resolution time (AI):** median < 90s for simple intents (refund, password reset, status).
- **CSAT:** ≥ 4.0 / 5.0 on AI-resolved conversations.
- **Escalation quality:** ≥ 90% of escalations are reviewed and resolved by a human in < 12h.
- **Customer re-contact rate:** < 15% within 7 days for the same issue.

### 7.2 Stretch

- Containment ≥ 75%.
- Median resolution time < 60s.
- CSAT ≥ 4.5.
- AI accuracy (post-hoc review) ≥ 85%.

### 7.3 Anti-metrics (things we must not regress)

- Customer effort score (must improve).
- Time to first response (must stay < 5s).
- Hallucination rate on policy answers (must stay < 2%).

## 8. Non-Functional Requirements

- **Latency:** first token < 800ms p95 on web chat.
- **Availability:** 99.5% for MVP (single region, single instance acceptable).
- **Privacy:** PII redacted from LLM logs; customer data encrypted at rest.
- **Observability:** every agent decision is traced; every tool call is recorded.
- **Cost:** ≤ $0.05 per resolved conversation (LLM + infra) on Groq Llama 3.3 70B.
- **Security:** OWASP ASVS L1 baseline; no secrets in logs; rate-limited endpoints.

## 9. Dependencies & Risks

| Risk | Impact | Mitigation |
|---|---|---|
| LLM hallucination on policy | High | RAG-grounded answers; refusals when doc confidence low; human review sampling |
| Multi-agent coordination bugs | High | LangGraph state machine with explicit tests; dead-letter queue for stuck workflows |
| Vendor lock-in (Groq, Clerk) | Medium | LiteLLM abstraction; can swap providers without code changes |
| LangGraph learning curve | Medium | Vertical-slice prototype first; clear schema contracts |
| Over-scope creep | High | Strict MVP cut; future work tracked but not started |

## 10. Open Questions

1. Do we need SSO for the human-support dashboard in MVP? (No — defer.)
2. Will we self-host the Langfuse server or use cloud? (Self-host via Docker.)
3. Do customers need account creation, or can they chat as guests? (MVP: required for memory; guests get a "your chat won't be saved" warning.)

## 11. Glossary

- **Agent** — a unit of decision-making with a specific role; can call LLMs and tools.
- **Conversation** — a single thread of customer messages, owned by the Conversation Agent.
- **Workflow** — a graph of agent invocations triggered by a Conversation, with shared state.
- **Escalation** — decision to hand the conversation to a human agent, with full context.
- **Containment** — % of conversations that end without an escalation.
- **CSAT** — customer satisfaction score, collected post-conversation.
