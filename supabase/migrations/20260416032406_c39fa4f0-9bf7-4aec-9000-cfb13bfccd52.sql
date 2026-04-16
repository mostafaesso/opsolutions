-- Create training_users table
CREATE TABLE public.training_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company_slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (email, company_slug)
);

-- Create training_completions table
CREATE TABLE public.training_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.training_users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, card_id)
);

-- Enable RLS
ALTER TABLE public.training_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_completions ENABLE ROW LEVEL SECURITY;

-- Training users: anyone can register and read
CREATE POLICY "Anyone can register" ON public.training_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read users by company" ON public.training_users FOR SELECT USING (true);

-- Training completions: anyone can insert/read/delete
CREATE POLICY "Anyone can insert completions" ON public.training_completions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read completions" ON public.training_completions FOR SELECT USING (true);
CREATE POLICY "Anyone can delete completions" ON public.training_completions FOR DELETE USING (true);