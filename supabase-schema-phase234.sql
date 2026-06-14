-- ============================================================
-- TripMind — Phase 2 / 3 / 4 schema additions
-- Run this in Supabase SQL Editor AFTER the original schema
-- ============================================================

-- ── 1. Extend profiles ──────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_pro          BOOLEAN   DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pro_expires_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS lang            TEXT      DEFAULT 'en';

-- ── 2. Extend trips ─────────────────────────────────────────
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS share_token    TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS share_enabled  BOOLEAN DEFAULT FALSE;

-- Index for fast share-link lookups
CREATE INDEX IF NOT EXISTS idx_trips_share_token ON trips (share_token);

-- ── 3. Watchlist ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id         UUID REFERENCES trips(id) ON DELETE SET NULL,
  type            TEXT NOT NULL,            -- train_seat | darshan_slot | hotel_price | bus_seat | flight_price
  label           TEXT NOT NULL,
  params          JSONB NOT NULL DEFAULT '{}',
  target_price    INTEGER,
  notified        BOOLEAN DEFAULT FALSE,
  active          BOOLEAN DEFAULT TRUE,
  whatsapp_number TEXT,
  last_checked_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own watchlist"
  ON watchlist FOR ALL
  USING (auth.uid() = user_id);

-- ── 4. Trip members (group planning) ───────────────────────
CREATE TABLE IF NOT EXISTS trip_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer',   -- owner | editor | viewer
  invite_token  TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  accepted      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;

-- Trip owner can manage members
CREATE POLICY "Trip owner manages members"
  ON trip_members FOR ALL
  USING (
    auth.uid() = user_id
    OR
    auth.uid() = (SELECT user_id FROM trips WHERE id = trip_id)
  );

-- ── 5. Payment log ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  razorpay_order  TEXT NOT NULL,
  razorpay_payment TEXT,
  plan            TEXT NOT NULL,   -- 'monthly' | 'yearly'
  amount          INTEGER NOT NULL, -- paise
  status          TEXT DEFAULT 'created',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Service role insert (via API route, not anon key)
CREATE POLICY "Service inserts payments"
  ON payments FOR INSERT
  WITH CHECK (TRUE);
