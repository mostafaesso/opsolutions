
-- Shared trigger function for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================
-- customer_details
-- =============================================
CREATE TABLE public.customer_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL UNIQUE,
  website TEXT,
  industry TEXT,
  employee_count INTEGER,
  locations TEXT[] NOT NULL DEFAULT '{}',
  main_contact_name TEXT,
  main_contact_email TEXT,
  main_contact_phone TEXT,
  hubspot_token TEXT,
  hubspot_account_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read customer_details" ON public.customer_details FOR SELECT USING (true);
CREATE POLICY "Anyone can insert customer_details" ON public.customer_details FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update customer_details" ON public.customer_details FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete customer_details" ON public.customer_details FOR DELETE USING (true);
CREATE TRIGGER trg_customer_details_updated BEFORE UPDATE ON public.customer_details FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- enhancements
-- =============================================
CREATE TABLE public.enhancements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  before_url TEXT NOT NULL,
  after_url TEXT NOT NULL,
  category TEXT,
  created_by TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'all',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.enhancements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read enhancements" ON public.enhancements FOR SELECT USING (true);
CREATE POLICY "Anyone can insert enhancements" ON public.enhancements FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update enhancements" ON public.enhancements FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete enhancements" ON public.enhancements FOR DELETE USING (true);
CREATE TRIGGER trg_enhancements_updated BEFORE UPDATE ON public.enhancements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- pipeline_metrics
-- =============================================
CREATE TABLE public.pipeline_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL,
  metric_date DATE NOT NULL,
  views_count INTEGER NOT NULL DEFAULT 0,
  views_sessions INTEGER NOT NULL DEFAULT 0,
  views_conversion_rate NUMERIC NOT NULL DEFAULT 0,
  subscribers_count INTEGER NOT NULL DEFAULT 0,
  subscribers_posts INTEGER NOT NULL DEFAULT 0,
  subscribers_impressions INTEGER NOT NULL DEFAULT 0,
  subscribers_conversion_rate NUMERIC NOT NULL DEFAULT 0,
  leads_count INTEGER NOT NULL DEFAULT 0,
  leads_assigned INTEGER NOT NULL DEFAULT 0,
  leads_unassigned INTEGER NOT NULL DEFAULT 0,
  leads_online_source INTEGER NOT NULL DEFAULT 0,
  leads_offline_source INTEGER NOT NULL DEFAULT 0,
  leads_conversion_rate NUMERIC NOT NULL DEFAULT 0,
  mql_count INTEGER NOT NULL DEFAULT 0,
  mql_contact_status TEXT NOT NULL DEFAULT '',
  mql_conversion_rate NUMERIC NOT NULL DEFAULT 0,
  sql_count INTEGER NOT NULL DEFAULT 0,
  sql_conversion_rate NUMERIC NOT NULL DEFAULT 0,
  opportunity_count INTEGER NOT NULL DEFAULT 0,
  opportunity_value NUMERIC NOT NULL DEFAULT 0,
  opportunity_win_rate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_slug, metric_date)
);
ALTER TABLE public.pipeline_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read pipeline_metrics" ON public.pipeline_metrics FOR SELECT USING (true);
CREATE POLICY "Anyone can insert pipeline_metrics" ON public.pipeline_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update pipeline_metrics" ON public.pipeline_metrics FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete pipeline_metrics" ON public.pipeline_metrics FOR DELETE USING (true);
CREATE TRIGGER trg_pipeline_metrics_updated BEFORE UPDATE ON public.pipeline_metrics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- pipeline_conversions
-- =============================================
CREATE TABLE public.pipeline_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL,
  conversion_date DATE NOT NULL,
  from_stage TEXT NOT NULL,
  to_stage TEXT NOT NULL,
  from_count INTEGER NOT NULL DEFAULT 0,
  to_count INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pipeline_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read pipeline_conversions" ON public.pipeline_conversions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert pipeline_conversions" ON public.pipeline_conversions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update pipeline_conversions" ON public.pipeline_conversions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete pipeline_conversions" ON public.pipeline_conversions FOR DELETE USING (true);

-- =============================================
-- benchmarks
-- =============================================
CREATE TABLE public.benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  region TEXT,
  metric_type TEXT NOT NULL,
  average_conversion_rate NUMERIC NOT NULL DEFAULT 0,
  percentile_25 NUMERIC,
  percentile_75 NUMERIC,
  data_points INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read benchmarks" ON public.benchmarks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert benchmarks" ON public.benchmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update benchmarks" ON public.benchmarks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete benchmarks" ON public.benchmarks FOR DELETE USING (true);

-- =============================================
-- improvements
-- =============================================
CREATE TABLE public.improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  before_image_url TEXT,
  after_image_url TEXT,
  before_metrics TEXT,
  after_metrics TEXT,
  implemented_date DATE NOT NULL DEFAULT CURRENT_DATE,
  impact_summary TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.improvements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read improvements" ON public.improvements FOR SELECT USING (true);
CREATE POLICY "Anyone can insert improvements" ON public.improvements FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update improvements" ON public.improvements FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete improvements" ON public.improvements FOR DELETE USING (true);
CREATE TRIGGER trg_improvements_updated BEFORE UPDATE ON public.improvements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- hubspot_credentials
-- =============================================
CREATE TABLE public.hubspot_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL UNIQUE,
  private_app_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hubspot_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read hubspot_credentials" ON public.hubspot_credentials FOR SELECT USING (true);
CREATE POLICY "Anyone can insert hubspot_credentials" ON public.hubspot_credentials FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update hubspot_credentials" ON public.hubspot_credentials FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete hubspot_credentials" ON public.hubspot_credentials FOR DELETE USING (true);
CREATE TRIGGER trg_hubspot_credentials_updated BEFORE UPDATE ON public.hubspot_credentials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- company_admins
-- =============================================
CREATE TABLE public.company_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_slug, email)
);
ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read company_admins" ON public.company_admins FOR SELECT USING (true);
CREATE POLICY "Anyone can insert company_admins" ON public.company_admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update company_admins" ON public.company_admins FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete company_admins" ON public.company_admins FOR DELETE USING (true);

-- =============================================
-- team_members
-- =============================================
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  invited_by TEXT,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'invited',
  UNIQUE (company_slug, email)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read team_members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Anyone can insert team_members" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update team_members" ON public.team_members FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete team_members" ON public.team_members FOR DELETE USING (true);

-- =============================================
-- updates
-- =============================================
CREATE TABLE public.updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'all',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read updates" ON public.updates FOR SELECT USING (true);
CREATE POLICY "Anyone can insert updates" ON public.updates FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update updates" ON public.updates FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete updates" ON public.updates FOR DELETE USING (true);
CREATE TRIGGER trg_updates_updated BEFORE UPDATE ON public.updates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- update_comments
-- =============================================
CREATE TABLE public.update_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES public.updates(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.update_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read update_comments" ON public.update_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert update_comments" ON public.update_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update update_comments" ON public.update_comments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete update_comments" ON public.update_comments FOR DELETE USING (true);

-- =============================================
-- company_training_overrides
-- =============================================
CREATE TABLE public.company_training_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL,
  module_id TEXT NOT NULL,
  custom_notes TEXT,
  custom_video_url TEXT,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_slug, module_id)
);
ALTER TABLE public.company_training_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read company_training_overrides" ON public.company_training_overrides FOR SELECT USING (true);
CREATE POLICY "Anyone can insert company_training_overrides" ON public.company_training_overrides FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update company_training_overrides" ON public.company_training_overrides FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete company_training_overrides" ON public.company_training_overrides FOR DELETE USING (true);
CREATE TRIGGER trg_company_training_overrides_updated BEFORE UPDATE ON public.company_training_overrides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
