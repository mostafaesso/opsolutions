ALTER TABLE public.company_icp DROP CONSTRAINT IF EXISTS company_icp_company_slug_key;
CREATE INDEX IF NOT EXISTS idx_company_icp_company_slug ON public.company_icp(company_slug);