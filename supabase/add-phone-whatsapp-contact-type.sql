-- Migration: allow "phone_whatsapp" as a contact_type value
-- (a single number that's both the phone and WhatsApp contact).
-- Safe to run once against your existing database. Finds and drops
-- whatever the contact_type check constraint is actually named,
-- rather than assuming the default Postgres naming.

do $$
declare
  c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    where rel.relname = 'listings'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%contact_type%'
  loop
    execute format('alter table listings drop constraint %I', c.conname);
  end loop;
end $$;

alter table listings
  add constraint listings_contact_type_check
  check (contact_type in ('phone', 'whatsapp', 'phone_whatsapp', 'email'));

-- Sanity check: should show the new constraint allowing phone_whatsapp.
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'listings'::regclass and contype = 'c';
