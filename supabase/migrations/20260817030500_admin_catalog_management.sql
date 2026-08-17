-- Gestão administrativa do catálogo e imagens de produtos.
create policy "admin_product_images_insert" on storage.objects for insert to authenticated with check (bucket_id='products' and private.is_platform_admin());
create policy "admin_product_images_update" on storage.objects for update to authenticated using (bucket_id='products' and private.is_platform_admin()) with check (bucket_id='products' and private.is_platform_admin());
create policy "admin_product_images_delete" on storage.objects for delete to authenticated using (bucket_id='products' and private.is_platform_admin());
create policy "public_product_images_read" on storage.objects for select to public using (bucket_id='products');

create or replace function public.admin_catalog_snapshot() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if (select auth.uid()) is null or not private.is_platform_admin() then raise exception 'Acesso negado' using errcode='42501'; end if;
 select jsonb_build_object(
  'products',coalesce((select jsonb_agg(x order by lower(x->>'name')) from (select jsonb_build_object('id',p.id,'name',p.name,'brand',p.brand,'category',p.category,'size',p.size,'unit',p.unit,'barcode',p.barcode,'slug',p.slug,'image_url',p.image_url,'created_at',p.created_at,'store_count',(select count(distinct pr.establishment_id) from public.prices pr where pr.product_id=p.id),'latest_price',(select pr.value from public.prices pr where pr.product_id=p.id order by pr.captured_at desc nulls last limit 1),'latest_update',(select max(pr.captured_at) from public.prices pr where pr.product_id=p.id)) x from public.products p) q),'[]'::jsonb),
  'establishments',coalesce((select jsonb_agg(x order by lower(x->>'name')) from (select jsonb_build_object('id',e.id,'name',e.name,'neighborhood',e.neighborhood,'kind',e.kind,'slug',e.slug,'is_verified',e.is_verified,'logo_url',e.logo_url,'short_description',e.short_description,'address',e.address,'latitude',e.latitude,'longitude',e.longitude,'created_at',e.created_at,'product_count',(select count(distinct pr.product_id) from public.prices pr where pr.establishment_id=e.id),'last_price_update',(select max(pr.captured_at) from public.prices pr where pr.establishment_id=e.id)) x from public.establishments e) q),'[]'::jsonb),
  'coverageGaps',coalesce((with presence as(select distinct product_id,establishment_id from public.prices),popularity as(select product_id,count(*) store_count from presence group by product_id),candidates as(select e.id establishment_id,e.name establishment_name,p.id product_id,p.name product_name,p.category,p.brand,pop.store_count,(select min(pr.value) from public.prices pr where pr.product_id=p.id) reference_price from public.establishments e cross join public.products p join popularity pop on pop.product_id=p.id and pop.store_count>0 where not exists(select 1 from presence x where x.establishment_id=e.id and x.product_id=p.id)) select jsonb_agg(jsonb_build_object('establishment_id',establishment_id,'establishment_name',establishment_name,'product_id',product_id,'product_name',product_name,'category',category,'brand',brand,'stores_with_product',store_count,'reference_price',reference_price) order by store_count desc,lower(product_name),lower(establishment_name)) from(select * from candidates order by store_count desc,product_name limit 1000)g),'[]'::jsonb)
 ) into result; return result;
end;$$;

create or replace function public.admin_save_product(_id uuid default null,_name text default null,_brand text default null,_category text default null,_size text default null,_unit text default null,_barcode text default null,_slug text default null,_image_url text default null) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;v_slug text;
begin
 if (select auth.uid()) is null or not private.is_platform_admin() then raise exception 'Acesso negado' using errcode='42501'; end if;
 if length(trim(coalesce(_name,'')))<2 then raise exception 'Nome do produto é obrigatório'; end if;
 v_slug:=coalesce(nullif(trim(_slug),''),lower(regexp_replace(extensions.unaccent(trim(_name)),'[^a-zA-Z0-9]+','-','g')));v_slug:=trim(both '-' from v_slug);
 if _id is null then if exists(select 1 from public.products where slug=v_slug) then v_slug:=v_slug||'-'||substr(gen_random_uuid()::text,1,8);end if;insert into public.products(name,brand,category,size,unit,barcode,slug,image_url) values(trim(_name),nullif(trim(coalesce(_brand,'')),''),nullif(trim(coalesce(_category,'')),''),nullif(trim(coalesce(_size,'')),''),nullif(trim(coalesce(_unit,'')),''),nullif(trim(coalesce(_barcode,'')),''),v_slug,nullif(trim(coalesce(_image_url,'')),'')) returning id into v_id;
 else if exists(select 1 from public.products where slug=v_slug and id<>_id) then raise exception 'Já existe outro produto com este slug';end if;update public.products set name=trim(_name),brand=nullif(trim(coalesce(_brand,'')),''),category=nullif(trim(coalesce(_category,'')),''),size=nullif(trim(coalesce(_size,'')),''),unit=nullif(trim(coalesce(_unit,'')),''),barcode=nullif(trim(coalesce(_barcode,'')),''),slug=v_slug,image_url=nullif(trim(coalesce(_image_url,'')),'') where id=_id returning id into v_id;if v_id is null then raise exception 'Produto não encontrado';end if;end if;
 insert into public.platform_audit_log(user_id,action,entity_type,entity_id,after_data) values((select auth.uid()),case when _id is null then 'product_created' else 'product_updated' end,'product',v_id::text,jsonb_build_object('name',_name,'category',_category,'image_url',_image_url));return v_id;
end;$$;

create or replace function public.admin_save_establishment(_id uuid default null,_name text default null,_neighborhood text default null,_kind text default null,_slug text default null,_short_description text default null,_logo_url text default null,_is_verified boolean default false) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;v_slug text;
begin
 if (select auth.uid()) is null or not private.is_platform_admin() then raise exception 'Acesso negado' using errcode='42501'; end if;
 if length(trim(coalesce(_name,'')))<2 then raise exception 'Nome do estabelecimento é obrigatório'; end if;
 v_slug:=coalesce(nullif(trim(_slug),''),lower(regexp_replace(extensions.unaccent(trim(_name)),'[^a-zA-Z0-9]+','-','g')));v_slug:=trim(both '-' from v_slug);
 if _id is null then if exists(select 1 from public.establishments where slug=v_slug) then v_slug:=v_slug||'-'||substr(gen_random_uuid()::text,1,8);end if;insert into public.establishments(name,neighborhood,kind,slug,short_description,logo_url,is_verified,verified_at) values(trim(_name),nullif(trim(coalesce(_neighborhood,'')),''),nullif(trim(coalesce(_kind,'')),''),v_slug,nullif(trim(coalesce(_short_description,'')),''),nullif(trim(coalesce(_logo_url,'')),''),coalesce(_is_verified,false),case when _is_verified then now() else null end) returning id into v_id;
 else if exists(select 1 from public.establishments where slug=v_slug and id<>_id) then raise exception 'Já existe outro estabelecimento com este slug';end if;update public.establishments set name=trim(_name),neighborhood=nullif(trim(coalesce(_neighborhood,'')),''),kind=nullif(trim(coalesce(_kind,'')),''),slug=v_slug,short_description=nullif(trim(coalesce(_short_description,'')),''),logo_url=nullif(trim(coalesce(_logo_url,'')),''),is_verified=coalesce(_is_verified,false),verified_at=case when _is_verified then coalesce(verified_at,now()) else null end where id=_id returning id into v_id;if v_id is null then raise exception 'Estabelecimento não encontrado';end if;end if;
 insert into public.platform_audit_log(user_id,action,entity_type,entity_id,after_data) values((select auth.uid()),case when _id is null then 'establishment_created' else 'establishment_updated' end,'establishment',v_id::text,jsonb_build_object('name',_name,'kind',_kind,'verified',_is_verified));return v_id;
end;$$;

create or replace function public.admin_set_product_price(_product_id uuid,_establishment_id uuid,_value numeric) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
 if (select auth.uid()) is null or not private.is_platform_admin() then raise exception 'Acesso negado' using errcode='42501';end if;if _value is null or _value<=0 then raise exception 'Preço inválido';end if;
 select id into v_id from public.prices where product_id=_product_id and establishment_id=_establishment_id order by captured_at desc nulls last limit 1;
 if v_id is null then insert into public.prices(product_id,establishment_id,value,captured_at) values(_product_id,_establishment_id,_value,now()) returning id into v_id;else update public.prices set previous_value=value,value=_value,captured_at=now() where id=v_id;end if;
 insert into public.platform_audit_log(user_id,action,entity_type,entity_id,after_data) values((select auth.uid()),'price_admin_saved','price',v_id::text,jsonb_build_object('product_id',_product_id,'establishment_id',_establishment_id,'value',_value));return v_id;
end;$$;

grant execute on function public.admin_catalog_snapshot() to authenticated;
grant execute on function public.admin_save_product(uuid,text,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.admin_save_establishment(uuid,text,text,text,text,text,text,boolean) to authenticated;
grant execute on function public.admin_set_product_price(uuid,uuid,numeric) to authenticated;
