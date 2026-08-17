create index if not exists prices_establishment_product_captured_idx on public.prices(establishment_id, product_id, captured_at desc);
create index if not exists prices_product_establishment_captured_idx on public.prices(product_id, establishment_id, captured_at desc);
create index if not exists prices_captured_at_idx on public.prices(captured_at desc);
create index if not exists products_category_name_idx on public.products(category, name);
create index if not exists establishments_name_idx on public.establishments(name);

create or replace function public.admin_catalog_overview()
returns jsonb
language plpgsql
stable security definer
set search_path=''
as $$
declare result jsonb; begin
  if (select auth.uid()) is null or not private.is_platform_admin() then raise exception 'Acesso negado' using errcode='42501'; end if;
  select jsonb_build_object(
    'productCount',(select count(*) from public.products),
    'establishmentCount',(select count(*) from public.establishments),
    'verifiedCount',(select count(*) from public.establishments where is_verified=true),
    'demoCount',(select count(*) from public.establishments where coalesce(is_demo,false)=true),
    'establishments',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'name',e.name,'neighborhood',e.neighborhood,'kind',e.kind,'slug',e.slug,'is_verified',e.is_verified,'is_demo',coalesce(e.is_demo,false),'product_count',(select count(distinct p.product_id) from public.prices p where p.establishment_id=e.id)) order by lower(e.name)) from public.establishments e),'[]'::jsonb)
  ) into result;
  return result;
end;$$;

grant execute on function public.admin_catalog_overview() to authenticated;
