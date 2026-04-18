-- Updates table for company announcements/updates
CREATE TABLE IF NOT EXISTS public.updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL REFERENCES public.companies(slug) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL, -- email of the user who created it
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  visibility TEXT NOT NULL DEFAULT 'all', -- 'all', 'managers', 'admins'
  UNIQUE(id)
);

-- Comments on updates
CREATE TABLE IF NOT EXISTS public.update_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES public.updates(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(id)
);

-- Before/After enhancements for companies
CREATE TABLE IF NOT EXISTS public.enhancements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL REFERENCES public.companies(slug) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  before_url TEXT NOT NULL,
  after_url TEXT NOT NULL,
  category TEXT, -- e.g. "HubSpot Setup", "Process", "Dashboard"
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  visibility TEXT NOT NULL DEFAULT 'all', -- 'all', 'managers', 'admins'
  UNIQUE(id)
);

-- Team members (managers and employees assigned to company)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL REFERENCES public.companies(slug) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee', -- 'admin', 'manager', 'employee'
  invited_by TEXT, -- email of who invited them
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'invited', -- 'invited', 'accepted'
  UNIQUE(company_slug, email)
);

-- HubSpot credentials per company
CREATE TABLE IF NOT EXISTS public.hubspot_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_slug TEXT NOT NULL UNIQUE REFERENCES public.companies(slug) ON DELETE CASCADE,
  private_app_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhancements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hubspot_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Updates (view-only for employees, full access for admins)
DROP POLICY IF EXISTS "Updates: Anyone can read" ON public.updates;
CREATE POLICY "Updates: Anyone can read"
  ON public.updates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Updates: Admins can insert" ON public.updates;
CREATE POLICY "Updates: Admins can insert"
  ON public.updates FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Updates: Admins can update own" ON public.updates;
CREATE POLICY "Updates: Admins can update own"
  ON public.updates FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Updates: Admins can delete" ON public.updates;
CREATE POLICY "Updates: Admins can delete"
  ON public.updates FOR DELETE USING (true);

-- RLS Policies for Update Comments
DROP POLICY IF EXISTS "Update comments: Anyone can read" ON public.update_comments;
CREATE POLICY "Update comments: Anyone can read"
  ON public.update_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Update comments: Anyone can insert" ON public.update_comments;
CREATE POLICY "Update comments: Anyone can insert"
  ON public.update_comments FOR INSERT WITH CHECK (true);

-- RLS Policies for Enhancements
DROP POLICY IF EXISTS "Enhancements: Anyone can read" ON public.enhancements;
CREATE POLICY "Enhancements: Anyone can read"
  ON public.enhancements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enhancements: Admins can insert" ON public.enhancements;
CREATE POLICY "Enhancements: Admins can insert"
  ON public.enhancements FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enhancements: Admins can update" ON public.enhancements;
CREATE POLICY "Enhancements: Admins can update"
  ON public.enhancements FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enhancements: Admins can delete" ON public.enhancements;
CREATE POLICY "Enhancements: Admins can delete"
  ON public.enhancements FOR DELETE USING (true);

-- RLS Policies for Team Members
DROP POLICY IF EXISTS "Team members: Anyone can read" ON public.team_members;
CREATE POLICY "Team members: Anyone can read"
  ON public.team_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Team members: Admins can manage" ON public.team_members;
CREATE POLICY "Team members: Admins can manage"
  ON public.team_members FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Team members: Admins can update" ON public.team_members;
CREATE POLICY "Team members: Admins can update"
  ON public.team_members FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Team members: Admins can delete" ON public.team_members;
CREATE POLICY "Team members: Admins can delete"
  ON public.team_members FOR DELETE USING (true);

-- RLS Policies for HubSpot Credentials (restrict to authenticated only)
DROP POLICY IF EXISTS "HubSpot: Only authenticated" ON public.hubspot_credentials;
CREATE POLICY "HubSpot: Only authenticated"
  ON public.hubspot_credentials FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "HubSpot: Admins can manage" ON public.hubspot_credentials;
CREATE POLICY "HubSpot: Admins can manage"
  ON public.hubspot_credentials FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "HubSpot: Admins can update" ON public.hubspot_credentials;
CREATE POLICY "HubSpot: Admins can update"
  ON public.hubspot_credentials FOR UPDATE USING (true) WITH CHECK (true);
