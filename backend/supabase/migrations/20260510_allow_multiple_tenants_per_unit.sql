begin;

alter table public.rental_tenants
  drop constraint if exists rental_tenants_unit_unique;

commit;
