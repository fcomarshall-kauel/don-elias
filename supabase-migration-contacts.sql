-- ============================================================
-- Migration: Contact preferences per event type + frequent visitors
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Split contact_preference into two: one for packages, one for visits
alter table residents add column if not exists contact_for_packages text default 'whatsapp'
  check (contact_for_packages in ('whatsapp', 'citofono', 'llamada', 'ninguno'));
alter table residents add column if not exists contact_for_visits text default 'citofono'
  check (contact_for_visits in ('whatsapp', 'citofono', 'llamada', 'ninguno'));

-- Migrate existing contact_preference to both new columns
update residents set
  contact_for_packages = contact_preference,
  contact_for_visits = contact_preference
where contact_for_packages = 'whatsapp' or contact_for_visits = 'citofono';

-- Add schedule for nanas (e.g., "L-V 9-18")
alter table residents add column if not exists schedule text;
