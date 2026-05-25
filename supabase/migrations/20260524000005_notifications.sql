-- ============================================================
-- Migration: notifications
-- Adds expo_push_token to profiles, creates the notifications
-- table with RLS, an index, and enables Realtime.
-- ============================================================

-- 1. Add push token to profiles (idempotent)
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN expo_push_token text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 2. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       text        NOT NULL,
  payload    jsonb       NOT NULL DEFAULT '{}',
  read_at    timestamptz          NULL,
  created_at timestamptz          DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: own notifications only
DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- UPDATE (mark as read): own notifications only
DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- INSERT: authenticated users or service_role (Edge Functions / cron)
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    OR auth.role() = 'service_role'
  );

-- 3. Index for efficient per-user feed queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

-- 4. Enable Realtime so clients receive live notification pushes
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
