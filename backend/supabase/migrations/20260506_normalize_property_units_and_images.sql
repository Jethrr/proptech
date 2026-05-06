-- Normalize property units + move property images to Supabase Storage

begin;

-- 1) Create normalized units table
create table if not exists public.rental_property_units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.rental_properties(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_number text,
  monthly_rent numeric(12,2),
  occupancy_status text not null default 'Vacant'
    check (occupancy_status in ('Vacant', 'Occupied', 'Reserved', 'Maintenance')),
  notes text not null default '',
  unit_data jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rental_property_units_property_id_idx
  on public.rental_property_units (property_id);

create index if not exists rental_property_units_user_id_idx
  on public.rental_property_units (user_id);

create index if not exists rental_property_units_created_at_idx
  on public.rental_property_units (created_at desc);

drop trigger if exists trg_rental_property_units_set_updated_at on public.rental_property_units;
create trigger trg_rental_property_units_set_updated_at
before update on public.rental_property_units
for each row execute function public.set_updated_at();

-- 2) Migrate existing units jsonb array into normalized rows (best-effort)
insert into public.rental_property_units (
  property_id,
  user_id,
  unit_number,
  monthly_rent,
  occupancy_status,
  notes,
  unit_data,
  sort_order
)
select
  rp.id as property_id,
  rp.user_id,
  nullif(trim(coalesce(unit ->> 'unitNumber', unit ->> 'label', unit ->> 'name', '')), '') as unit_number,
  case
    when coalesce(unit ->> 'monthlyRent', unit ->> 'rent', '') ~ '^\d+(\.\d+)?$'
      then (coalesce(unit ->> 'monthlyRent', unit ->> 'rent'))::numeric(12,2)
    else null
  end as monthly_rent,
  case
    when lower(coalesce(unit ->> 'occupancyStatus', unit ->> 'status', '')) = 'occupied' then 'Occupied'
    when lower(coalesce(unit ->> 'occupancyStatus', unit ->> 'status', '')) = 'reserved' then 'Reserved'
    when lower(coalesce(unit ->> 'occupancyStatus', unit ->> 'status', '')) = 'maintenance' then 'Maintenance'
    else 'Vacant'
  end as occupancy_status,
  coalesce(unit ->> 'notes', '') as notes,
  unit as unit_data,
  ordinality::integer - 1 as sort_order
from public.rental_properties rp
cross join lateral jsonb_array_elements(rp.units) with ordinality as u(unit, ordinality)
where jsonb_typeof(rp.units) = 'array'
  and jsonb_array_length(rp.units) > 0;

-- 3) Remove denormalized units column from properties
alter table public.rental_properties
  drop constraint if exists rental_properties_units_is_array;

alter table public.rental_properties
  drop column if exists units;

-- 4) Move property image field to storage-path semantics
alter table public.rental_properties
  rename column image to image_path;

alter table public.rental_properties
  alter column image_path drop default;

comment on column public.rental_properties.image_path is
  'Supabase Storage object path (bucket: property-images), e.g. <user_id>/<property_id>/cover.jpg';

-- 5) RLS for normalized units table
alter table public.rental_property_units enable row level security;

drop policy if exists "rental_property_units_select_own" on public.rental_property_units;
create policy "rental_property_units_select_own"
on public.rental_property_units
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "rental_property_units_insert_own" on public.rental_property_units;
create policy "rental_property_units_insert_own"
on public.rental_property_units
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.rental_properties rp
    where rp.id = property_id
      and rp.user_id = auth.uid()
  )
);

drop policy if exists "rental_property_units_update_own" on public.rental_property_units;
create policy "rental_property_units_update_own"
on public.rental_property_units
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.rental_properties rp
    where rp.id = property_id
      and rp.user_id = auth.uid()
  )
);

drop policy if exists "rental_property_units_delete_own" on public.rental_property_units;
create policy "rental_property_units_delete_own"
on public.rental_property_units
for delete
to authenticated
using (user_id = auth.uid());

-- 6) Supabase Storage bucket + policies for property images
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', false)
on conflict (id) do nothing;

drop policy if exists "property_images_select_own" on storage.objects;
create policy "property_images_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "property_images_insert_own" on storage.objects;
create policy "property_images_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "property_images_update_own" on storage.objects;
create policy "property_images_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "property_images_delete_own" on storage.objects;
create policy "property_images_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

commit;
