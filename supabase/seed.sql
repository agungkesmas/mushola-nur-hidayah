-- Seed data for Mushola Nur Hidayah
-- Run after the initial migration. Safe to re-run.

-- Ensure the single mosque_profile row reflects the canonical branding
update public.mosque_profile
set
  name        = 'Mushola Nur Hidayah',
  address     = 'Griya Lurah Asri',
  description = 'Tempat ibadah jamaah Griya Lurah Asri untuk sholat berjamaah, kajian rutin, dan kegiatan keislaman lainnya.',
  default_timezone = 'Asia/Jakarta',
  updated_at  = now()
where name = 'Mushola Nur Hidayah' or address = 'Griya Lurah Asri';

-- Insert if no row exists yet
insert into public.mosque_profile (name, address, description, default_timezone)
select 'Mushola Nur Hidayah',
       'Griya Lurah Asri',
       'Tempat ibadah jamaah Griya Lurah Asri untuk sholat berjamaah, kajian rutin, dan kegiatan keislaman lainnya.',
       'Asia/Jakarta'
where not exists (select 1 from public.mosque_profile limit 1);
