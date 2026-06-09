-- 1. Create auth schema (GoTrue will manage the tables)
create schema if not exists auth;


-- 2. Create roles required by PostgREST and Supabase client
do $$
begin
  if not exists (select from pg_catalog.pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select from pg_catalog.pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select from pg_catalog.pg_roles where rolname = 'supabase_admin') then
    create role supabase_admin nologin;
  end if;
end $$;

-- 3. Define the auth.uid() function simulating Supabase's context extraction
create or replace function auth.uid()
returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

-- 4. Create the public.database_overrides table
create table if not exists public.database_overrides (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  database_slug text not null,
  row_id text not null,
  column_key text not null,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, database_slug, row_id, column_key)
);

-- 5. Grant database permissions to PostgREST roles
grant usage on schema public to anon, authenticated;
grant all privileges on all tables in schema public to anon, authenticated;
grant all privileges on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;

-- 6. Enable Row Level Security (RLS)
alter table public.database_overrides enable row level security;

-- 7. Create RLS Policies
create policy "Users can view their own overrides"
  on public.database_overrides for select
  using (auth.uid() = user_id);

create policy "Users can insert their own overrides"
  on public.database_overrides for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own overrides"
  on public.database_overrides for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own overrides"
  on public.database_overrides for delete
  using (auth.uid() = user_id);
