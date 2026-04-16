
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  manager_emails TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Anyone can insert companies" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update companies" ON public.companies FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete companies" ON public.companies FOR DELETE USING (true);

CREATE TABLE public.company_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_slug TEXT NOT NULL REFERENCES public.companies(slug) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.company_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read company_media" ON public.company_media FOR SELECT USING (true);
CREATE POLICY "Anyone can insert company_media" ON public.company_media FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update company_media" ON public.company_media FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete company_media" ON public.company_media FOR DELETE USING (true);
