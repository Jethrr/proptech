-- Utility billing cycles (meter readings + rates per unit per period)

begin;

create table if not exists public.rental_utility_billing_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.rental_properties(id) on delete cascade,
  unit_id uuid not null references public.rental_property_units(id) on delete cascade,
  billing_period text not null default '',
  period_start date not null,
  period_end date not null,
  previous_reading numeric(14, 4) not null,
  current_reading numeric(14, 4) not null,
  electricity_rate numeric(14, 4) not null,
  water_rate numeric(14, 4) not null default 0,
  additional_fees numeric(14, 4) not null default 0,
  created_at timestamptz not null default now(),
  constraint rental_utility_period_valid check (period_end >= period_start),
  constraint rental_utility_readings_non_negative check (previous_reading >= 0 and current_reading >= 0)
);

create unique index if not exists rental_utility_billing_cycles_unit_period_uniq
  on public.rental_utility_billing_cycles (user_id, unit_id, period_start, period_end);

create index if not exists rental_utility_billing_cycles_user_id_idx
  on public.rental_utility_billing_cycles (user_id);

create index if not exists rental_utility_billing_cycles_property_id_idx
  on public.rental_utility_billing_cycles (property_id);

create index if not exists rental_utility_billing_cycles_created_at_idx
  on public.rental_utility_billing_cycles (created_at desc);

alter table public.rental_utility_billing_cycles enable row level security;

drop policy if exists "rental_utility_billing_cycles_select_own" on public.rental_utility_billing_cycles;
create policy "rental_utility_billing_cycles_select_own"
on public.rental_utility_billing_cycles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "rental_utility_billing_cycles_insert_own" on public.rental_utility_billing_cycles;
create policy "rental_utility_billing_cycles_insert_own"
on public.rental_utility_billing_cycles
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
      and u.user_id = auth.uid()
      and u.property_id = property_id
  )
);

drop policy if exists "rental_utility_billing_cycles_update_own" on public.rental_utility_billing_cycles;
create policy "rental_utility_billing_cycles_update_own"
on public.rental_utility_billing_cycles
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
      and u.user_id = auth.uid()
      and u.property_id = property_id
  )
);

drop policy if exists "rental_utility_billing_cycles_delete_own" on public.rental_utility_billing_cycles;
create policy "rental_utility_billing_cycles_delete_own"
on public.rental_utility_billing_cycles
for delete
to authenticated
using (user_id = auth.uid());

commit;
