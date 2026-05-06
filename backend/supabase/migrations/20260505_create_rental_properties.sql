-- Properties management MVP table + RLS

create extension if not exists pgcrypto;

create table if not exists public.rental_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('Dorm', 'Condo', 'Apartment', 'Airbnb', 'House')),
  address text not null,
  image text not null default 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&h=900&fit=crop',
  status_tag text not null check (status_tag in ('Pre-selling', 'RFO', 'Under Construction')),
  notes text not null default '',
  units jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rental_properties_units_is_array check (jsonb_typeof(units) = 'array')
);

create index if not exists rental_properties_user_id_idx
  on public.rental_properties (user_id);

create index if not exists rental_properties_created_at_idx
  on public.rental_properties (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_rental_properties_set_updated_at on public.rental_properties;
create trigger trg_rental_properties_set_updated_at
before update on public.rental_properties
for each row execute function public.set_updated_at();

alter table public.rental_properties enable row level security;

drop policy if exists "rental_properties_select_own" on public.rental_properties;
create policy "rental_properties_select_own"
on public.rental_properties
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "rental_properties_insert_own" on public.rental_properties;
create policy "rental_properties_insert_own"
on public.rental_properties
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "rental_properties_update_own" on public.rental_properties;
create policy "rental_properties_update_own"
on public.rental_properties
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "rental_properties_delete_own" on public.rental_properties;
create policy "rental_properties_delete_own"
on public.rental_properties
for delete
to authenticated
using (user_id = auth.uid());
