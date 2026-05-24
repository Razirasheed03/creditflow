-- CreditFlow audits table (run in Supabase SQL editor if not already created)

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  share_id text not null unique,
  audit_data jsonb not null,
  result_data jsonb not null,
  estimated_savings jsonb not null,
  email text,
  company_name text,
  role text,
  created_at timestamptz not null default now()
);

create index if not exists audits_share_id_idx on public.audits (share_id);
create index if not exists audits_created_at_idx on public.audits (created_at desc);

-- MVP: allow service role full access; tighten with RLS before production launch
alter table public.audits enable row level security;

create policy "Public read by share_id"
  on public.audits
  for select
  using (share_id is not null);
