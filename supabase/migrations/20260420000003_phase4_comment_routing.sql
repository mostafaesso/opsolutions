-- Phase 4: Comment Routing System
-- Stores per-company routing rules for comment notifications

CREATE TABLE IF NOT EXISTS public.comment_routing (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  route_to          TEXT[] NOT NULL DEFAULT '{super_admin}',
  additional_emails TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comment_routing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comment_routing: open access" ON public.comment_routing;
CREATE POLICY "comment_routing: open access"
  ON public.comment_routing FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_comment_routing_company ON public.comment_routing(company_id);
