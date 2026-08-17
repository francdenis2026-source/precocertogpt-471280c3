alter table public.establishments add column if not exists is_demo boolean not null default false;
alter table public.merchants add column if not exists is_demo boolean not null default false;

create or replace function public.admin_save_establishment(_id uuid default null,_name text default null,_neighborhood text default null,_kind text default null,_slug text default null,_short_description text default null,_logo_url text default null,_is_verified boolean default false,_is_demo boolean default false) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_slug text;
begin
 if (select auth.uid()) is null or not private.is_platform_admin() then raise exception 'Acesso negado' using errcode='42501'; end if;
 if length(trim(coalesce(_name,'')))<2 then raise exception 'Nome do estabelecimento é obrigatório'; end if;
 v_slug:=coalesce(nullif(trim(_slug),''),lower(regexp_replace(extensions.unaccent(trim(_name)),'[^a-zA-Z0-9]+','-','g'))); v_slug:=trim(both '-' from v_slug);
 if _id is null then
  if exists(select 1 from public.establishments where slug=v_slug) then v_slug:=v_slug||'-'||substr(gen_random_uuid()::text,1,8); end if;
  insert into public.establishments(name,neighborhood,kind,slug,short_description,logo_url,is_verified,verified_at,is_demo) values(trim(_name),nullif(trim(coalesce(_neighborhood,'')),''),nullif(trim(coalesce(_kind,'')),''),v_slug,nullif(trim(coalesce(_short_description,'')),''),nullif(trim(coalesce(_logo_url,'')),''),coalesce(_is_verified,false),case when _is_verified then now() else null end,coalesce(_is_demo,false)) returning id into v_id;
 else
  if exists(select 1 from public.establishments where slug=v_slug and id<>_id) then raise exception 'Já existe outro estabelecimento com este slug'; end if;
  update public.establishments set name=trim(_name),neighborhood=nullif(trim(coalesce(_neighborhood,'')),''),kind=nullif(trim(coalesce(_kind,'')),''),slug=v_slug,short_description=nullif(trim(coalesce(_short_description,'')),''),logo_url=nullif(trim(coalesce(_logo_url,'')),''),is_verified=coalesce(_is_verified,false),verified_at=case when _is_verified then coalesce(verified_at,now()) else null end,is_demo=coalesce(_is_demo,false) where id=_id returning id into v_id;
  if v_id is null then raise exception 'Estabelecimento não encontrado'; end if;
 end if;
 insert into public.platform_audit_log(user_id,action,entity_type,entity_id,after_data) values((select auth.uid()),case when _id is null then 'establishment_created' else 'establishment_updated' end,'establishment',v_id::text,jsonb_build_object('name',_name,'kind',_kind,'verified',_is_verified,'is_demo',_is_demo)); return v_id;
end;$$;

create or replace function public.admin_delete_product(_product_id uuid,_confirm_name text) returns boolean language plpgsql security definer set search_path='' as $$
declare v_name text;
begin
 if (select auth.uid()) is null or not private.is_platform_admin() then raise exception 'Acesso negado' using errcode='42501'; end if;
 select name into v_name from public.products where id=_product_id; if v_name is null then raise exception 'Produto não encontrado'; end if; if trim(coalesce(_confirm_name,''))<>v_name then raise exception 'Confirmação inválida'; end if;
 insert into public.platform_audit_log(user_id,action,entity_type,entity_id,before_data) values((select auth.uid()),'product_deleted','product',_product_id::text,jsonb_build_object('name',v_name)); delete from public.products where id=_product_id; return true;
end;$$;

create or replace function public.admin_delete_product_price(_product_id uuid,_establishment_id uuid) returns integer language plpgsql security definer set search_path='' as $$
declare v_count integer;
begin
 if (select auth.uid()) is null or not private.is_platform_admin() then raise exception 'Acesso negado' using errcode='42501'; end if;
 delete from public.prices where product_id=_product_id and establishment_id=_establishment_id; get diagnostics v_count=row_count;
 insert into public.platform_audit_log(user_id,action,entity_type,entity_id,metadata) values((select auth.uid()),'store_product_removed','price',_product_id::text,jsonb_build_object('establishment_id',_establishment_id,'removed_rows',v_count)); return v_count;
end;$$;

create or replace function public.admin_delete_establishment(_establishment_id uuid,_confirm_name text,_delete_demo_operation boolean default false) returns boolean language plpgsql security definer set search_path='' as $$
declare v_est public.establishments%rowtype; v_merchant public.merchants%rowtype;
begin
 if (select auth.uid()) is null or not private.is_platform_admin() then raise exception 'Acesso negado' using errcode='42501'; end if;
 select * into v_est from public.establishments where id=_establishment_id; if v_est.id is null then raise exception 'Estabelecimento não encontrado'; end if; if trim(coalesce(_confirm_name,''))<>v_est.name then raise exception 'Confirmação inválida'; end if;
 select * into v_merchant from public.merchants where establishment_id=_establishment_id limit 1;
 if v_merchant.id is not null and _delete_demo_operation then
  if not v_est.is_demo or not v_merchant.is_demo then raise exception 'A exclusão completa da operação só é permitida para registros marcados como demonstração'; end if;
  delete from public.payments where merchant_id=v_merchant.id; delete from public.orders where merchant_id=v_merchant.id; delete from public.merchants where id=v_merchant.id;
 elsif v_merchant.id is not null then update public.merchants set establishment_id=null where id=v_merchant.id; end if;
 insert into public.platform_audit_log(user_id,action,entity_type,entity_id,before_data,metadata) values((select auth.uid()),case when v_est.is_demo then 'demo_establishment_deleted' else 'establishment_deleted' end,'establishment',v_est.id::text,jsonb_build_object('name',v_est.name,'kind',v_est.kind,'is_demo',v_est.is_demo),jsonb_build_object('delete_demo_operation',_delete_demo_operation)); delete from public.establishments where id=_establishment_id; return true;
end;$$;

create or replace function public.admin_establishment_catalog(_establishment_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if (select auth.uid()) is null or not private.is_platform_admin() then raise exception 'Acesso negado' using errcode='42501'; end if;
 select coalesce(jsonb_agg(row_data order by lower(row_data->>'name')),'[]'::jsonb) into result from (select jsonb_build_object('product_id',p.id,'name',p.name,'brand',p.brand,'category',p.category,'size',p.size,'unit',p.unit,'barcode',p.barcode,'slug',p.slug,'image_url',p.image_url,'price_id',pr.id,'value',pr.value,'previous_value',pr.previous_value,'captured_at',pr.captured_at,'establishment_id',e.id,'establishment_name',e.name) row_data from public.establishments e join lateral (select distinct on (x.product_id) x.* from public.prices x where x.establishment_id=e.id order by x.product_id,x.captured_at desc nulls last) pr on true join public.products p on p.id=pr.product_id where e.id=_establishment_id) q; return result;
end;$$;

grant execute on function public.admin_delete_product(uuid,text) to authenticated;
grant execute on function public.admin_delete_product_price(uuid,uuid) to authenticated;
grant execute on function public.admin_delete_establishment(uuid,text,boolean) to authenticated;
grant execute on function public.admin_establishment_catalog(uuid) to authenticated;
