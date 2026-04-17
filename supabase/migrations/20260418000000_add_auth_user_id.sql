-- Link training_users to Supabase auth users
ALTER TABLE training_users
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_training_users_auth_user_id
  ON training_users(auth_user_id);