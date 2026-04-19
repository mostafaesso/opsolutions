-- Phase 2: Customer Management, Multi-Stage Pipeline, Improvements, and Benchmarking

-- 1. CUSTOMER DETAILS TABLE (extended company info for Phase 2)
CREATE TABLE IF NOT EXISTS public.customer_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_slug TEXT NOT NULL UNIQUE REFERENCES public.companies(slug) ON DELETE CASCADE,
  website TEXT,
  industry TEXT,
  employee_count INTEGER,
  locations TEXT[] DEFAULT '{}',
  main_contact_name TEXT,
  main_contact_email TEXT,
  main_contact_phone TEXT,
  hubspot_token TEXT,  -- encrypted in transit via Supabase
  hubspot_account_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_details ENABLE ROW LEVEL SECURITY;

-- RLS: Super admin sees all, customer admin sees own company only
CREATE POLICY "Super admin can see all customer details" ON public.customer_details
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.super_admins WHERE is_active = true
    )
  );

CREATE POLICY "Customer admin can see own company details" ON public.customer_details
  FOR SELECT
  USING (
    company_slug IN (
      SELECT company_slug FROM public.company_admins WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Authenticated users can insert customer details" ON public.customer_details
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Customers can update own details" ON public.customer_details
  FOR UPDATE
  USING (
    company_slug IN (
      SELECT company_slug FROM public.company_admins WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Index for company lookup
CREATE INDEX IF NOT EXISTS idx_customer_details_company ON public.customer_details(company_slug);


-- 2. PIPELINE METRICS TABLE (Views, Subscribers, Leads, MQL, SQL, Opportunity)
CREATE TABLE IF NOT EXISTS public.pipeline_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_slug TEXT NOT NULL REFERENCES public.companies(slug) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Stage 1: Views (website visitors)
  views_count INTEGER DEFAULT 0,
  views_sessions INTEGER DEFAULT 0,
  views_conversion_rate NUMERIC(5, 2) DEFAULT 0,  -- % to next stage
  
  -- Stage 2: Subscribers (social followers, etc)
  subscribers_count INTEGER DEFAULT 0,
  subscribers_posts INTEGER DEFAULT 0,
  subscribers_impressions INTEGER DEFAULT 0,
  subscribers_conversion_rate NUMERIC(5, 2) DEFAULT 0,
  
  -- Stage 3: Leads (form submissions, inquiries)
  leads_count INTEGER DEFAULT 0,
  leads_assigned INTEGER DEFAULT 0,
  leads_unassigned INTEGER DEFAULT 0,
  leads_online_source INTEGER DEFAULT 0,
  leads_offline_source INTEGER DEFAULT 0,
  leads_conversion_rate NUMERIC(5, 2) DEFAULT 0,
  
  -- Stage 4: MQL (marketing qualified leads)
  mql_count INTEGER DEFAULT 0,
  mql_contact_status TEXT,  -- "new", "contacted", "qualified"
  mql_conversion_rate NUMERIC(5, 2) DEFAULT 0,
  
  -- Stage 5: SQL (sales qualified leads)
  sql_count INTEGER DEFAULT 0,
  sql_conversion_rate NUMERIC(5, 2) DEFAULT 0,  -- to opportunity
  
  -- Stage 6: Opportunity
  opportunity_count INTEGER DEFAULT 0,
  opportunity_value NUMERIC(12, 2) DEFAULT 0,
  opportunity_win_rate NUMERIC(5, 2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (company_slug, metric_date)
);

ALTER TABLE public.pipeline_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can see all pipeline metrics" ON public.pipeline_metrics
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.super_admins WHERE is_active = true
    )
  );

CREATE POLICY "Users can see their company pipeline" ON public.pipeline_metrics
  FOR SELECT
  USING (
    company_slug IN (
      SELECT company_slug FROM public.company_admins WHERE email = auth.jwt() ->> 'email'
      UNION
      SELECT COALESCE(
        (SELECT company_slug FROM public.company_admins WHERE email = (
          SELECT email FROM public.training_users WHERE id = auth.uid()
        )),
        (SELECT domain FROM public.companies WHERE domain = 
          substring(auth.jwt() ->> 'email' from '@' for 255))
      )
    )
  );

CREATE POLICY "Customers can insert pipeline metrics" ON public.pipeline_metrics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Customers can update own metrics" ON public.pipeline_metrics
  FOR UPDATE
  USING (
    company_slug IN (
      SELECT company_slug FROM public.company_admins WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE INDEX IF NOT EXISTS idx_pipeline_metrics_company_date ON public.pipeline_metrics(company_slug, metric_date);
CREATE INDEX IF NOT EXISTS idx_pipeline_metrics_company ON public.pipeline_metrics(company_slug);


-- 3. PIPELINE CONVERSIONS TABLE (track conversion rates over time)
CREATE TABLE IF NOT EXISTS public.pipeline_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_slug TEXT NOT NULL REFERENCES public.companies(slug) ON DELETE CASCADE,
  conversion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  from_stage TEXT NOT NULL,  -- "views", "subscribers", "leads", "mql", "sql", "opportunity"
  to_stage TEXT NOT NULL,
  from_count INTEGER NOT NULL,
  to_count INTEGER NOT NULL,
  conversion_rate NUMERIC(5, 2) NOT NULL,  -- calculated percentage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (company_slug, conversion_date, from_stage, to_stage)
);

ALTER TABLE public.pipeline_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversions readable by authenticated" ON public.pipeline_conversions
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Conversions insertable by authenticated" ON public.pipeline_conversions
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_conversions_company_date ON public.pipeline_conversions(company_slug, conversion_date);


-- 4. IMPROVEMENTS TABLE (before/after improvements tracking)
CREATE TABLE IF NOT EXISTS public.improvements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_slug TEXT NOT NULL REFERENCES public.companies(slug) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,  -- "automation", "process", "analytics", "integration", "workflow", "reporting"
  before_image_url TEXT,
  after_image_url TEXT,
  before_metrics TEXT,  -- JSON: {"metric1": value1, "metric2": value2}
  after_metrics TEXT,  -- JSON: calculated impact
  implemented_date DATE NOT NULL DEFAULT CURRENT_DATE,
  impact_summary TEXT,  -- e.g., "30% time savings, 2.5x more leads"
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.improvements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin sees all improvements" ON public.improvements
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.super_admins WHERE is_active = true
    )
  );

CREATE POLICY "Users see their company improvements" ON public.improvements
  FOR SELECT
  USING (
    company_slug IN (
      SELECT company_slug FROM public.company_admins WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Authenticated can create improvements" ON public.improvements
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Companies update own improvements" ON public.improvements
  FOR UPDATE
  USING (
    company_slug IN (
      SELECT company_slug FROM public.company_admins WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE INDEX IF NOT EXISTS idx_improvements_company_date ON public.improvements(company_slug, implemented_date);
CREATE INDEX IF NOT EXISTS idx_improvements_category ON public.improvements(category);


-- 5. BENCHMARKS TABLE (industry/region standards)
CREATE TABLE IF NOT EXISTS public.benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry TEXT NOT NULL,
  region TEXT,  -- optional: "North America", "Europe", "APAC", etc
  metric_type TEXT NOT NULL,  -- "views_to_subscribers", "subscribers_to_leads", "leads_to_mql", etc
  average_conversion_rate NUMERIC(5, 2) NOT NULL,
  percentile_25 NUMERIC(5, 2),
  percentile_75 NUMERIC(5, 2),
  data_points INTEGER DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benchmarks readable by authenticated" ON public.benchmarks
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Super admin can manage benchmarks" ON public.benchmarks
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.super_admins WHERE is_active = true
    )
  );

CREATE POLICY "Super admin can update benchmarks" ON public.benchmarks
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.super_admins WHERE is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_benchmarks_industry_region ON public.benchmarks(industry, region);


-- 6. SUPER ADMINS TABLE (if not exists - for Phase 1 compatibility)
CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins readable by authenticated" ON public.super_admins
  FOR SELECT
  USING (auth.role() = 'authenticated');


-- 7. Create view for pipeline dashboard data (combines metrics and benchmarks)
CREATE OR REPLACE VIEW public.pipeline_dashboard_v AS
SELECT 
  pm.id,
  pm.company_slug,
  pm.metric_date,
  pm.views_count,
  pm.views_conversion_rate,
  pm.subscribers_count,
  pm.subscribers_conversion_rate,
  pm.leads_count,
  pm.leads_assigned,
  pm.leads_conversion_rate,
  pm.mql_count,
  pm.mql_conversion_rate,
  pm.sql_count,
  pm.sql_conversion_rate,
  pm.opportunity_count,
  pm.opportunity_value,
  pm.opportunity_win_rate,
  b.average_conversion_rate as benchmark_rate
FROM public.pipeline_metrics pm
LEFT JOIN public.benchmarks b ON 
  b.metric_type = 'overall_conversion' 
  AND pm.updated_at >= b.last_updated_at;


-- 8. Create function to calculate conversion rates
CREATE OR REPLACE FUNCTION public.calculate_conversion_rate(from_count INTEGER, to_count INTEGER)
RETURNS NUMERIC AS $$
BEGIN
  IF from_count = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND((to_count::NUMERIC / from_count::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- 9. Trigger to auto-update updated_at on customer_details
CREATE OR REPLACE FUNCTION public.update_customer_details_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customer_details_timestamp ON public.customer_details;
CREATE TRIGGER trg_customer_details_timestamp
BEFORE UPDATE ON public.customer_details
FOR EACH ROW
EXECUTE FUNCTION public.update_customer_details_timestamp();

-- 10. Trigger to auto-update pipeline metrics timestamp
DROP TRIGGER IF EXISTS trg_pipeline_metrics_timestamp ON public.pipeline_metrics;
CREATE TRIGGER trg_pipeline_metrics_timestamp
BEFORE UPDATE ON public.pipeline_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_customer_details_timestamp();

-- 11. Trigger to auto-update improvements timestamp
DROP TRIGGER IF EXISTS trg_improvements_timestamp ON public.improvements;
CREATE TRIGGER trg_improvements_timestamp
BEFORE UPDATE ON public.improvements
FOR EACH ROW
EXECUTE FUNCTION public.update_customer_details_timestamp();
