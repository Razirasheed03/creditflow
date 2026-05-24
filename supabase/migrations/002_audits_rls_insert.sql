-- MVP: allow API inserts/updates when using publishable/anon key (service role bypasses RLS).
-- Run in Supabase SQL Editor if inserts fail with RLS errors.

create policy "Allow public insert audits"
  on public.audits
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow public update lead fields"
  on public.audits
  for update
  to anon, authenticated
  using (true)
  with check (true);
