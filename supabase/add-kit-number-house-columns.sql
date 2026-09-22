-- Migration: add optional "Kit Number" and "House" fields to listings.
-- Purely additive — safe to run any number of times, does not touch
-- existing data or drop anything.

alter table listings add column if not exists kit_number text;
alter table listings add column if not exists house text;

-- Sanity check: should show the two new columns.
select column_name, data_type
from information_schema.columns
where table_name = 'listings' and column_name in ('kit_number', 'house');
