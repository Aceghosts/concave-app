-- Run in Supabase SQL Editor
create table if not exists past_campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid,
  name text not null,
  channel text,
  outcome_metrics jsonb not null default '{}'::jsonb,
  creative_traits jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists past_campaigns_client_idx on past_campaigns (client_id);
create index if not exists past_campaigns_created_at_idx on past_campaigns (created_at desc);

alter table past_campaigns enable row level security;
-- Server uses the service role key, which bypasses RLS. No anon policies on purpose.
