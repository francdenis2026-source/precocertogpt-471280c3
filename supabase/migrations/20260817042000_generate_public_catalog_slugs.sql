create or replace function public.slugify_catalog_text(input text)
returns text
language sql
immutable
set search_path = public, extensions
as $$
  select trim(both '-' from regexp_replace(lower(extensions.unaccent(coalesce(input,''))), '[^a-z0-9]+', '-', 'g'));
$$;

with ranked as (
  select id,
         public.slugify_catalog_text(name) as base_slug,
         row_number() over (partition by public.slugify_catalog_text(name) order by created_at nulls last, id) as rn
  from public.products
  where nullif(trim(slug),'') is null
), prepared as (
  select id,
         case
           when base_slug = '' then 'produto-' || left(id::text,8)
           when rn = 1 then base_slug
           else base_slug || '-' || rn::text
         end as new_slug
  from ranked
)
update public.products p
set slug = prepared.new_slug
from prepared
where p.id = prepared.id;

with ranked as (
  select id,
         public.slugify_catalog_text(name) as base_slug,
         row_number() over (partition by public.slugify_catalog_text(name) order by created_at nulls last, id) as rn
  from public.establishments
  where nullif(trim(slug),'') is null
), prepared as (
  select id,
         case
           when base_slug = '' then 'estabelecimento-' || left(id::text,8)
           when rn = 1 then base_slug
           else base_slug || '-' || rn::text
         end as new_slug
  from ranked
)
update public.establishments e
set slug = prepared.new_slug
from prepared
where e.id = prepared.id;
