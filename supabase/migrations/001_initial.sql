-- IngatlanCheck initial schema
-- Apply via Supabase Dashboard → SQL Editor

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'processing', 'completed', 'failed')),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  pdf_storage_path TEXT,
  raw_text TEXT,
  analysis JSONB,
  flags JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  risk_score TEXT CHECK (risk_score IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  pdf_deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_stripe_session ON reports(stripe_session_id);
CREATE INDEX idx_reports_email ON reports(email);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports readable by anyone with the UUID"
  ON reports FOR SELECT
  USING (true);
