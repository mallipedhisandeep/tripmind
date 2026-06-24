-- ============================================================
-- TripMind — Phase 2 / 3 / 4 schema additions
-- Run this in Supabase SQL Editor AFTER the original schema
-- Safe to re-run: every CREATE POLICY is preceded by a matching
-- DROP POLICY IF EXISTS, and tables/columns use IF NOT EXISTS.
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

CREATE INDEX IF NOT EXISTS idx_trips_share_token ON trips (share_token);

-- Allow anyone (including unauthenticated visitors) to read a trip
-- when its owner has explicitly enabled sharing. Required for the
-- public /share/[token] page, which has no logged-in user.
DROP POLICY IF EXISTS "Anyone can view a shared trip" ON trips;
CREATE POLICY "Anyone can view a shared trip"
  ON trips FOR SELECT
  USING (share_enabled = TRUE);

-- ── 3. Watchlist ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id         UUID REFERENCES trips(id) ON DELETE SET NULL,
  -- Enum constraint — only valid types accepted
  type            TEXT NOT NULL CHECK (type IN ('train_seat','darshan_slot','hotel_price','bus_seat','flight_price')),
  label           TEXT NOT NULL,
  params          JSONB NOT NULL DEFAULT '{}',
  target_price    INTEGER,
  notified        BOOLEAN DEFAULT FALSE,
  active          BOOLEAN DEFAULT TRUE,
  -- E.164 format enforced at API layer; regex as belt-and-suspenders
  whatsapp_number TEXT CHECK (whatsapp_number IS NULL OR whatsapp_number ~ '^\+[1-9]\d{6,14}$'),
  last_checked_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own watchlist" ON watchlist;
CREATE POLICY "Users manage own watchlist"
  ON watchlist FOR ALL
  USING (auth.uid() = user_id);

-- ── 4. Trip members (group planning) ───────────────────────
CREATE TABLE IF NOT EXISTS trip_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer',
  invite_token  TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  accepted      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (trip_id, email)
);

ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;

-- Members can view their own row; only the trip owner can INSERT / UPDATE / DELETE
DROP POLICY IF EXISTS "Members can view own membership" ON trip_members;
CREATE POLICY "Members can view own membership"
  ON trip_members FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = (SELECT user_id FROM trips WHERE id = trip_id)
  );

DROP POLICY IF EXISTS "Trip owner manages members" ON trip_members;
CREATE POLICY "Trip owner manages members"
  ON trip_members FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM trips WHERE id = trip_id)
  );

DROP POLICY IF EXISTS "Trip owner updates members" ON trip_members;
CREATE POLICY "Trip owner updates members"
  ON trip_members FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM trips WHERE id = trip_id)
  );

-- Only the trip owner can remove members (fixes IDOR at DB level)
DROP POLICY IF EXISTS "Trip owner deletes members" ON trip_members;
CREATE POLICY "Trip owner deletes members"
  ON trip_members FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM trips WHERE id = trip_id)
  );

-- ── 5. Payment log ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  razorpay_order   TEXT NOT NULL,
  razorpay_payment TEXT,
  plan             TEXT NOT NULL CHECK (plan IN ('monthly','yearly')),
  amount           INTEGER NOT NULL,
  status           TEXT DEFAULT 'created',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own payments" ON payments;
CREATE POLICY "Users see own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service inserts payments" ON payments;
CREATE POLICY "Service inserts payments"
  ON payments FOR INSERT
  WITH CHECK (TRUE);

-- ── 6. Invite acceptance (group planning) ────────────────────
-- An authenticated user may look up a pending invite addressed to
-- their own email, by token, even before they are linked via user_id.
DROP POLICY IF EXISTS "Invitee can view own pending invite" ON trip_members;
CREATE POLICY "Invitee can view own pending invite"
  ON trip_members FOR SELECT
  USING (
    accepted = FALSE
    AND lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- An authenticated user may claim (accept) a pending invite addressed
-- to their own email, by token. This only allows setting user_id to
-- themselves and accepted to true on a row matching their own email.
DROP POLICY IF EXISTS "Invitee can accept own pending invite" ON trip_members;
CREATE POLICY "Invitee can accept own pending invite"
  ON trip_members FOR UPDATE
  USING (
    accepted = FALSE
    AND lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    user_id = auth.uid()
  );
