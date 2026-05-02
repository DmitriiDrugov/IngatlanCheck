# IngatlanCheck

**AI-assisted Hungarian real estate document checker for property buyers.**

Upload a tulajdoni lap PDF → pay once → receive a structured risk report in plain Hungarian — in minutes.

---

## What it does

Buying property in Hungary involves reviewing a **tulajdoni lap** (property title deed) — a legal document listing ownership history, encumbrances, mortgages, and restrictions. Most buyers can't parse it without a lawyer.

IngatlanCheck extracts the text from your PDF, sends it to Claude AI for analysis, and returns a structured report with color-coded flags:

- **Red** — serious issues (enforcement rights, litigation, liquidation)
- **Yellow** — items requiring attention (mortgages, usufruct rights, co-ownership)
- **Green** — positive signals (no encumbrances, clear ownership)

> Ez az elemzés tájékoztató jellegű, nem minősül jogi tanácsadásnak. Ingatlanvásárlás előtt mindig forduljon ügyvédhez.

---

## How it works

```
User uploads PDF
       │
       ▼
POST /api/upload
  Validate type + size → store in Supabase Storage → create report row
       │
       ▼
POST /api/checkout
  Create Stripe Checkout Session → redirect to Stripe
       │
       ▼
Stripe webhook (checkout.session.completed)
  Verify signature → idempotency check → mark report paid → queue analysis job
       │
       ▼
POST /api/analyze
  Fetch PDF → extract text (pdf-parse) → call Claude API
  → validate JSON output with Zod → generate signed access token
  → save report → send email with secure link
       │
       ▼
GET /report/[id]?token=[token]
  Verify token hash + expiry → render structured report
```

---

## Report structure

Each report contains:

- **Ingatlan adatok** — address, place number (helyrajzi szám), area, property type
- **Tulajdonosok** — owner names, ownership shares, acquisition dates and titles
- **Kockázati jelek** — categorized flags with evidence excerpts from the source document
- **Összefoglaló** — plain-Hungarian risk summary
- **Kockázati szint** — overall score: `low` / `medium` / `high` / `critical`

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Database | Supabase PostgreSQL |
| File storage | Supabase Storage (private bucket) |
| AI | Claude API (`claude-sonnet-4-20250514`) |
| Payments | Stripe Checkout + Webhooks |
| Email | Resend |
| Error tracking | Sentry |
| Hosting | Vercel |

---

## Security and privacy

- Reports require a **signed access token** (SHA-256 hashed, 7-day expiry) — UUID alone grants no access
- PDFs are stored in a **private Supabase Storage bucket** and deleted after 24 hours
- Extracted raw text is deleted after 24 hours
- Full report data is deleted after 30 days
- Stripe webhook signatures are verified on every event
- Webhook idempotency enforced via `stripe_events` table
- Sentry logs never contain raw document text
- Supabase service role key is never exposed to the client

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── upload/page.tsx           # PDF upload
│   ├── report/[id]/page.tsx      # Report view (token-gated)
│   ├── adatvedelem/page.tsx      # GDPR privacy policy
│   └── api/
│       ├── upload/route.ts       # PDF upload handler
│       ├── checkout/route.ts     # Stripe Checkout creation
│       ├── analyze/route.ts      # AI analysis pipeline
│       ├── webhook/stripe/       # Stripe webhook handler
│       └── report-access/        # Token verification
├── components/
│   ├── UploadDropzone.tsx
│   ├── ReportView.tsx
│   ├── FlagCard.tsx
│   ├── RiskBadge.tsx
│   └── Disclaimer.tsx
├── lib/
│   ├── analyzer.ts               # System prompt + AI response parsing
│   ├── validation.ts             # Zod schemas for AI output
│   ├── pdf.ts                    # PDF text extraction
│   ├── report-access.ts          # Token generation and verification
│   ├── types.ts                  # Shared TypeScript types
│   └── errors.ts                 # Structured error codes
└── config/
    ├── constants.ts
    └── ui-text.ts                # All Hungarian UI strings
```

---

## Local development

### Prerequisites

- Node.js 18+
- Supabase project with a private storage bucket
- Stripe account (test mode works)
- Anthropic API key
- Resend account

### 1. Clone and install

```bash
git clone https://github.com/dmitriidrugov/ingatlancheck.git
cd ingatlancheck
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude AI
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=ellenorzes@ingatlancheck.hu

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the database migration

Apply `supabase/migrations/001_initial.sql` in your Supabase SQL editor. This creates:

- `reports` — main report data with status tracking and token storage
- `stripe_events` — webhook idempotency
- `analysis_jobs` — async job queue with retry support

All tables have Row Level Security enabled.

### 4. Start the dev server

```bash
npm run dev
```

### 5. Forward Stripe webhooks locally

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

---

## Database schema (overview)

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending'   -- pending | payment_pending | paid | processing | completed | failed
  email TEXT,
  stripe_session_id TEXT UNIQUE,
  pdf_storage_path TEXT,
  raw_text TEXT,
  analysis JSONB,
  flags JSONB DEFAULT '[]'::jsonb,
  summary_hu TEXT,
  risk_score TEXT,                          -- low | medium | high | critical
  access_token_hash TEXT,
  access_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE stripe_events (               -- idempotency table
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analysis_jobs (               -- job queue with retry
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued',   -- queued | processing | completed | failed
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## AI analysis

The system prompt instructs Claude to:

1. Extract only information **explicitly present** in the document
2. Flag legal risks with **evidence excerpts** copied from the source text
3. Return a **strict JSON schema** — no markdown, no invented facts, missing values as `null`

All AI output is validated server-side with **Zod** before being saved. Invalid responses are rejected and the report is marked `failed` — never stored as-is.

---

## Pricing

**€14.99 per analysis** — one-time payment, no subscription, no account required.

---

## Legal

This product provides informational analysis only. It is not legal advice and does not substitute for a qualified lawyer reviewing the document.

---

## License

Private — all rights reserved.
