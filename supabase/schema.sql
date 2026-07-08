-- ASCEND cloud sync schema
-- Run this once in your Supabase project: SQL Editor → New query → paste → Run.
--
-- Model: one row per user holding the full app state as JSONB (the same
-- blob zustand-persist writes to localStorage under 'ascend-v2').

create table if not exists public.user_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Row Level Security: users can only ever touch their own row.
alter table public.user_state enable row level security;

create policy "Users can read own state"
  on public.user_state for select
  using (auth.uid() = user_id);

create policy "Users can insert own state"
  on public.user_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update own state"
  on public.user_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own state"
  on public.user_state for delete
  using (auth.uid() = user_id);
