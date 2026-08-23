-- Run in Supabase SQL Editor
create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  campaign_name text not null,
  client_id uuid,
  overall_score numeric,
  grade text,
  intake jsonb not null,
  report jsonb not null,
  created_at timestamptz default now()
);

create index if not exists analyses_created_at_idx on analyses (created_at desc);

alter table analyses enable row level security;
-- Server uses the service role key, which bypasses RLS. No anon policies on purpose.
