-- TripMind Database Schema
-- Run this entire file in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  home_city text default '',
  travel_style text default 'moderate',
  group_type text default 'family_kids',
  interests text[] default '{}',
  preferred_transport text default 'train',
  onboarding_complete boolean default false,
  is_pro boolean default false,
  pro_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TRIPS TABLE
create table if not exists public.trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  form_data jsonb not null default '{}',
  generated_plan jsonb,
  regen_count integer default 0,
  status text default 'draft' check (status in ('draft', 'saved', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- WATCHLIST TABLE (Phase 2 - created now for future use)
create table if not exists public.watchlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  destination text not null,
  from_city text not null,
  flexible_date_start date,
  flexible_date_end date,
  conditions jsonb default '{}',
  alert_channel text default 'push',
  is_active boolean default true,
  last_checked_at timestamptz,
  created_at timestamptz default now()
);

-- ALERTS TABLE (Phase 2)
create table if not exists public.alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  watchlist_id uuid references public.watchlist(id) on delete cascade,
  alert_type text not null,
  message text not null,
  acted_on boolean default false,
  sent_at timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.watchlist enable row level security;
alter table public.alerts enable row level security;

-- PROFILES POLICIES
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- TRIPS POLICIES
create policy "Users can view own trips"
  on public.trips for select using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on public.trips for insert with check (auth.uid() = user_id);

create policy "Users can update own trips"
  on public.trips for update using (auth.uid() = user_id);

create policy "Users can delete own trips"
  on public.trips for delete using (auth.uid() = user_id);

-- WATCHLIST POLICIES
create policy "Users can manage own watchlist"
  on public.watchlist for all using (auth.uid() = user_id);

-- ALERTS POLICIES
create policy "Users can view own alerts"
  on public.alerts for select using (auth.uid() = user_id);

-- AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- TRIGGER
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- INDEXES for performance
create index if not exists trips_user_id_idx on public.trips(user_id);
create index if not exists trips_created_at_idx on public.trips(created_at desc);
create index if not exists watchlist_user_id_idx on public.watchlist(user_id);
create index if not exists watchlist_active_idx on public.watchlist(is_active) where is_active = true;
