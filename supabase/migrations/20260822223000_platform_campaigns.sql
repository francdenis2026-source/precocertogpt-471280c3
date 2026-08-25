-- Gestão de banners e propagandas da plataforma.
create table if not exists public.platform_campaigns (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'announcement' check (kind in ('announcement','advertisement')),
  placement text not null default 'top_bar' check (placement in ('top_bar')),
  title text not null check (char_length(trim(title)) between 3 and 120),
  subtitle text check (subtitle is null or char_length(subtitle) <= 180),
  image_url text,
  link_url text not null default '/buscar',
  link_label text not null default 'Saiba mais',
  theme text not null default 'indigo' check (theme in ('indigo','emerald','amber','slate')),
  priority integer not null default 0 check (priority between 0 and 999),
  is_active boolean not null default false,
  is_dismissible boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint platform_campaigns_period check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index if not exists platform_campaigns_public_schedule_idx
  on public.platform_campaigns (is_active, placement, priority desc, starts_at, ends_at);

alter table public.platform_campaigns enable row level security;
drop policy if exists platform_campaigns_public_read on public.platform_campaigns;
create policy platform_campaigns_public_read on public.platform_campaigns for select to public
using (
  is_active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at > now())
);
drop policy if exists platform_campaigns_admin_all on public.platform_campaigns;
create policy platform_campaigns_admin_all on public.platform_campaigns for all to authenticated
using (private.is_platform_admin()) with check (private.is_platform_admin());

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('campaigns','campaigns',true,8388608,array['image/png','image/jpeg','image/webp','image/avif'])
on conflict (id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists campaign_assets_public_read on storage.objects;
create policy campaign_assets_public_read on storage.objects for select to public using (bucket_id='campaigns');
drop policy if exists campaign_assets_admin_insert on storage.objects;
create policy campaign_assets_admin_insert on storage.objects for insert to authenticated with check (bucket_id='campaigns' and private.is_platform_admin());
drop policy if exists campaign_assets_admin_update on storage.objects;
create policy campaign_assets_admin_update on storage.objects for update to authenticated using (bucket_id='campaigns' and private.is_platform_admin()) with check (bucket_id='campaigns' and private.is_platform_admin());
drop policy if exists campaign_assets_admin_delete on storage.objects;
create policy campaign_assets_admin_delete on storage.objects for delete to authenticated using (bucket_id='campaigns' and private.is_platform_admin());

insert into public.platform_campaigns (kind,title,subtitle,image_url,link_url,link_label,theme,priority,is_active,is_dismissible,starts_at,ends_at)
select 'announcement','Festival do Açaí e Festival de Praia em Feijó','Pesquise e compare preços locais','/banner-festival-acai-feijo-2026.png','/buscar','Comparar preços','indigo',100,true,true,'2026-08-21T00:00:00-05:00','2026-08-25T00:00:00-05:00'
where not exists (select 1 from public.platform_campaigns where title='Festival do Açaí e Festival de Praia em Feijó');

grant select on public.platform_campaigns to anon, authenticated;
grant insert, update, delete on public.platform_campaigns to authenticated;
