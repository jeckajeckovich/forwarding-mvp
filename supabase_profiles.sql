create table if not exists profiles (
  id uuid primary key,
  customer_id text unique not null,
  full_name text,
  email text,
  warehouse_country text not null default 'Germany',
  warehouse_address text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

create policy "Users can insert their own profile"
on profiles
for insert
to anon, authenticated
with check (true);

create policy "Users can view their own profile"
on profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update their own profile"
on profiles
for update
to authenticated
using (auth.uid() = id);