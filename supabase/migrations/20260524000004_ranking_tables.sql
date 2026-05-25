-- ============================================================
-- Migration: ranking_tables
-- Creates group_ranking_snapshots table, enables RLS,
-- and defines two ranking views.
-- ============================================================

-- 1. Ranking snapshots table
CREATE TABLE IF NOT EXISTS group_ranking_snapshots (
  id              uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id        uuid        REFERENCES groups(id) ON DELETE CASCADE,
  competition_id  uuid        NULL REFERENCES competitions(id) ON DELETE SET NULL,
  snapshot_type   text        NOT NULL CHECK (snapshot_type IN ('competition', 'weekly', 'total')),
  user_id         uuid        REFERENCES profiles(id),
  points          int         NOT NULL DEFAULT 0,
  position        int,
  movement        text        CHECK (movement IN ('up', 'down', 'same')) DEFAULT 'same',
  snapshot_date   date        NOT NULL DEFAULT current_date,
  created_at      timestamptz          DEFAULT now()
);

ALTER TABLE group_ranking_snapshots ENABLE ROW LEVEL SECURITY;

-- SELECT: active group members only
DROP POLICY IF EXISTS "group_ranking_snapshots_select" ON group_ranking_snapshots;
CREATE POLICY "group_ranking_snapshots_select" ON group_ranking_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_ranking_snapshots.group_id
        AND group_members.user_id  = auth.uid()
        AND group_members.status   = 'active'
    )
  );

-- INSERT / UPDATE: service_role only (written by Edge Functions / cron)
DROP POLICY IF EXISTS "group_ranking_snapshots_insert" ON group_ranking_snapshots;
CREATE POLICY "group_ranking_snapshots_insert" ON group_ranking_snapshots
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "group_ranking_snapshots_update" ON group_ranking_snapshots;
CREATE POLICY "group_ranking_snapshots_update" ON group_ranking_snapshots
  FOR UPDATE USING (auth.role() = 'service_role');

-- 2. View: live competition ranking
CREATE OR REPLACE VIEW v_competition_ranking AS
SELECT
  ce.competition_id,
  ce.user_id,
  p.username,
  p.avatar_url,
  SUM(ce.points)                                                          AS total_points,
  RANK() OVER (
    PARTITION BY ce.competition_id
    ORDER BY SUM(ce.points) DESC
  )                                                                       AS position
FROM competition_entries ce
JOIN profiles p ON p.id = ce.user_id
WHERE ce.validation_status IN ('approved', 'rejected')
GROUP BY ce.competition_id, ce.user_id, p.username, p.avatar_url;

-- 3. View: all-time group ranking based on approved entries
CREATE OR REPLACE VIEW v_group_ranking_total AS
SELECT
  c.group_id,
  ce.user_id,
  p.username,
  p.avatar_url,
  SUM(ce.points)                                                          AS total_points,
  RANK() OVER (
    PARTITION BY c.group_id
    ORDER BY SUM(ce.points) DESC
  )                                                                       AS position
FROM competition_entries ce
JOIN competitions c ON c.id = ce.competition_id
JOIN profiles p ON p.id = ce.user_id
WHERE ce.validation_status = 'approved'
GROUP BY c.group_id, ce.user_id, p.username, p.avatar_url;
