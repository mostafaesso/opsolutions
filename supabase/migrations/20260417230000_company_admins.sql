-- Company admins table: one row per admin linked to their company
CREATE TABLE IF NOT EXISTS public.company_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  company_slug text NOT NULL REFERENCES public.companies(slug) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email)
);

-- RLS: allow anyone to read (needed for post-login lookup)
ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Company admins are readable by authenticated users" ON public.company_admins;
CREATE POLICY "Company admins are readable by authenticated users"
  ON public.company_admins
  FOR SELECT
  USING (auth.role() = 'authenticated');
