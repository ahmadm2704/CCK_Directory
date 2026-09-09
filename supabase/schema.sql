-- CCK Directory schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text not null,
  contact_type text not null check (contact_type in ('phone', 'whatsapp', 'phone_whatsapp', 'email')),
  contact_value text not null,
  photo_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists listings_status_idx on listings (status);
create index if not exists listings_category_idx on listings (category);
create index if not exists listings_created_at_idx on listings (created_at desc);

alter table listings enable row level security;

-- Anyone can submit a listing (it lands as pending, invisible until approved).
create policy "public can insert listings"
  on listings for insert
  to anon
  with check (status = 'pending');

-- Anyone can read approved listings only.
create policy "public can read approved listings"
  on listings for select
  to anon
  using (status = 'approved');

-- No public update/delete. Admin moderation goes through the service-role key
-- from server-side API routes, which bypasses RLS entirely.
