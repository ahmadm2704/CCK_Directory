-- Migration: "Charity / Welfare" section — good deeds by Kohatians.
-- Purely additive and idempotent: creates a NEW table and policies, and seeds the
-- initial names only if they are not already there. Does not touch, alter or
-- delete the existing `listings` table or any data. Safe to run more than once.

create extension if not exists "pgcrypto";

create table if not exists welfare_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kit_number text,
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists welfare_entries_status_idx on welfare_entries (status);
create index if not exists welfare_entries_created_at_idx on welfare_entries (created_at);

alter table welfare_entries enable row level security;

-- Anyone can suggest an entry (lands as pending, invisible until approved).
drop policy if exists "public can insert welfare entries" on welfare_entries;
create policy "public can insert welfare entries"
  on welfare_entries for insert
  to anon
  with check (status = 'pending');

-- Anyone can read approved entries only.
drop policy if exists "public can read approved welfare entries" on welfare_entries;
create policy "public can read approved welfare entries"
  on welfare_entries for select
  to anon
  using (status = 'approved');

-- Initial list (approved). created_at is staggered so they keep this order;
-- the page sorts oldest-first, so new submissions appear after these.
insert into welfare_entries (name, kit_number, description, status, created_at)
select v.name, v.kit_number, v.description, 'approved',
       timestamptz '2026-01-01 00:00:00+00' + (v.pos * interval '1 minute')
from (values
  (1,  'Work by Kohatians Foundation', null, ''),
  (2,  'Cdr Mahmood ur Rehman', null, ''),
  (3,  'Dr Altaf Qadir Khattak', null, ''),
  (4,  'Dr Tariq Bangash', null, ''),
  (5,  'Dr Samad Wazir', null, ''),
  (6,  'Admiral Asif Sandila', null, ''),
  (7,  'Shehzad Qasim', null, ''),
  (8,  'Sir Nisar Ahmed', null, ''),
  (9,  'Saeed Ullah Shah', null, ''),
  (10, 'Shahwaz Baloch', null, ''),
  (11, 'Professor Ifthithar Uddin', null, ''),
  (12, 'Professor Abid Jamil', null, ''),
  (13, 'Dr. Muhammad Farooq Khan', '289', ''),
  (14, 'Shibli Faraz, Zahid Abass, Ishaq Hussain, Dr. Yahya, Ihsan Ghani', null,
       'Laid the foundations for starting the Kohatians Welfare Fund, which became the Kohatians Foundation (KF) in 2010.'),
  (15, 'Ikram Ghani, Zulfiqar Ali, Mehmood Noor, Taimur Shah, Khalid Niazi, Abdullah Shah, Iqbal Younas, Mohsin Aziz, Nisar and scores of Kohatians', null,
       'Nurtured and sustained the Kohatians Foundation (KF).'),
  (16, 'Abdul Hameed Qureshi', null, ''),
  (17, 'Imtiaz Baluch', null, ''),
  (18, 'Ahmed Rasool Bangash', null, ''),
  (19, 'Senator Mohsin Aziz', null,
       'Services in the field of education for the underprivileged of Peshawar, and philanthropy in the health sector.')
) as v(pos, name, kit_number, description)
where not exists (select 1 from welfare_entries w where w.name = v.name);

-- Sanity check: should list the seeded entries in order.
select name, kit_number, status from welfare_entries order by created_at;
