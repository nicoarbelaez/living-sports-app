-- ============================================================
-- Migration: group_invites
-- Creates group_invites and group_invite_redemptions tables
-- with RLS policies and indexes.
-- ============================================================

-- 1. group_invites table
CREATE TABLE IF NOT EXISTS group_invites (
  id           uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id     uuid        NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by   uuid        NOT NULL REFERENCES profiles(id),
  token        uuid        NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  target_user_id uuid      NULL     REFERENCES profiles(id),
  channel      text        NOT NULL CHECK (channel IN ('link', 'nickname')),
  expires_at   timestamptz NOT NULL DEFAULT now() + interval '7 days',
  max_uses     int         NOT NULL DEFAULT 1,
  used_count   int         NOT NULL DEFAULT 0,
  created_at   timestamptz          DEFAULT now()
);

ALTER TABLE group_invites ENABLE ROW LEVEL SECURITY;

-- SELECT: creator, targeted user, or valid open-link invite
DROP POLICY IF EXISTS "group_invites_select" ON group_invites;
CREATE POLICY "group_invites_select" ON group_invites
  FOR SELECT USING (
    auth.uid() = created_by
    OR auth.uid() = target_user_id
    OR (
      channel = 'link'
      AND used_count < max_uses
      AND expires_at > now()
    )
  );

-- INSERT: any authenticated user
DROP POLICY IF EXISTS "group_invites_insert" ON group_invites;
CREATE POLICY "group_invites_insert" ON group_invites
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: only the creator
DROP POLICY IF EXISTS "group_invites_update" ON group_invites;
CREATE POLICY "group_invites_update" ON group_invites
  FOR UPDATE USING (auth.uid() = created_by);

-- DELETE: only the creator
DROP POLICY IF EXISTS "group_invites_delete" ON group_invites;
CREATE POLICY "group_invites_delete" ON group_invites
  FOR DELETE USING (auth.uid() = created_by);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_group_invites_token      ON group_invites(token);
CREATE INDEX IF NOT EXISTS idx_group_invites_group_id   ON group_invites(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invites_created_by ON group_invites(created_by);

-- 2. group_invite_redemptions table
CREATE TABLE IF NOT EXISTS group_invite_redemptions (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_id   uuid        NOT NULL REFERENCES group_invites(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES profiles(id),
  redeemed_at timestamptz          DEFAULT now(),
  UNIQUE (invite_id, user_id)
);

ALTER TABLE group_invite_redemptions ENABLE ROW LEVEL SECURITY;

-- SELECT: only the user who redeemed
DROP POLICY IF EXISTS "group_invite_redemptions_select" ON group_invite_redemptions;
CREATE POLICY "group_invite_redemptions_select" ON group_invite_redemptions
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: only the user who is redeeming
DROP POLICY IF EXISTS "group_invite_redemptions_insert" ON group_invite_redemptions;
CREATE POLICY "group_invite_redemptions_insert" ON group_invite_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
