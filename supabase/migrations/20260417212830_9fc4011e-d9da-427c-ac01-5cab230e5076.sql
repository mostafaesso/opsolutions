-- Add is_active and custom_domain to companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS custom_domain text;

-- Add quiz_score to training_completions (optional, 0-100)
ALTER TABLE public.training_completions
  ADD COLUMN IF NOT EXISTS quiz_score integer;

-- Add last_active_at to training_users
ALTER TABLE public.training_users
  ADD COLUMN IF NOT EXISTS last_active_at timestamp with time zone;

-- Trigger function to bump last_active_at on training_users when a completion is inserted
CREATE OR REPLACE FUNCTION public.bump_training_user_last_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.training_users
    SET last_active_at = now()
    WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bump_last_active ON public.training_completions;
CREATE TRIGGER trg_bump_last_active
AFTER INSERT ON public.training_completions
FOR EACH ROW
EXECUTE FUNCTION public.bump_training_user_last_active();

-- Allow training_users updates (for last_active_at trigger to work via RLS-bypassing definer, but also expose update policy for safety)
DROP POLICY IF EXISTS "Anyone can update training_users last_active" ON public.training_users;
CREATE POLICY "Anyone can update training_users last_active"
  ON public.training_users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);