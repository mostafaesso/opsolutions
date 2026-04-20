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


-- ═══════════════════════════════════════════════════════════════

-- Phase 3: Training Videos + Shared Comment Thread
-- Creates video_modules, video_completions, module_comments

-- Global training video library (not per-company)
CREATE TABLE IF NOT EXISTS public.video_modules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  video_url     TEXT NOT NULL,
  duration      INTEGER,           -- seconds
  thumbnail_url TEXT,
  order_index   INTEGER NOT NULL DEFAULT 0,
  is_published  BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-user video completion tracking
CREATE TABLE IF NOT EXISTS public.video_completions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.training_users(id) ON DELETE CASCADE,
  video_id     UUID NOT NULL REFERENCES public.video_modules(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Shared comment thread for docs, videos, and GTM steps
CREATE TABLE IF NOT EXISTS public.module_comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    TEXT NOT NULL,                   -- training card ID, video UUID, or gtm step ID
  module_type  TEXT NOT NULL CHECK (module_type IN ('doc', 'video', 'gtm')),
  company_id   UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  author_name  TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content      TEXT NOT NULL,
  parent_id    UUID REFERENCES public.module_comments(id) ON DELETE CASCADE,
  is_pinned    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.video_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "video_modules: open access" ON public.video_modules;
CREATE POLICY "video_modules: open access" ON public.video_modules FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "video_completions: open access" ON public.video_completions;
CREATE POLICY "video_completions: open access" ON public.video_completions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "module_comments: open access" ON public.module_comments;
CREATE POLICY "module_comments: open access" ON public.module_comments FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_video_modules_published ON public.video_modules(is_published, order_index);
CREATE INDEX IF NOT EXISTS idx_video_completions_user ON public.video_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_module_comments_lookup ON public.module_comments(module_id, module_type, company_id);


-- ═══════════════════════════════════════════════════════════════

-- Phase 3: GTM Flow Module
-- Tables: gtm_flow_steps, gtm_tier_tools, company_gtm_access

CREATE TABLE IF NOT EXISTS public.gtm_flow_steps (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                    TEXT NOT NULL,
  description              TEXT,
  order_index              INTEGER NOT NULL DEFAULT 0,
  hubspot_integration_note TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gtm_tier_tools (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id       UUID NOT NULL REFERENCES public.gtm_flow_steps(id) ON DELETE CASCADE,
  tier          TEXT NOT NULL CHECK (tier IN ('free', 'mid', 'pro')),
  tool_name     TEXT NOT NULL,
  tool_url      TEXT,
  monthly_cost  INTEGER NOT NULL DEFAULT 0,
  notes         TEXT,
  order_index   INTEGER NOT NULL DEFAULT 0
);

-- Per-company GTM access control
CREATE TABLE IF NOT EXISTS public.company_gtm_access (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  tiers_visible  TEXT[] NOT NULL DEFAULT '{free,mid,pro}',
  is_active      BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.gtm_flow_steps    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gtm_tier_tools    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_gtm_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gtm_flow_steps: open access"     ON public.gtm_flow_steps;
CREATE POLICY "gtm_flow_steps: open access"     ON public.gtm_flow_steps     FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "gtm_tier_tools: open access"     ON public.gtm_tier_tools;
CREATE POLICY "gtm_tier_tools: open access"     ON public.gtm_tier_tools     FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "company_gtm_access: open access" ON public.company_gtm_access;
CREATE POLICY "company_gtm_access: open access" ON public.company_gtm_access FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_gtm_tier_tools_step ON public.gtm_tier_tools(step_id, tier);

-- ─── Seed: 6 GTM steps ───────────────────────────────────────────────────────

INSERT INTO public.gtm_flow_steps (id, title, description, order_index, hubspot_integration_note) VALUES
(
  '00000000-0000-0000-0001-000000000001',
  'Source',
  'Identify and build targeted prospect lists from databases, directories, and social platforms.',
  1,
  'Use HubSpot''s Prospecting tool to create target lists. Connect Apollo or ZoomInfo as a data source via HubSpot integrations to auto-populate contact records.'
),
(
  '00000000-0000-0000-0001-000000000002',
  'Scrape',
  'Extract structured prospect data at scale from LinkedIn, company websites, and web directories.',
  2,
  'Use HubSpot''s bulk import (CSV) to upload scraped lists. Map fields carefully to avoid duplicate contacts. Enable duplicate management in HubSpot settings before importing.'
),
(
  '00000000-0000-0000-0001-000000000003',
  'Enrich',
  'Append missing firmographic and demographic data to your leads — job titles, phone numbers, technographics, company size.',
  3,
  'HubSpot Breeze AI auto-fills company and contact info natively. For custom enrichment fields, use Clearbit or Clay via HubSpot app marketplace integrations.'
),
(
  '00000000-0000-0000-0001-000000000004',
  'Validate',
  'Verify email deliverability and data accuracy before sending to protect sender reputation and reduce bounce rates.',
  4,
  'Always validate before importing to HubSpot — bounces hurt your sending reputation. After import, monitor HubSpot''s Email Health dashboard and suppress invalid addresses.'
),
(
  '00000000-0000-0000-0001-000000000005',
  'Outreach',
  'Send personalized, multi-step email and LinkedIn sequences to your validated prospect list.',
  5,
  'Use HubSpot Sequences for 1:1 personalized outreach. Connect your inbox under Settings → Inbox. Enable open/click tracking and set up deal auto-creation on reply to capture pipeline automatically.'
),
(
  '00000000-0000-0000-0001-000000000006',
  'Engage',
  'Track conversations, book meetings, run discovery calls, and move deals through the pipeline to close.',
  6,
  'HubSpot''s Conversations inbox and Meeting Scheduler close the loop. Use Gong or Chorus for call coaching. Set deal rotting alerts and pipeline stage automation to keep deals moving.'
)
ON CONFLICT (id) DO NOTHING;

-- ─── Seed: Tools (Free tier) ─────────────────────────────────────────────────

INSERT INTO public.gtm_tier_tools (step_id, tier, tool_name, tool_url, monthly_cost, notes, order_index) VALUES
-- Source / Free
('00000000-0000-0000-0001-000000000001','free','Apollo.io Free','https://apollo.io',0,'200 export credits/mo, basic prospect search and filters',1),
('00000000-0000-0000-0001-000000000001','free','LinkedIn Manual','https://linkedin.com',0,'Organic prospect research — search by title, industry, location',2),
('00000000-0000-0000-0001-000000000001','free','Hunter.io Free','https://hunter.io',0,'25 email finds per month, domain search for company emails',3),
-- Source / Mid
('00000000-0000-0000-0001-000000000001','mid','Apollo.io Pro','https://apollo.io',49,'10,000 export credits/mo, advanced filters, CSV bulk export, sequences',1),
('00000000-0000-0000-0001-000000000001','mid','LinkedIn Sales Navigator','https://linkedin.com/sales',80,'Advanced prospect filters, lead recommendations, CRM sync',2),
('00000000-0000-0000-0001-000000000001','mid','Cognism','https://cognism.com',150,'GDPR-compliant B2B data — ideal for EU prospecting with verified mobile numbers',3),
-- Source / Pro
('00000000-0000-0000-0001-000000000001','pro','ZoomInfo Pro','https://zoominfo.com',500,'Unlimited contact + company data, buying intent signals, org charts',1),
('00000000-0000-0000-0001-000000000001','pro','Cognism Enterprise','https://cognism.com',600,'Full global database, Diamond-verified mobiles, intent data',2),
('00000000-0000-0000-0001-000000000001','pro','6sense','https://6sense.com',500,'AI-driven intent data, ICP scoring, account identification',3),

-- Scrape / Free
('00000000-0000-0000-0001-000000000002','free','Phantombuster Free','https://phantombuster.com',0,'5 min/day phantom execution — LinkedIn profile and company scrapers',1),
('00000000-0000-0000-0001-000000000002','free','Skrapp.io Free','https://skrapp.io',0,'100 email finds/mo from LinkedIn profiles and company sites',2),
('00000000-0000-0000-0001-000000000002','free','LinkedIn CSV Export','https://linkedin.com',0,'Export up to 1,000 connections manually via LinkedIn data export',3),
-- Scrape / Mid
('00000000-0000-0000-0001-000000000002','mid','Phantombuster Growth','https://phantombuster.com',70,'2 hrs/day execution, 50+ LinkedIn and web automation phantoms',1),
('00000000-0000-0000-0001-000000000002','mid','Skrapp.io','https://skrapp.io',49,'1,000 email finds/mo, team sharing, CRM export',2),
('00000000-0000-0000-0001-000000000002','mid','Scrapin.io','https://scrapin.io',49,'LinkedIn profile and company page scraper — structured JSON export',3),
-- Scrape / Pro
('00000000-0000-0000-0001-000000000002','pro','Clay','https://clay.com',149,'Waterfall enrichment engine — scrapes + enriches across 75+ sources in one workflow',1),
('00000000-0000-0000-0001-000000000002','pro','Phantombuster Business','https://phantombuster.com',200,'8 hrs/day execution, priority support, team collaboration',2),
('00000000-0000-0000-0001-000000000002','pro','Ocean.io','https://ocean.io',200,'AI-powered lookalike company discovery + bulk data export',3),

-- Enrich / Free
('00000000-0000-0000-0001-000000000003','free','Clearbit Connect','https://clearbit.com',0,'Free Gmail plugin — shows company + person data on hover in inbox',1),
('00000000-0000-0000-0001-000000000003','free','Apollo Enrichment Free','https://apollo.io',0,'Enrich up to 200 contacts/mo with job title, LinkedIn, phone',2),
('00000000-0000-0000-0001-000000000003','free','HubSpot Breeze Basic','https://hubspot.com',0,'Auto-fills company name, size, industry on HubSpot contact records',3),
-- Enrich / Mid
('00000000-0000-0000-0001-000000000003','mid','Clearbit Enrichment','https://clearbit.com',99,'Real-time API enrichment — 100+ data points per contact and company',1),
('00000000-0000-0000-0001-000000000003','mid','Apollo Enrich Pro','https://apollo.io',99,'Bulk enrich CSV lists — phone, LinkedIn, seniority, departments',2),
('00000000-0000-0000-0001-000000000003','mid','Datagma','https://datagma.com',49,'Real-time contact enrichment with mobile numbers and social profiles',3),
-- Enrich / Pro
('00000000-0000-0000-0001-000000000003','pro','Clay Enterprise','https://clay.com',400,'Automated enrichment workflows across 75+ sources — build custom waterfalls',1),
('00000000-0000-0000-0001-000000000003','pro','Clearbit Enterprise','https://clearbit.com',500,'Full API access, custom models, Salesforce + HubSpot native sync',2),
('00000000-0000-0000-0001-000000000003','pro','6sense Enrich','https://6sense.com',500,'Account-level enrichment with AI buying stage + intent scoring',3),

-- Validate / Free
('00000000-0000-0000-0001-000000000004','free','Hunter.io Verifier','https://hunter.io',0,'50 verifications/mo free — single and bulk email validation',1),
('00000000-0000-0000-0001-000000000004','free','NeverBounce Pay-Per-Use','https://neverbounce.com',0,'Pay-as-you-go at ~$0.008/email — no monthly commitment needed',2),
('00000000-0000-0000-0001-000000000004','free','MillionVerifier','https://millionverifier.com',0,'Pay-per-use at $4/1,000 emails — high accuracy catch-all detection',3),
-- Validate / Mid
('00000000-0000-0000-0001-000000000004','mid','NeverBounce','https://neverbounce.com',8,'$0.008/email in bulk — real-time API + bulk list cleaning',1),
('00000000-0000-0000-0001-000000000004','mid','ZeroBounce','https://zerobounce.net',16,'$0.016/email — email scoring, activity data, spam trap detection',2),
('00000000-0000-0000-0001-000000000004','mid','Kickbox','https://kickbox.com',5,'$0.005/email — deliverability scoring + sendex quality grade',3),
-- Validate / Pro
('00000000-0000-0000-0001-000000000004','pro','ZeroBounce Enterprise','https://zerobounce.net',200,'Unlimited validation, email finder, AI scoring, dedicated support',1),
('00000000-0000-0000-0001-000000000004','pro','BriteVerify','https://briteverify.com',150,'Enterprise-grade list hygiene — used by major ESPs and MAPs',2),
('00000000-0000-0000-0001-000000000004','pro','Kickbox Enterprise','https://kickbox.com',150,'Real-time API at scale, SLA, HIPAA-compliant, dedicated IP support',3),

-- Outreach / Free
('00000000-0000-0000-0001-000000000005','free','HubSpot Sequences Free','https://hubspot.com',0,'200 sequence enrollments/mo, email templates, basic open tracking',1),
('00000000-0000-0000-0001-000000000005','free','Mailchimp Free','https://mailchimp.com',0,'1,000 sends/mo — good for newsletter-style outreach and nurture',2),
('00000000-0000-0000-0001-000000000005','free','Mixmax Free','https://mixmax.com',0,'100 tracked emails/mo, email scheduling, Salesforce-lite features',3),
-- Outreach / Mid
('00000000-0000-0000-0001-000000000005','mid','HubSpot Sales Pro','https://hubspot.com',90,'Unlimited sequences, A/B testing, meeting links, deal pipeline automation',1),
('00000000-0000-0000-0001-000000000005','mid','Outreach.io','https://outreach.io',100,'Per seat — multi-channel sequences, AI email suggestions, analytics',2),
('00000000-0000-0000-0001-000000000005','mid','Salesloft','https://salesloft.com',75,'Per seat — cadences, dialer, LinkedIn steps, conversation intelligence',3),
-- Outreach / Pro
('00000000-0000-0000-0001-000000000005','pro','HubSpot Sales Enterprise','https://hubspot.com',150,'Custom objects, predictive lead scoring, conversation intelligence, SSO',1),
('00000000-0000-0000-0001-000000000005','pro','Outreach Enterprise','https://outreach.io',150,'Per seat — full AI forecasting, deal health scores, revenue intelligence',2),
('00000000-0000-0000-0001-000000000005','pro','Apollo Sequences Pro','https://apollo.io',99,'Unlimited sequences + LinkedIn + call steps, AI email writer, A/B tests',3),

-- Engage / Free
('00000000-0000-0000-0001-000000000006','free','HubSpot CRM Free','https://hubspot.com',0,'Unlimited contacts, deals, tasks, email tracking — full pipeline visibility',1),
('00000000-0000-0000-0001-000000000006','free','Calendly Free','https://calendly.com',0,'1 event type, unlimited bookings — embed in emails to book meetings instantly',2),
('00000000-0000-0000-0001-000000000006','free','Loom Free','https://loom.com',0,'25 videos/mo — record personalized video follow-ups to boost reply rates',3),
-- Engage / Mid
('00000000-0000-0000-0001-000000000006','mid','HubSpot Sales Pro','https://hubspot.com',90,'Full pipeline automation, conversation routing, sales analytics dashboard',1),
('00000000-0000-0000-0001-000000000006','mid','Calendly Teams','https://calendly.com',16,'Per seat — round-robin routing, team scheduling, CRM sync, reminders',2),
('00000000-0000-0000-0001-000000000006','mid','Gong','https://gong.io',100,'Per seat — records and analyzes calls, surfaces deal risks and next steps',3),
-- Engage / Pro
('00000000-0000-0000-0001-000000000006','pro','HubSpot Enterprise','https://hubspot.com',150,'Custom reporting, AI forecasting, conversation intelligence, deal scoring',1),
('00000000-0000-0000-0001-000000000006','pro','Gong Enterprise','https://gong.io',200,'Per seat — full revenue intelligence, CRM write-back, coaching workflows',2),
('00000000-0000-0000-0001-000000000006','pro','Chorus.ai','https://chorus.ai',100,'Per seat — call recording, transcript search, deal momentum scoring',3)

ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════════════════════════

-- Phase 4: Comment Routing System
-- Stores per-company routing rules for comment notifications

CREATE TABLE IF NOT EXISTS public.comment_routing (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  route_to          TEXT[] NOT NULL DEFAULT '{super_admin}',
  additional_emails TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comment_routing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comment_routing: open access" ON public.comment_routing;
CREATE POLICY "comment_routing: open access"
  ON public.comment_routing FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_comment_routing_company ON public.comment_routing(company_id);
