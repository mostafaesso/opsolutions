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
