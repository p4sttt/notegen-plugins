-- 1. Create the database overrides table
create table database_overrides (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null default auth.uid(),
  database_slug text not null,
  row_id text not null,
  column_key text not null,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, database_slug, row_id, column_key)
);

-- 2. Enable Row Level Security (RLS)
alter table database_overrides enable row level security;

-- 3. Create RLS Policies
create policy "Users can view their own overrides"
  on database_overrides for select
  using (auth.uid() = user_id);

create policy "Users can insert their own overrides"
  on database_overrides for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own overrides"
  on database_overrides for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own overrides"
  on database_overrides for delete
  using (auth.uid() = user_id);
