
-- ICP Templates (global library)
CREATE TABLE IF NOT EXISTS public.icp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  company_size TEXT,
  geography TEXT,
  job_titles TEXT[] NOT NULL DEFAULT '{}',
  pain_points TEXT,
  buying_triggers TEXT,
  decision_process TEXT,
  disqualifiers TEXT,
  budget_range TEXT,
  goals TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.icp_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_read_icp_templates" ON public.icp_templates FOR SELECT USING (true);
CREATE POLICY "open_insert_icp_templates" ON public.icp_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update_icp_templates" ON public.icp_templates FOR UPDATE USING (true);
CREATE POLICY "open_delete_icp_templates" ON public.icp_templates FOR DELETE USING (true);

-- Per-company ICP instance (linked to a template, with overrides)
CREATE TABLE IF NOT EXISTS public.company_icp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL UNIQUE,
  template_id UUID REFERENCES public.icp_templates(id) ON DELETE SET NULL,
  name TEXT,
  description TEXT,
  industry TEXT,
  company_size TEXT,
  geography TEXT,
  job_titles TEXT[] NOT NULL DEFAULT '{}',
  pain_points TEXT,
  buying_triggers TEXT,
  decision_process TEXT,
  disqualifiers TEXT,
  budget_range TEXT,
  goals TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.company_icp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_read_company_icp" ON public.company_icp FOR SELECT USING (true);
CREATE POLICY "open_insert_company_icp" ON public.company_icp FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update_company_icp" ON public.company_icp FOR UPDATE USING (true);
CREATE POLICY "open_delete_company_icp" ON public.company_icp FOR DELETE USING (true);

-- GTM phases
ALTER TABLE public.gtm_layers
  ADD COLUMN IF NOT EXISTS phase TEXT NOT NULL DEFAULT 'pre_launch';

-- Training modules (admin-defined)
CREATE TABLE IF NOT EXISTS public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  default_video_url TEXT,
  default_notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_read_training_modules" ON public.training_modules FOR SELECT USING (true);
CREATE POLICY "open_insert_training_modules" ON public.training_modules FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update_training_modules" ON public.training_modules FOR UPDATE USING (true);
CREATE POLICY "open_delete_training_modules" ON public.training_modules FOR DELETE USING (true);

-- Per-company training module assignments
CREATE TABLE IF NOT EXISTS public.company_training_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL,
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  custom_title TEXT,
  custom_description TEXT,
  custom_video_url TEXT,
  custom_notes TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_slug, module_id)
);
ALTER TABLE public.company_training_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_read_cta" ON public.company_training_assignments FOR SELECT USING (true);
CREATE POLICY "open_insert_cta" ON public.company_training_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update_cta" ON public.company_training_assignments FOR UPDATE USING (true);
CREATE POLICY "open_delete_cta" ON public.company_training_assignments FOR DELETE USING (true);
