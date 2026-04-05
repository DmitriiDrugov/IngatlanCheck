# CLAUDE.md — IngatlanCheck

## Role

You are the lead full-stack engineer for **IngatlanCheck** — an AI-assisted Hungarian real estate document checker for property buyers.

Your job is to build a **production-ready MVP** that is:
- reliable,
- privacy-conscious,
- operationally simple,
- fast to ship,
- easy to maintain.

You write clean, production-grade TypeScript.
You prefer pragmatic solutions over over-engineering.
You optimize for correctness on critical flows: upload, payment, analysis, report delivery.

---

## Product summary

**What it does:**
A user uploads a Hungarian **tulajdoni lap** PDF → pays once → the system extracts text → AI analyzes the document for possible legal and transactional risks → the user receives a structured report in plain Hungarian.

**Who it is for:**
Individuals buying property in Hungary who want a quick preliminary document check before hiring a lawyer.

**Business model:**
- One-time payment per report (€14.99 via Stripe)
- No subscriptions
- No free tier in MVP

**Legal limitation:**
This product does **not** provide legal advice.

Every report and all relevant UI surfaces must show this disclaimer exactly:

> Ez az elemzés tájékoztató jellegű, nem minősül jogi tanácsadásnak. Ingatlanvásárlás előtt mindig forduljon ügyvédhez.

---

## Product principles

Always optimize for:
1. **Trustworthiness** — never fabricate missing legal facts
2. **Privacy** — minimize storage of sensitive document content
3. **Clarity** — the report must be understandable for a non-lawyer
4. **Evidence** — every flagged issue must be tied to actual document text
5. **MVP discipline** — do not build unnecessary platform features

---

## MVP scope

### Must have
- Landing page in Hungarian
- PDF upload (drag & drop + file picker)
- One-time payment via Stripe Checkout
- PDF text extraction
- AI analysis with structured JSON output
- Zod-validated AI output before saving
- Structured web report with red/yellow/green flags
- Secure report access via signed token (not UUID alone)
- Email delivery with secure report link via Resend
- Legal disclaimer visible on every report
- Error handling with Hungarian user-facing messages
- Sentry error tracking with sensitive data redacted
- GDPR-compliant adatvédelmi tájékoztató page

### Must not have
- No user dashboard
- No account system in MVP
- No subscription billing
- No admin panel
- No mobile app (responsive web is enough)
- No multi-language support (Hungarian only)
- No PDF export of reports
- No comparison of multiple properties
- No vector database / semantic search
- No "AI chat with the report"
- No Pinecone integration

---

## Tech stack

### Core (required for MVP)

| Layer | Tool | Cost |
|---|---|---|
| Framework | Next.js 14+ (App Router) | — |
| Language | TypeScript (strict mode) | — |
| Hosting | Vercel | Free |
| Database | Supabase PostgreSQL | Free |
| File storage | Supabase Storage (private bucket) | Free |
| AI | Claude API (`claude-sonnet-4-20250514`) | ~$20/mo |
| Payments | Stripe Checkout + Webhooks | 2.9%/tx |
| Email | Resend | Free |
| Error tracking | Sentry | Free |
| DNS/CDN | Cloudflare | Free |
| Domain | Namecheap (.hu) | $12/yr |
| Version control | GitHub | Free |

### Optional (add only when needed)

| Tool | Purpose | When to add |
|---|---|---|
| Upstash Redis | Rate limiting uploads | When abuse is observed |
| PostHog | Analytics / conversion funnel | After launch |
| Clerk | Auth / user accounts | Only if product direction requires it |

---

## Project structure

```text
ingatlancheck/
├── CLAUDE.md
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   └── og-image.png
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, metadata, Sentry init
│   │   ├── page.tsx                # Landing page
│   │   ├── upload/
│   │   │   └── page.tsx            # Upload page
│   │   ├── report/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Report display page
│   │   ├── adatvedelem/
│   │   │   └── page.tsx            # GDPR privacy policy page
│   │   ├── api/
│   │   │   ├── upload/
│   │   │   │   └── route.ts        # PDF upload → Supabase Storage
│   │   │   ├── checkout/
│   │   │   │   └── route.ts        # Create Stripe Checkout Session
│   │   │   ├── analyze/
│   │   │   │   └── route.ts        # Extract text → Claude → validate → save
│   │   │   ├── webhook/
│   │   │   │   └── stripe/
│   │   │   │       └── route.ts    # Stripe webhook handler
│   │   │   └── report-access/
│   │   │       └── route.ts        # Token-based report access verification
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # Reusable primitives
│   │   ├── UploadDropzone.tsx
│   │   ├── ReportView.tsx
│   │   ├── FlagCard.tsx
│   │   ├── PricingCard.tsx
│   │   └── Disclaimer.tsx
│   ├── lib/
│   │   ├── supabase.ts             # Supabase clients (server + browser)
│   │   ├── stripe.ts               # Stripe client + helpers
│   │   ├── resend.ts               # Resend email client
│   │   ├── pdf.ts                  # PDF text extraction (pdf-parse)
│   │   ├── ai.ts                   # Claude API wrapper
│   │   ├── analyzer.ts             # System prompt + user prompt + response parser
│   │   ├── validation.ts           # Zod schemas for AI output validation
│   │   ├── report-access.ts        # Token generation, hashing, verification
│   │   ├── errors.ts               # Error codes and structured error handling
│   │   └── types.ts                # All shared TypeScript types
│   └── config/
│       ├── constants.ts            # App-wide constants
│       └── ui-text.ts              # All Hungarian UI strings
└── supabase/
    └── migrations/
        └── 001_initial.sql         # Database schema
```

---

## Database schema

```sql
-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'payment_pending', 'paid', 'processing', 'completed', 'failed')),
  email TEXT,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  pdf_storage_path TEXT,
  pdf_uploaded_at TIMESTAMPTZ,
  pdf_deleted_at TIMESTAMPTZ,
  raw_text TEXT,
  raw_text_deleted_at TIMESTAMPTZ,
  analysis JSONB,
  flags JSONB DEFAULT '[]'::jsonb,
  summary_hu TEXT,
  risk_score TEXT CHECK (risk_score IN ('low', 'medium', 'high', 'critical')),
  access_token_hash TEXT,
  access_token_expires_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_reports_email ON reports(email);
CREATE INDEX idx_reports_stripe_session_id ON reports(stripe_session_id);

-- Stripe webhook idempotency
CREATE TABLE stripe_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analysis job queue with retry support
CREATE TABLE analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: do not expose unrestricted public read access
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;
```

---

## Core types

```typescript
// src/lib/types.ts

export type ReportStatus =
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'failed';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type FlagSeverity = 'red' | 'yellow' | 'green';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface Owner {
  name: string | null;
  ownership_share: string | null;
  acquisition_date: string | null;
  acquisition_title: string | null;
}

export interface PropertyInfo {
  cim: string | null;
  helyrajzi_szam: string | null;
  terulet: string | null;
  megnevezes: string | null;
}

export interface AnalysisFlag {
  severity: FlagSeverity;
  category: string;
  title_hu: string;
  description_hu: string;
  evidence_excerpt: string;
  source_section: string | null;
  confidence: ConfidenceLevel;
  recommendation_hu: string;
}

export interface AnalysisResult {
  document_quality: {
    readable: boolean;
    notes_hu: string | null;
  };
  ingatlan: PropertyInfo;
  tulajdonosok: Owner[];
  flags: AnalysisFlag[];
  risk_score: RiskLevel;
  summary_hu: string;
}

export interface Report {
  id: string;
  status: ReportStatus;
  email: string | null;
  analysis: AnalysisResult | null;
  flags: AnalysisFlag[];
  risk_score: RiskLevel | null;
  summary_hu: string | null;
  created_at: string;
  completed_at: string | null;
  error_code: string | null;
}

// API response shape (all routes use this)
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

---

## AI analysis prompt

```typescript
// src/lib/analyzer.ts

export const SYSTEM_PROMPT = `
You analyze extracted text from a Hungarian property title deed ("tulajdoni lap").

Your task:
1. Extract only the information explicitly present in the text
2. Identify possible legal and transactional risks mentioned in the document
3. Return valid JSON that matches the required schema exactly

Strict rules:
- Return valid JSON only. No markdown. No text outside the JSON object.
- All user-facing strings must be in Hungarian
- Do not guess missing values; use null instead
- Do not give legal advice
- Every flag must include an evidence_excerpt copied from the source text
- Do not create a flag without textual support
- If extraction quality is poor or sections are missing, add a yellow flag describing the limitation
- Keep all descriptions concise, factual, and understandable for a non-lawyer

Risk guidance:

Red flags (severity: "red"):
- Végrehajtási jog
- Perrel kapcsolatos feljegyzés
- Felszámolás / csődeljárás
- Kisajátítási eljárás
- Elidegenítési és terhelési tilalom — when clearly problematic and not routine bank collateral context

Yellow flags (severity: "yellow"):
- Jelzálogjog
- Haszonélvezeti jog
- Elővásárlási jog
- Szolgalmi jog
- Széljegy (pending annotation)
- Közös tulajdon (co-ownership)
- Unclear ownership data
- Missing or unreadable sections
- Any document quality issue that reduces confidence

Green flags (severity: "green"):
- Tehermentes (no encumbrances)
- Egyértelmű tulajdonosi viszonyok (clear ownership)
- No visible encumbrances in extracted text

Set risk_score based on the combined practical seriousness of the findings.

Required JSON schema:
{
  "document_quality": {
    "readable": boolean,
    "notes_hu": string | null
  },
  "ingatlan": {
    "cim": string | null,
    "helyrajzi_szam": string | null,
    "terulet": string | null,
    "megnevezes": string | null
  },
  "tulajdonosok": [
    {
      "name": string | null,
      "ownership_share": string | null,
      "acquisition_date": string | null,
      "acquisition_title": string | null
    }
  ],
  "flags": [
    {
      "severity": "red" | "yellow" | "green",
      "category": string,
      "title_hu": string,
      "description_hu": string,
      "evidence_excerpt": string,
      "source_section": string | null,
      "confidence": "low" | "medium" | "high",
      "recommendation_hu": string
    }
  ],
  "risk_score": "low" | "medium" | "high" | "critical",
  "summary_hu": string
}
`;

export const createUserPrompt = (text: string) =>
  `Elemezd az alábbi tulajdoni lap szövegét a megadott JSON séma szerint:\n\n${text}`;
```

---

## AI output validation

Never trust raw model output. Server-side requirements:

1. Parse JSON safely (try/catch, not raw JSON.parse without error handling)
2. Validate with Zod schema matching `AnalysisResult`
3. Reject schema-invalid responses — mark report as `failed`
4. Truncate overly long `evidence_excerpt` fields (max 500 chars)
5. Normalize empty strings to `null` where appropriate
6. Generate internal flag IDs on the server (do not rely on AI-generated IDs)
7. Store only validated output

If validation fails:
- Mark report as `failed` with error_code `AI_OUTPUT_INVALID`
- Log sanitized error details to Sentry (no raw document text)
- Never save malformed AI content as final analysis

---

## Core workflows

### 1. Upload — `POST /api/upload`

**Input:** PDF file, optional email

**Process:**
1. Validate MIME type (`application/pdf` only) and file size (max 10MB)
2. Reject suspicious files early
3. Generate report UUID
4. Upload PDF to Supabase Storage private bucket: `reports/{id}/original.pdf`
5. Never trust client-provided filename — use generated path
6. Create report row: `status='payment_pending'`, `pdf_uploaded_at=now()`
7. Return `{ reportId }`

### 2. Checkout — `POST /api/checkout`

**Input:** `{ reportId }`

**Process:**
1. Verify report exists and `status='payment_pending'`
2. Create Stripe Checkout Session with metadata: `{ reportId }`
3. Save `stripe_session_id` on report
4. Return `{ checkoutUrl }`

**Important:** Success URL must not expose report access by itself. Payment success does not automatically authorize report access without a secure token.

### 3. Stripe Webhook — `POST /api/webhook/stripe`

**Event:** `checkout.session.completed`

**Process:**
1. Verify Stripe signature with `stripe.webhooks.constructEvent()`
2. Check idempotency: if `event.id` exists in `stripe_events`, skip
3. Insert event into `stripe_events`
4. Extract `reportId` from session metadata
5. Update report: `status='paid'`, save `stripe_payment_intent`
6. Create row in `analysis_jobs`: `status='queued'`
7. Trigger analysis (call analyze route or process inline)

**Webhook must be idempotent.** Stripe may deliver the same event multiple times.

### 4. Analyze — `POST /api/analyze`

**Input:** `{ reportId }`

**Process:**
1. Load report and verify `status='paid'`
2. Load analysis job and verify `status='queued'` or retry eligible
3. Update report: `status='processing'`
4. Update job: `status='processing'`, increment `attempts`
5. Fetch PDF from Supabase Storage private bucket
6. Extract text with pdf-parse
7. Save `raw_text` temporarily on report
8. Call Claude API with `SYSTEM_PROMPT` + `createUserPrompt(text)`
9. Parse and validate AI JSON response with Zod
10. On valid response:
    - Generate secure access token (crypto random, 64 chars)
    - Hash token with SHA-256 before storing
    - Set `access_token_expires_at` (7 days from now)
    - Save validated `analysis`, `flags`, `risk_score`, `summary_hu`
    - Update report: `status='completed'`, `completed_at=now()`
    - Update job: `status='completed'`
    - Send email via Resend with secure report link: `/report/{id}?token={token}`
    - Schedule PDF deletion (24h)
    - Schedule raw_text deletion (24h)
11. On failure:
    - Update report: `status='failed'`, `error_code`, sanitized `error_message`
    - Update job: `status='failed'`, `last_error`
    - Log to Sentry (no raw document text in payload)

---

## Report access model

Do not rely on UUID alone for access control.

**MVP approach:**
- Report ID in URL path: `/report/{id}`
- Signed access token in query param: `?token={token}`
- Token stored as SHA-256 hash in `access_token_hash`
- Token expiration enforced server-side via `access_token_expires_at`
- On access: hash the provided token, compare with stored hash, check expiry
- Reject expired or invalid tokens with a clear Hungarian error message

Do not expose unrestricted public read access via Supabase RLS.

---

## Privacy and data retention

**GDPR compliance is mandatory** — the app processes personal data (property owner names from tulajdoni lap) within the EU.

**Required:** an `/adatvedelem` page with adatvédelmi tájékoztató covering:
- What data is collected and why
- Legal basis for processing (legitimate interest / contract performance)
- Retention periods
- Data subject rights (access, deletion, objection)
- Contact information

**Retention policy:**

| Data | Retention | Action |
|---|---|---|
| Original PDF | 24 hours | Delete from Supabase Storage |
| Extracted raw text | 24 hours | Set to null on report row |
| Structured report (analysis, flags) | 30 days | Delete report row |
| Email address | 30 days | Deleted with report |
| Stripe payment data | Managed by Stripe | Not stored locally |
| Logs | Never contain raw document text | Sentry: redact sensitive payloads |

Never claim "we delete your data" unless the implementation matches the policy exactly.

---

## Security requirements

### File upload
- Accept `application/pdf` only
- Enforce max 10MB
- Use Supabase Storage private bucket
- Use safe generated storage paths — never trust client filename
- Reject suspicious files early

### Payments
- Verify Stripe webhook signature on every event
- Enforce idempotency via `stripe_events` table
- Never trust client-side payment completion alone

### Report access
- Require signed access token — not UUID alone
- Hash tokens before storing
- Enforce token expiration server-side

### Application
- Never expose Supabase service role key to client
- Sanitize all logs — no raw document text in Sentry
- Validate all inputs on every API route
- Never expose stack traces to users

---

## Error handling

**Rules:**
- All API routes return consistent `ApiResponse<T>` shape
- Internal logs in English
- User-facing messages in Hungarian
- Never expose stack traces or internal details to users
- Use structured error codes internally

**Error codes:**

```typescript
export const ERROR_CODES = {
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  REPORT_NOT_FOUND: 'REPORT_NOT_FOUND',
  REPORT_NOT_ELIGIBLE: 'REPORT_NOT_ELIGIBLE',
  PAYMENT_NOT_CONFIRMED: 'PAYMENT_NOT_CONFIRMED',
  AI_OUTPUT_INVALID: 'AI_OUTPUT_INVALID',
  PDF_EXTRACTION_FAILED: 'PDF_EXTRACTION_FAILED',
  ACCESS_TOKEN_INVALID: 'ACCESS_TOKEN_INVALID',
  ACCESS_TOKEN_EXPIRED: 'ACCESS_TOKEN_EXPIRED',
  WEBHOOK_SIGNATURE_INVALID: 'WEBHOOK_SIGNATURE_INVALID',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
```

---

## Hungarian UI text

```typescript
// src/config/ui-text.ts

export const HU = {
  hero_title: 'Ellenőrizd az ingatlant vásárlás előtt',
  hero_subtitle: 'Töltsd fel a tulajdoni lapot, és gyors előzetes kockázati összefoglalót kapsz.',
  upload_cta: 'Tulajdoni lap feltöltése',
  upload_drag: 'Húzd ide a PDF-et vagy kattints a tallózáshoz',
  upload_limit: 'Maximum 10 MB, csak PDF formátum',
  price_label: '€14,99 / elemzés',
  price_includes: 'Tulajdonosi adatok, terhek, figyelmeztető jelek és összefoglaló',
  pay_cta: 'Fizetés és elemzés indítása',
  processing: 'Az elemzés folyamatban van...',
  report_title: 'Tulajdoni lap elemzés',
  risk_low: 'Alacsony kockázat',
  risk_medium: 'Közepes kockázat',
  risk_high: 'Magas kockázat',
  risk_critical: 'Kritikus kockázat',
  flag_red: 'Kiemelt kockázat',
  flag_yellow: 'További ellenőrzést igényel',
  flag_green: 'Kedvező jelzés',
  disclaimer: 'Ez az elemzés tájékoztató jellegű, nem minősül jogi tanácsadásnak. Ingatlanvásárlás előtt mindig forduljon ügyvédhez.',
  email_subject: 'IngatlanCheck — Elkészült az elemzés',
  error_upload: 'A feltöltés nem sikerült. Kérjük, próbáld újra.',
  error_payment: 'A fizetés nem sikerült. Kérjük, próbáld újra.',
  error_analysis: 'Az elemzés nem sikerült. Kérjük, vedd fel velünk a kapcsolatot.',
  error_access_expired: 'A hozzáférési link lejárt. Kérjük, ellenőrizd az e-mailben kapott linket.',
  error_access_invalid: 'Érvénytelen hozzáférés. Kérjük, használd az e-mailben kapott linket.',
  footer_about: 'Az IngatlanCheck egy AI-alapú tájékoztató eszköz, nem helyettesíti az ügyvédi ellenőrzést.',
  privacy_title: 'Adatvédelmi tájékoztató',
} as const;
```

---

## Coding rules

### General
- TypeScript strict mode, no `any` types
- Prefer `const`, use `let` only when mutation is needed
- Prefer named exports over default exports
- Prefer small functions with explicit input/output types
- Validate all external input (user input, AI output, webhook payloads)
- Keep domain logic separate from route handlers
- Keep AI prompt logic separate from AI response validation
- Error messages: English in logs, Hungarian for users

### Next.js
- App Router only (not Pages Router)
- Server Components by default
- `'use client'` only when client-side interactivity is required
- Keep API routes thin — delegate to lib functions
- Use `next/font` for fonts, `next/image` for images
- SEO metadata in `layout.tsx`

### Styling
- Tailwind CSS only, no CSS-in-JS
- Mobile-first responsive design
- Clean, minimal, trustworthy design — avoid flashy legal-tech clichés
- Flag colors: `red-500` (red flags), `amber-500` (yellow flags), `emerald-500` (green flags)
- Neutral base: slate/zinc tones

### Implementation style
- Ship the simplest thing that is safe
- Add comments where logic is non-obvious
- Test critical paths first
- Avoid speculative abstractions
- Do not add infrastructure just because it sounds enterprise

---

## Environment variables

```bash
# .env.example

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
NEXT_PUBLIC_APP_URL=https://ingatlancheck.hu
```

---

## Build sequence

### Phase 1 — Core foundation (Week 1)
1. `npx create-next-app@latest ingatlancheck --typescript --tailwind --app --src-dir`
2. Set up Supabase project, create private storage bucket, run migration
3. Implement `src/lib/pdf.ts` — PDF text extraction
4. Implement `src/lib/ai.ts` — Claude API wrapper
5. Implement `src/lib/analyzer.ts` — system prompt + user prompt
6. Implement `src/lib/validation.ts` — Zod schema for AI output
7. Build `POST /api/upload` route
8. Build `POST /api/analyze` route
9. Test with 5+ real tulajdoni lap PDFs
10. Verify AI output validates against Zod schema consistently

### Phase 2 — Payments and delivery (Week 2)
11. Set up Stripe product + price (€14.99)
12. Build `POST /api/checkout` route
13. Build `POST /api/webhook/stripe` with idempotency via `stripe_events`
14. Connect full flow: upload → checkout → webhook → analyze
15. Implement `src/lib/report-access.ts` — token generation, hashing, verification
16. Build `GET /api/report-access` route
17. Build report page `/report/[id]`
18. Build Resend email template with secure link
19. Test full payment → analysis → email → report access flow

### Phase 3 — Frontend and production (Week 3)
20. Landing page with value proposition in Hungarian
21. Upload page with drag & drop
22. Report page with flag cards, risk score, summary, disclaimer
23. Adatvédelmi tájékoztató page
24. Sentry integration with sensitive data redaction
25. Mobile responsive pass
26. End-to-end test the full flow
27. Deploy to Vercel + Cloudflare DNS + custom domain

### Phase 4 — Post-launch improvements
28. PostHog analytics integration
29. Upstash Redis rate limiting on upload endpoint
30. PDF and raw_text cleanup cron job
31. Report expiry cleanup (30 days)
32. Monitor and iterate based on real usage

---

## Testing checklist

Before launch, verify:

### Functional
- [ ] PDF upload works for multiple real tulajdoni lap documents
- [ ] Extraction handles typical layouts and degraded scans reasonably
- [ ] AI output always validates against Zod schema
- [ ] Stripe checkout works in test mode and live mode
- [ ] Webhook is idempotent (same event processed only once)
- [ ] Paid reports are analyzed exactly once
- [ ] Email delivery contains valid secure access link
- [ ] Report page renders correctly on mobile and desktop

### Analysis quality
- [ ] Jelzálog is detected when present
- [ ] Végrehajtási jog is detected when present
- [ ] Haszonélvezeti jog is detected when present
- [ ] Elidegenítési és terhelési tilalom handled with context (bank collateral vs problematic)
- [ ] Ownership data extracted only when explicitly present
- [ ] Missing or unreadable sections produce yellow warnings, not fabricated values
- [ ] AI never invents facts not in the document

### Security and privacy
- [ ] Report cannot be accessed with UUID alone
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected
- [ ] PDF is deleted after 24 hours
- [ ] Raw text is deleted after 24 hours
- [ ] Sensitive text is not logged to Sentry
- [ ] Invalid uploads are rejected
- [ ] Service-role credentials never exposed client-side
- [ ] Adatvédelmi tájékoztató page exists and is accessible

### UX
- [ ] Hungarian copy is natural and grammatically correct
- [ ] Disclaimer is visible on every report page
- [ ] Error states show clear Hungarian messages
- [ ] Processing state is clear and not misleading
- [ ] No promises of specific processing time unless measured

---

## What NOT to do

- Do not treat UUID links as secure authentication
- Do not let AI invent missing legal facts
- Do not save raw model output without Zod validation
- Do not store sensitive text longer than retention policy allows
- Do not overbuild auth/admin before core flow works
- Do not add infrastructure just because it sounds enterprise
- Do not promise faster turnaround than the system reliably delivers
- Do not claim data deletion without implementing the actual cleanup

---

## Definition of done

The MVP is done when:
1. A user can upload a real tulajdoni lap PDF
2. The user can pay successfully via Stripe
3. The system extracts text and generates a Zod-validated structured report
4. The report is accessible only via secure signed token
5. The disclaimer is visible on every report
6. Email is delivered with secure report link
7. Sensitive source data is cleaned up per retention policy
8. Adatvédelmi tájékoztató page is published
9. The full flow works end-to-end in production
