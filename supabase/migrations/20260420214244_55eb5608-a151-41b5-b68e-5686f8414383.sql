-- 1. company_settings
CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug text NOT NULL UNIQUE,
  training_doc_enabled boolean NOT NULL DEFAULT true,
  training_video_enabled boolean NOT NULL DEFAULT true,
  crm_updates_employee_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read company_settings" ON public.company_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert company_settings" ON public.company_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update company_settings" ON public.company_settings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete company_settings" ON public.company_settings FOR DELETE USING (true);
CREATE TRIGGER set_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. company_videos
CREATE TABLE public.company_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug text NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.company_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read company_videos" ON public.company_videos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert company_videos" ON public.company_videos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update company_videos" ON public.company_videos FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete company_videos" ON public.company_videos FOR DELETE USING (true);
CREATE TRIGGER set_company_videos_updated_at BEFORE UPDATE ON public.company_videos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. gtm_icp
CREATE TABLE public.gtm_icp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug text NOT NULL UNIQUE,
  industry text,
  company_size text,
  geography text,
  job_titles text[] NOT NULL DEFAULT '{}'::text[],
  pain_points text,
  buying_triggers text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gtm_icp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read gtm_icp" ON public.gtm_icp FOR SELECT USING (true);
CREATE POLICY "Anyone can insert gtm_icp" ON public.gtm_icp FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update gtm_icp" ON public.gtm_icp FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete gtm_icp" ON public.gtm_icp FOR DELETE USING (true);
CREATE TRIGGER set_gtm_icp_updated_at BEFORE UPDATE ON public.gtm_icp FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. gtm_layers
CREATE TABLE public.gtm_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug text NOT NULL,
  layer_number integer NOT NULL CHECK (layer_number BETWEEN 1 AND 8),
  tools_selected text[] NOT NULL DEFAULT '{}'::text[],
  comments text,
  calculator_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_slug, layer_number)
);
ALTER TABLE public.gtm_layers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read gtm_layers" ON public.gtm_layers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert gtm_layers" ON public.gtm_layers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update gtm_layers" ON public.gtm_layers FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete gtm_layers" ON public.gtm_layers FOR DELETE USING (true);
CREATE TRIGGER set_gtm_layers_updated_at BEFORE UPDATE ON public.gtm_layers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Extend improvements with CRM update fields
ALTER TABLE public.improvements
  ADD COLUMN IF NOT EXISTS goal text,
  ADD COLUMN IF NOT EXISTS issue_solved text,
  ADD COLUMN IF NOT EXISTS simple_explanation text;