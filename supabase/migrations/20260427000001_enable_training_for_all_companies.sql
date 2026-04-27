-- Enable training (doc + video) for all companies that currently have it disabled.
-- New companies already default to true via column defaults.
UPDATE public.company_settings
SET
  training_doc_enabled = true,
  training_video_enabled = true,
  updated_at = now()
WHERE training_doc_enabled = false
   OR training_video_enabled = false;

-- Also ensure any company without a settings row gets one with training enabled
-- (covers companies created before this migration that never triggered a settings upsert)
INSERT INTO public.company_settings (company_slug, training_doc_enabled, training_video_enabled)
SELECT slug, true, true
FROM public.companies
WHERE slug NOT IN (SELECT company_slug FROM public.company_settings)
ON CONFLICT (company_slug) DO NOTHING;
