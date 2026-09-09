-- Idempotent fix: safe to run any number of times.
-- Run this in the Supabase SQL editor, then watch for any red error output.

alter table listings enable row level security;

drop policy if exists "public can insert listings" on listings;
create policy "public can insert listings"
  on listings for insert
  to anon
  with check (status = 'pending');

drop policy if exists "public can read approved listings" on listings;
create policy "public can read approved listings"
  on listings for select
  to anon
  using (status = 'approved');

-- Sanity check: this should list exactly the two policies above.
select policyname, cmd, roles from pg_policies where tablename = 'listings';
