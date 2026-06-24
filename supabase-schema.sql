-- ============================================================
-- TripMind — Core schema (Phase 1)
-- Run this FIRST in the Supabase SQL Editor, then run
-- supabase-schema-phase234.sql afterwards.
-- ============================================================

-- ── 1. Profiles ──────────────────────────────────────────────
-- One row per authenticated user, keyed to auth.users.id.
CREATE TABLE IF NOT EXISTS profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                TEXT,
  full_name            TEXT,
  avatar_url           TEXT,
  home_city            TEXT,
  travel_style         TEXT CHECK (travel_style IN ('budget','moderate','comfortable','premium')),
  group_type           TEXT CHECK (group_type IN ('solo','couple','friends','family_kids','family_elders')),
  interests            TEXT[] DEFAULT '{}',
  preferred_transport  TEXT CHECK (preferred_transport IN ('train','flight','bus','car','any')),
  onboarding_complete  BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── 2. Trips ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  form_data       JSONB NOT NULL,
  generated_plan  JSONB,
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','saved','completed')),
  regen_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips (user_id);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own trips"
  ON trips FOR ALL
  USING (auth.uid() = user_id);

-- Note: supabase-schema-phase234.sql extends this table with
-- share_token / share_enabled, and relaxes read access for the
-- public /share/[token] page and for invited trip_members.
