# Backend Schema — Intelligent Support Engine

**Version:** 0.1.0
**Last Updated:** 2026-08-07
**Database:** PostgreSQL 16

---

## 1. Entity Relationship Overview

```
User (1) ──── (N) Conversation (1) ──── (N) Message
User (1) ──── (N) Ticket
User (1) ──── (1) CustomerProfile (VIP, Membership)
User (1) ──── (N) SentimentLog
Conversation (1) ──── (N) SentimentLog
Conversation (1) ──── (0..1) Ticket
Conversation (1) ──── (0..1) Order (Mock)
User (1) ──── (N) Refund
Refund (1) ──── (0..1) Order
```

---

## 2. Tables

### 2.1 `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Internal user ID |
| `clerk_id` | VARCHAR(64) | UNIQUE, NOT NULL | Clerk user ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email |
| `name` | VARCHAR(128) | NULLABLE | Display name |
| `vip_status` | BOOLEAN | DEFAULT FALSE | VIP flag |
| `membership_tier` | VARCHAR(32) | NULLABLE | bronze/silver/gold/platinum |
| `preferred_language` | VARCHAR(8) | DEFAULT 'en' | ISO 639-1 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |  |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |  |

Indexes: `clerk_id`, `email`

### 2.2 `customer_profiles`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | UUID | PK, FK → users(id) |  |
| `lifetime_value` | DECIMAL(12,2) | DEFAULT 0 | LTV |
| `last_purchase_date` | DATE | NULLABLE |  |
| `purchase_count` | INTEGER | DEFAULT 0 |  |
| `preferences` | JSONB | DEFAULT '{}' | e.g., {"theme": "dark"} |
| `notes` | TEXT | NULLABLE |  |

### 2.3 `conversations`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK |  |
| `user_id` | UUID | FK → users(id), NOT NULL |  |
| `channel` | VARCHAR(16) | NOT NULL | web/email/whatsapp |
| `status` | VARCHAR(16) | DEFAULT 'active' | active/resolved/escalated/closed |
| `language` | VARCHAR(8) | DEFAULT 'en' |  |
| `started_at` | TIMESTAMPTZ | DEFAULT NOW() |  |
| `ended_at` | TIMESTAMPTZ | NULLABLE |  |
| `assigned_human_id` | UUID | NULLABLE | (future) |
| `metadata` | JSONB | DEFAULT '{}' |  |

Indexes: `user_id`, `status`, `started_at DESC`

### 2.4 `messages`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK |  |
| `conversation_id` | UUID | FK → conversations(id), NOT NULL |  |
| `role` | VARCHAR(16) | NOT NULL | user/assistant/system/tool |
| `content` | TEXT | NOT NULL |  |
| `tool_calls` | JSONB | NULLABLE | Array of tool invocations |
| `tool_results` | JSONB | NULLABLE |  |
| `token_count` | INTEGER | NULLABLE |  |
| `latency_ms` | INTEGER | NULLABLE | LLM latency |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |  |

Indexes: `conversation_id`, `created_at`

### 2.5 `tickets`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK |  |
| `ticket_number` | VARCHAR(32) | UNIQUE, NOT NULL | e.g., TIX-0001 |
| `conversation_id` | UUID | FK → conversations(id), NOT NULL |  |
| `user_id` | UUID | FK → users(id), NOT NULL |  |
| `subject` | VARCHAR(255) | NOT NULL |  |
| `description` | TEXT | NOT NULL |  |
| `priority` | VARCHAR(16) | DEFAULT 'medium' | low/medium/high/urgent |
| `status` | VARCHAR(16) | DEFAULT 'open' | open/in_progress/resolved/closed |
| `category` | VARCHAR(64) | NULLABLE | refund/tech/billing/etc |
| `assigned_agent_id` | UUID | NULLABLE |  |
| `sla_deadline` | TIMESTAMPTZ | NULLABLE |  |
| `ai_summary` | TEXT | NULLABLE |  |
| `ai_confidence` | DECIMAL(3,2) | NULLABLE | 0.00 - 1.00 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |  |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |  |

Indexes: `conversation_id`, `user_id`, `status`, `ticket_number`

### 2.6 `orders` (mock for MVP)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK |  |
| `user_id` | UUID | FK → users(id), NOT NULL |  |
| `order_number` | VARCHAR(32) | UNIQUE, NOT NULL |  |
| `total_amount` | DECIMAL(12,2) | NOT NULL |  |
| `status` | VARCHAR(32) | NOT NULL | pending/shipped/delivered/cancelled |
| `items` | JSONB | NOT NULL | Array of {sku, qty, price, name} |
| `ordered_at` | TIMESTAMPTZ | NOT NULL |  |
| `delivered_at` | TIMESTAMPTZ | NULLABLE |  |

### 2.7 `refunds`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK |  |
| `order_id` | UUID | FK → orders(id), NOT NULL |  |
| `user_id` | UUID | FK → users(id), NOT NULL |  |
| `amount` | DECIMAL(12,2) | NOT NULL |  |
| `reason` | TEXT | NOT NULL |  |
| `status` | VARCHAR(32) | DEFAULT 'pending' | pending/approved/rejected/processed |
| `evidence_url` | VARCHAR(512) | NULLABLE | Photo/PDF URL |
| `approved_by` | UUID | NULLABLE | user_id of approver (AI or human) |
| `processed_at` | TIMESTAMPTZ | NULLABLE |  |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |  |

### 2.8 `sentiment_logs`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK |  |
| `conversation_id` | UUID | FK → conversations(id), NOT NULL |  |
| `message_id` | UUID | FK → messages(id), NULLABLE |  |
| `score` | DECIMAL(4,2) | NOT NULL | -1.00 to 1.00 |
| `label` | VARCHAR(16) | NOT NULL | happy/neutral/frustrated/angry |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |  |

### 2.9 `csat_responses`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK |  |
| `conversation_id` | UUID | FK → conversations(id), UNIQUE |  |
| `score` | INTEGER | NOT NULL | 1-5 |
| `feedback_text` | TEXT | NULLABLE |  |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |  |

### 2.10 `knowledge_documents`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK |  |
| `title` | VARCHAR(255) | NOT NULL |  |
| `source_url` | VARCHAR(512) | NULLABLE |  |
| `source_type` | VARCHAR(32) | NOT NULL | pdf/doc/web/faq |
| `chunk_count` | INTEGER | DEFAULT 0 |  |
| `qdrant_collection` | VARCHAR(64) | DEFAULT 'kb_docs' |  |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |  |

---

## 3. Vector Collections (Qdrant)

### 3.1 `kb_docs`
- **Purpose:** Knowledge base, FAQs, docs, PDFs.
- **Vector size:** 768 (using BGE-small or text-embedding-3-small).
- **Distance:** Cosine.
- **Payload schema:**
  - `document_id` (UUID)
  - `chunk_index` (int)
  - `text` (string)
  - `source_url` (string)
  - `page` (int)

### 3.2 `user_memory` (future)
- **Purpose:** Long-term facts per user (e.g., "owns 2023 Macbook Air").
- **Vector size:** 768
- **Payload:** `user_id`, `fact_text`, `created_at`

---

## 4. Redis Keys

| Key Pattern | Type | TTL | Purpose |
|---|---|---|---|
| `chat:rate:{user_id}` | string | 60s | Rate-limit counter |
| `chat:stream:{conversation_id}` | stream | 1h | Live SSE stream buffer |
| `celery:queue:*` | list | — | Task queues |
| `session:{user_id}` | hash | 24h | Lightweight session state |
| `cache:profile:{user_id}` | string | 5m | Cached CRM profile |

---

## 5. SQLAlchemy Models (Python mapping)

The backend will use SQLAlchemy 2.0 (async) with the following file structure:
```
backend/app/db/models/
  __init__.py
  base.py          # DeclarativeBase
  user.py
  conversation.py
  message.py
  ticket.py
  order.py
  refund.py
  sentiment.py
  csat.py
  knowledge.py
```

Each model file will define:
- Table name (lowercase + snake_case)
- Columns (with types matching schema above)
- Relationships (via `relationship()` + `back_populates`)
- Indexes (via `__table_args__`)

---

## 6. Migration Strategy

- **Tool:** Alembic.
- **Workflow:** Generate migration → Review SQL → Apply locally → Apply to staging.
- **Initial migration:** Create all tables above.

```bash
alembic init alembic
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

---

## 7. Seed Data (for MVP)

- 3 sample users (1 VIP, 2 regular).
- 5 sample orders per user.
- 10 sample knowledge documents.
- 1 admin user (human agent).

---

## 8. Privacy & Retention

- **PII encryption at rest:** Postgres TDE optional; sensitive fields (email, name) AES-256 encrypted.
- **Log redaction:** LLM prompts scrubbed of PII before logging.
- **Retention:** Conversations retained 90 days, then anonymized. Tickets retained 1 year.
- **GDPR:** User deletion endpoint that purges conversations, messages, tickets, while keeping anonymized analytics.
