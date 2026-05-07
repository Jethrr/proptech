create table if not exists rental_invoices (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  tenant_id       uuid not null,
  property_id     uuid not null,
  billing_period  text not null,
  period_start    date,
  period_end      date,
  base_rent       numeric(12, 2) not null default 0,
  utilities_total numeric(12, 2) not null default 0,
  amount          numeric(12, 2) not null,
  due_date        date not null,
  status          text not null default 'Draft' check (status in ('Draft', 'Sent', 'Paid')),
  line_items      jsonb,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table rental_invoices enable row level security;

create policy "owner select invoices" on rental_invoices
  for select using (auth.uid() = user_id);

create policy "owner insert invoices" on rental_invoices
  for insert with check (auth.uid() = user_id);

create policy "owner update invoices" on rental_invoices
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner delete invoices" on rental_invoices
  for delete using (auth.uid() = user_id);

create or replace function update_rental_invoices_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rental_invoices_updated_at
  before update on rental_invoices
  for each row execute function update_rental_invoices_updated_at();
