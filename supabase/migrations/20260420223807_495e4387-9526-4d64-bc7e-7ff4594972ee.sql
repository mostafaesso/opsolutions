
-- Extend ICP tables to match the "Building Your ICP" doc structure
-- Two layers (company + contact), tiering, exclusions, validation, triggers
ALTER TABLE public.icp_templates
  ADD COLUMN IF NOT EXISTS tier text,
  ADD COLUMN IF NOT EXISTS funding_stage text,
  ADD COLUMN IF NOT EXISTS hiring_activity text,
  ADD COLUMN IF NOT EXISTS tech_stack text,
  ADD COLUMN IF NOT EXISTS growth_signals text,
  ADD COLUMN IF NOT EXISTS departments text,
  ADD COLUMN IF NOT EXISTS seniority text,
  ADD COLUMN IF NOT EXISTS buying_role text,
  ADD COLUMN IF NOT EXISTS exclusions text,
  ADD COLUMN IF NOT EXISTS tam_estimate text,
  ADD COLUMN IF NOT EXISTS validation_notes text,
  ADD COLUMN IF NOT EXISTS personalization_level text;

ALTER TABLE public.company_icp
  ADD COLUMN IF NOT EXISTS tier text,
  ADD COLUMN IF NOT EXISTS funding_stage text,
  ADD COLUMN IF NOT EXISTS hiring_activity text,
  ADD COLUMN IF NOT EXISTS tech_stack text,
  ADD COLUMN IF NOT EXISTS growth_signals text,
  ADD COLUMN IF NOT EXISTS departments text,
  ADD COLUMN IF NOT EXISTS seniority text,
  ADD COLUMN IF NOT EXISTS buying_role text,
  ADD COLUMN IF NOT EXISTS exclusions text,
  ADD COLUMN IF NOT EXISTS tam_estimate text,
  ADD COLUMN IF NOT EXISTS validation_notes text,
  ADD COLUMN IF NOT EXISTS personalization_level text;
