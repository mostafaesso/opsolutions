create table if not exists quiz_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references training_users(id) on delete cascade,
  card_id text not null,
  score integer not null,
  total integer not null,
  passed boolean not null,
  attempted_at timestamptz default now(),
  unique(user_id, card_id)
);
alter table quiz_scores enable row level security;
create policy "Users can manage own scores" on quiz_scores for all using (true);
