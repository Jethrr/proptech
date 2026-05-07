-- Tenant directory: one active lease per unit (POC)

begin;

create table if not exists public.rental_tenants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.rental_properties(id) on delete cascade,
  unit_id uuid not null references public.rental_property_units(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null default '',
  lease_start date not null,
  lease_end date not null,
  due_day smallint not null check (due_day >= 1 and due_day <= 31),
  payment_status text not null default 'Due Soon'
    check (payment_status in ('Paid', 'Due Soon', 'Overdue')),
  contract_file_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rental_tenants_lease_order check (lease_end >= lease_start),
  constraint rental_tenants_unit_unique unique (unit_id)
);

create index if not exists rental_tenants_user_id_idx
  on public.rental_tenants (user_id);

create index if not exists rental_tenants_property_id_idx
  on public.rental_tenants (property_id);

create index if not exists rental_tenants_created_at_idx
  on public.rental_tenants (created_at desc);

drop trigger if exists trg_rental_tenants_set_updated_at on public.rental_tenants;
create trigger trg_rental_tenants_set_updated_at
before update on public.rental_tenants
for each row execute function public.set_updated_at();

alter table public.rental_tenants enable row level security;

drop policy if exists "rental_tenants_select_own" on public.rental_tenants;
create policy "rental_tenants_select_own"
on public.rental_tenants
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "rental_tenants_insert_own" on public.rental_tenants;
create policy "rental_tenants_insert_own"
on public.rental_tenants
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
  and exists (
    select 1
    from public.rental_property_units u
    where u.id = unit_id
      and u.property_id = property_id
      and u.user_id = auth.uid()
  )
);

drop policy if exists "rental_tenants_update_own" on public.rental_tenants;
create policy "rental_tenants_update_own"
on public.rental_tenants
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
  and exists (
    select 1
    from public.rental_property_units u
    where u.id = unit_id
      and u.property_id = property_id
      and u.user_id = auth.uid()
  )
);

drop policy if exists "rental_tenants_delete_own" on public.rental_tenants;
create policy "rental_tenants_delete_own"
on public.rental_tenants
for delete
to authenticated
using (user_id = auth.uid());

commit;
