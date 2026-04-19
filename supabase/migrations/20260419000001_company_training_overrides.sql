-- Per-company training material customizations
-- Super admin can add notes, hide modules, or add custom video URLs per company
-- Default content always comes from trainingData.ts; this table stores overrides only

CREATE TABLE IF NOT EXISTS public.company_training_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_slug TEXT NOT NULL REFERENCES public.companies(slug) ON DELETE CASCADE,
  module_id TEXT NOT NULL,           -- matches trainingCards id e.g. 'crm-overview'
  custom_notes TEXT,                 -- admin notes visible to this company's learners
  custom_video_url TEXT,             -- optional company-specific video
  is_hidden BOOLEAN NOT NULL DEFAULT false,  -- hide this module for this company
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (company_slug, module_id)
);

ALTER TABLE public.company_training_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage training overrides" ON public.company_training_overrides
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_training_overrides_company ON public.company_training_overrides(company_slug);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER trg_training_overrides_timestamp
BEFORE UPDATE ON public.company_training_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_customer_details_timestamp();
