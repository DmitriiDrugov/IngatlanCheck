-- Stripe webhook idempotency table
-- Every processed Stripe event id is recorded here; duplicate deliveries are skipped.

CREATE TABLE stripe_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
