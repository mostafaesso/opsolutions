-- Add domain field to companies for email-based employee assignment
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS domain TEXT;

-- Index for quick domain lookups during employee registration
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);

-- Add invited_by tracking to training_users
ALTER TABLE training_users
  ADD COLUMN IF NOT EXISTS invited_by TEXT;

ALTER TABLE training_users
  ADD COLUMN IF NOT EXISTS invite_status TEXT DEFAULT 'active';