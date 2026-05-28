-- Supabase schema for BugHunter AI

-- users table is managed by Supabase auth; add reports table
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  summary text,
  analysis text,
  severity text,
  created_at timestamptz default now()
);
