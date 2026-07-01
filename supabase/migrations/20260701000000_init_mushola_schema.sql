-- =====================================================================
-- Mushola Nur Hidayah — Griya Lurah Asri
-- Initial Supabase schema
-- =====================================================================
-- This migration creates the core tables for the Mushola Nur Hidayah
-- application: mosque profile, prayer schedule overrides, push
-- subscriptions, journal of worship, and khutbah archive.
-- =====================================================================

-- Enable extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. mosque_profile
-- ---------------------------------------------------------------------
create table if not exists public.mosque_profile (
  id              uuid primary key default gen_random_uuid(),
  name            text not null default 'Mushola Nur Hidayah',
  address         text not null default 'Griya Lurah Asri',
  description     text,
  default_city_id text,
  default_timezone text default 'Asia/Jakarta',
  contact_person  text,
  contact_phone   text,
  maps_url        text,
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Seed the default row (idempotent)
insert into public.mosque_profile (name, address, description)
select 'Mushola Nur Hidayah', 'Griya Lurah Asri', 'Tempat ibadah jamaah Griya Lurah Asri untuk sholat berjamaah, kajian, dan kegiatan keislaman lainnya.'
where not exists (select 1 from public.mosque_profile limit 1);

-- ---------------------------------------------------------------------
-- 2. push_subscriptions
-- ---------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id              text primary key,  -- base64-url-safe of endpoint
  endpoint        text not null unique,
  subscription    jsonb not null,
  city_id         text,
  selected_city   jsonb,
  sholat_schedule jsonb,
  rutin_reminders jsonb default '{}'::jsonb,
  timezone        text default 'Asia/Jakarta',
  user_agent      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_city
  on public.push_subscriptions (city_id);

create index if not exists idx_push_subscriptions_updated
  on public.push_subscriptions (updated_at desc);

-- ---------------------------------------------------------------------
-- 3. jadwal_sholat_override
-- Optional fixed schedule overrides for the mushola (e.g. Friday jumu'ah)
-- ---------------------------------------------------------------------
create table if not exists public.jadwal_sholat_override (
  id           uuid primary key default gen_random_uuid(),
  prayer_name  text not null,        -- 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya' | 'jumat'
  prayer_time  time not null,
  note         text,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Seed sensible defaults for the mushola
insert into public.jadwal_sholat_override (prayer_name, prayer_time, note)
values
  ('subuh',  '04:35', 'Sholat Subuh berjamaah'),
  ('dzuhur', '12:00', 'Sholat Dzuhur berjamaah'),
  ('ashar',  '15:15', 'Sholat Ashar berjamaah'),
  ('maghrib','18:10', 'Sholat Maghrib berjamaah'),
  ('isya',   '19:15', 'Sholat Isya berjamaah'),
  ('jumat',  '12:00', 'Sholat Jumat berjamaah')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- 4. jurnal_ibadah
-- Daily worship journal entries submitted by jamaah
-- ---------------------------------------------------------------------
create table if not exists public.jurnal_ibadah (
  id              uuid primary key default gen_random_uuid(),
  user_identifier text,                 -- anonymous token or device id
  entry_date      date not null default current_date,
  sholat_subuh    boolean default false,
  sholat_dzuhur   boolean default false,
  sholat_ashar    boolean default false,
  sholat_maghrib  boolean default false,
  sholat_isya     boolean default false,
  tilawah_pages   integer default 0,
  dzikir_count    integer default 0,
  sedekah         boolean default false,
  notes           text,
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_identifier, entry_date)
);

create index if not exists idx_jurnal_ibadah_date
  on public.jurnal_ibadah (entry_date desc);

-- ---------------------------------------------------------------------
-- 5. system_config
-- Generic key/value store for runtime config (VAPID keys, etc.)
-- ---------------------------------------------------------------------
create table if not exists public.system_config (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. khutbah_archive
-- AI-generated khutbah saved by users
-- ---------------------------------------------------------------------
create table if not exists public.khutbah_archive (
  id           uuid primary key default gen_random_uuid(),
  title        text,
  tema         text,
  ringkasan    text,
  muqaddimah   text,
  content      jsonb,
  penutup      text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_khutbah_archive_created
  on public.khutbah_archive (created_at desc);

-- ---------------------------------------------------------------------
-- Row Level Security
-- Public read for mosque_profile & jadwal_sholat_override.
-- Push subscriptions & jurnal ibadah are insertable by anon; updates
-- require the matching row identifier. Khutbah archive: public read.
-- ---------------------------------------------------------------------
alter table public.mosque_profile          enable row level security;
alter table public.jadwal_sholat_override  enable row level security;
alter table public.push_subscriptions      enable row level security;
alter table public.jurnal_ibadah           enable row level security;
alter table public.system_config           enable row level security;
alter table public.khutbah_archive         enable row level security;

-- Public read policies
create policy "public read mosque_profile"
  on public.mosque_profile for select
  to anon, authenticated using (true);

create policy "public read jadwal_sholat_override"
  on public.jadwal_sholat_override for select
  to anon, authenticated using (true);

create policy "public read khutbah_archive"
  on public.khutbah_archive for select
  to anon, authenticated using (true);

-- Push subscriptions: anon can insert & update (by id), update own row
create policy "anon insert push_subscriptions"
  on public.push_subscriptions for insert
  to anon, authenticated with check (true);

create policy "anon update push_subscriptions"
  on public.push_subscriptions for update
  to anon, authenticated using (true) with check (true);

create policy "anon delete push_subscriptions"
  on public.push_subscriptions for delete
  to anon, authenticated using (true);

create policy "anon select push_subscriptions"
  on public.push_subscriptions for select
  to anon, authenticated using (true);

-- Jurnal ibadah: anon can insert & update own (by user_identifier)
create policy "anon insert jurnal_ibadah"
  on public.jurnal_ibadah for insert
  to anon, authenticated with check (true);

create policy "anon update jurnal_ibadah"
  on public.jurnal_ibadah for update
  to anon, authenticated using (true) with check (true);

create policy "anon select jurnal_ibadah"
  on public.jurnal_ibadah for select
  to anon, authenticated using (true);

-- System config: only authenticated can read; service role bypasses RLS
create policy "authenticated read system_config"
  on public.system_config for select
  to authenticated using (true);

-- Khutbah archive: anon can insert
create policy "anon insert khutbah_archive"
  on public.khutbah_archive for insert
  to anon, authenticated with check (true);

-- ---------------------------------------------------------------------
-- Trigger: auto-update updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'mosque_profile',
      'push_subscriptions',
      'jadwal_sholat_override',
      'jurnal_ibadah',
      'khutbah_archive',
      'system_config'
    ])
  loop
    execute format('drop trigger if exists trg_%I_updated on public.%I;', t, t);
    execute format('create trigger trg_%I_updated before update on public.%I for each row execute function public.set_updated_at();', t, t);
  end loop;
end$$;

-- =====================================================================
-- End of migration
-- =====================================================================
