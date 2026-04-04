-- ============================================================
-- Don Elias / PorterOS — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. packages
create table packages (
  id            uuid primary key default gen_random_uuid(),
  recipient_apt text not null,
  type          text not null check (type in ('food','normal','other','supermercado')),
  provider      text,
  note          text,
  received_at   timestamptz not null default now(),
  received_by   text not null,
  delivered_at  timestamptz,
  delivered_to  text,
  status        text not null default 'pending' check (status in ('pending','delivered')),
  notified_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_packages_status on packages(status);
create index idx_packages_apt on packages(recipient_apt);

-- 2. whatsapp_messages
create table whatsapp_messages (
  id             uuid primary key default gen_random_uuid(),
  apt            text not null,
  text           text not null,
  sent_at        timestamptz not null default now(),
  package_id     uuid references packages(id) on delete set null,
  event_type     text not null check (event_type in ('notify','delivered','incoming')),
  direction      text not null default 'outgoing' check (direction in ('outgoing','incoming')),
  phone_number   text,
  wa_message_id  text,
  status         text default 'sending' check (status in ('sending','sent','delivered','read','failed')),
  mock           boolean default false,
  created_at     timestamptz not null default now()
);

create index idx_wa_messages_apt on whatsapp_messages(apt);
create index idx_wa_messages_wa_id on whatsapp_messages(wa_message_id);

-- 3. visits
create table visits (
  id                   uuid primary key default gen_random_uuid(),
  visitor_name         text not null,
  destination_apt      text not null,
  type                 text not null check (type in ('personal','empleada','mantencion')),
  company_or_work_type text,
  checked_in_at        timestamptz not null default now(),
  checked_out_at       timestamptz,
  status               text not null default 'active' check (status in ('active','checked-out')),
  created_at           timestamptz not null default now()
);

create index idx_visits_status on visits(status);

-- 4. novedades
create table novedades (
  id                uuid primary key default gen_random_uuid(),
  text              text not null,
  category          text not null check (category in ('urgente','informativo','tarea')),
  created_at        timestamptz not null default now(),
  author            text not null,
  is_handover_entry boolean not null default false
);

create index idx_novedades_created on novedades(created_at desc);

-- 5. app_settings (single row)
create table app_settings (
  id              int primary key default 1 check (id = 1),
  concierger_name text not null default 'Claudio',
  building_name   text not null default 'Gran Bretaña',
  updated_at      timestamptz not null default now()
);

insert into app_settings default values on conflict do nothing;

-- RLS (permissive for MVP)
alter table packages enable row level security;
alter table whatsapp_messages enable row level security;
alter table visits enable row level security;
alter table novedades enable row level security;
alter table app_settings enable row level security;

create policy "allow_all" on packages for all using (true) with check (true);
create policy "allow_all" on whatsapp_messages for all using (true) with check (true);
create policy "allow_all" on visits for all using (true) with check (true);
create policy "allow_all" on novedades for all using (true) with check (true);
create policy "allow_all" on app_settings for all using (true) with check (true);

-- Realtime only on whatsapp_messages
alter publication supabase_realtime add table whatsapp_messages;
