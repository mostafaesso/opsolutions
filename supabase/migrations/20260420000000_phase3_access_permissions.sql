-- Phase 3: Access & Permissions System
-- Creates platform_role enum, internal_users, internal_company_access, module_permissions

-- Enum for platform roles
DO $$ BEGIN
  CREATE TYPE public.platform_role AS ENUM (
    'super_admin',
    'internal_admin',
    'company_admin',
    'manager',
    'employee'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Internal Ops Solutions team members
CREATE TABLE IF NOT EXISTS public.internal_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  role        public.platform_role NOT NULL DEFAULT 'internal_admin',
  created_by  UUID REFERENCES public.internal_users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the super admin
INSERT INTO public.internal_users (email, name, role)
VALUES ('mostafamoh4mmed@gmail.com', 'Mostafa', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Which internal users have access to which companies
CREATE TABLE IF NOT EXISTS public.internal_company_access (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_user_id UUID NOT NULL REFERENCES public.internal_users(id) ON DELETE CASCADE,
  company_id       UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(internal_user_id, company_id)
);

-- Per-module permission overrides per company per role
CREATE TABLE IF NOT EXISTS public.module_permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  module_id   TEXT NOT NULL,
  role        public.platform_role NOT NULL,
  can_view    BOOLEAN NOT NULL DEFAULT true,
  can_comment BOOLEAN NOT NULL DEFAULT false,
  can_edit    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, module_id, role)
);

-- RLS
ALTER TABLE public.internal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_company_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "internal_users: open access" ON public.internal_users;
CREATE POLICY "internal_users: open access" ON public.internal_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "internal_company_access: open access" ON public.internal_company_access;
CREATE POLICY "internal_company_access: open access" ON public.internal_company_access FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "module_permissions: open access" ON public.module_permissions;
CREATE POLICY "module_permissions: open access" ON public.module_permissions FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_internal_company_access_company ON public.internal_company_access(company_id);
CREATE INDEX IF NOT EXISTS idx_module_permissions_company ON public.module_permissions(company_id);
