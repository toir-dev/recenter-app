-- Enable required extensions
create extension if not exists "pgcrypto";

-- Table: profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  display_name text,
  locale text,
  timezone text
);

-- Table: checkins
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dt timestamptz not null,
  mood smallint check (mood between 0 and 10),
  dpdr_severity smallint check (dpdr_severity between 0 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Table: sessions
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('breath','grounding','journal','learn','sos')),
  started_at timestamptz not null,
  ended_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Table: journal_entries
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dt timestamptz not null,
  entry_type text not null check (entry_type in ('free','cbt')),
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Table: content_items
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  type text not null check (type in ('lesson','exercise','audio','flags')),
  version integer not null default 1,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

-- Table: crisis_resources
create table if not exists public.crisis_resources (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  label text not null,
  phone text,
  url text,
  lang text
);

-- Indexes
create index if not exists idx_checkins_user_dt on public.checkins (user_id, dt desc);
create index if not exists idx_sessions_user_started on public.sessions (user_id, started_at desc);
create index if not exists idx_journal_entries_user_dt on public.journal_entries (user_id, dt desc);
create index if not exists idx_content_items_slug on public.content_items (slug);
create index if not exists idx_crisis_resources_country_lang on public.crisis_resources (country_code, lang);

-- Updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers
create or replace trigger trg_checkins_updated
before update on public.checkins
for each row
execute procedure public.set_updated_at();

create or replace trigger trg_journal_entries_updated
before update on public.journal_entries
for each row
execute procedure public.set_updated_at();

create or replace trigger trg_content_items_updated
before update on public.content_items
for each row
execute procedure public.set_updated_at();

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.checkins enable row level security;
alter table public.sessions enable row level security;
alter table public.journal_entries enable row level security;
alter table public.content_items enable row level security;
alter table public.crisis_resources enable row level security;

-- RLS policies
create policy "Profiles owner read" on public.profiles for select using (id = auth.uid());
create policy "Profiles owner update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Checkins owner all" on public.checkins
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Sessions owner all" on public.sessions
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Journal owner all" on public.journal_entries
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Content items public read" on public.content_items for select using (true);
create policy "Content items service write" on public.content_items for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "Crisis resources public read" on public.crisis_resources for select using (true);
create policy "Crisis resources service write" on public.crisis_resources for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

