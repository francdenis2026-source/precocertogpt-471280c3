-- Remove definitivamente o registro de teste identificado no catálogo público.
-- ID confirmado em produção antes desta migração:
-- f40ee44f-3d2c-4649-a75e-06e2ab516cd3 / "Test Product"
begin;

delete from public.user_favorites
where product_id = 'f40ee44f-3d2c-4649-a75e-06e2ab516cd3'
   or lower(btrim(product_id)) = 'test product';

delete from public.prices
where product_id = 'f40ee44f-3d2c-4649-a75e-06e2ab516cd3';

delete from public.products
where id = 'f40ee44f-3d2c-4649-a75e-06e2ab516cd3'
  and lower(btrim(name)) = 'test product';

commit;
