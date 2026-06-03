create table if not exists public.costings (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled costing',
  payload jsonb not null,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.costings enable row level security;

create policy "Users can read their own costings"
  on public.costings
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own costings"
  on public.costings
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own costings"
  on public.costings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own costings"
  on public.costings
  for delete
  using (auth.uid() = user_id);
