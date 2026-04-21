-- Dashboard items per company
CREATE TABLE IF NOT EXISTS public.company_dashboards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_slug text NOT NULL,
  name text NOT NULL,
  description text,
  logic_prompt text,
  data_definition jsonb,
  filter_team boolean NOT NULL DEFAULT false,
  filter_date boolean NOT NULL DEFAULT false,
  filter_region boolean NOT NULL DEFAULT false,
  iframe_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Report items per company
CREATE TABLE IF NOT EXISTS public.company_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_slug text NOT NULL,
  name text NOT NULL,
  description text,
  logic_prompt text,
  data_definition jsonb,
  filter_team boolean NOT NULL DEFAULT false,
  filter_date boolean NOT NULL DEFAULT false,
  filter_region boolean NOT NULL DEFAULT false,
  iframe_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add dashboard settings to company_settings
ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS dashboards_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dashboards_permission text NOT NULL DEFAULT 'view_only';

-- Enable RLS
ALTER TABLE public.company_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_reports ENABLE ROW LEVEL SECURITY;

-- Open policies (auth is handled at the app layer)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='company_dashboards' AND policyname='allow_all_dashboards') THEN
    CREATE POLICY allow_all_dashboards ON public.company_dashboards FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='company_reports' AND policyname='allow_all_reports') THEN
    CREATE POLICY allow_all_reports ON public.company_reports FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
