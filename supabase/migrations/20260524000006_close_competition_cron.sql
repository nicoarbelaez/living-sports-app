-- ============================================================
-- Migration: close_competition_cron
-- Sets up pg_cron, timezone helpers, competition-closing logic,
-- and scheduled jobs that fire at midnight Bogotá time.
-- ============================================================

-- 1. Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA cron TO postgres;

-- 2. Timezone helpers (Bogotá = UTC-5, no DST)
CREATE OR REPLACE FUNCTION bogota_now()
RETURNS timestamptz LANGUAGE sql STABLE AS $$
  SELECT now() AT TIME ZONE 'America/Bogota';
$$;

CREATE OR REPLACE FUNCTION today_bogota()
RETURNS date LANGUAGE sql STABLE AS $$
  SELECT (bogota_now())::date;
$$;

-- 3. Close a single competition: deprecate stale entries,
--    mark it finished, snapshot rankings, notify members.
CREATE OR REPLACE FUNCTION close_competition(p_competition_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_group_id uuid;
  v_member   RECORD;
BEGIN
  -- Reject pending entries that belong to past days
  UPDATE competition_entries
  SET is_deprecated    = true,
      validation_status = 'rejected'
  WHERE competition_id   = p_competition_id
    AND validation_status = 'pending'
    AND day_date < today_bogota();

  -- Mark the competition as finished
  UPDATE competitions
  SET status = 'finished'
  WHERE id = p_competition_id;

  -- Resolve the owning group
  SELECT group_id INTO v_group_id
  FROM competitions
  WHERE id = p_competition_id;

  -- Persist a competition-type ranking snapshot
  INSERT INTO group_ranking_snapshots
    (group_id, competition_id, snapshot_type, user_id, points, position, snapshot_date)
  SELECT
    v_group_id,
    p_competition_id,
    'competition',
    user_id,
    total_points,
    position::int,
    today_bogota()
  FROM v_competition_ranking
  WHERE competition_id = p_competition_id;

  -- Notify every active member of the group
  FOR v_member IN
    SELECT user_id
    FROM group_members
    WHERE group_id = v_group_id
      AND status   = 'active'
  LOOP
    INSERT INTO notifications(user_id, type, payload)
    VALUES (
      v_member.user_id,
      'competition_closed',
      jsonb_build_object(
        'competition_id', p_competition_id,
        'group_id',       v_group_id
      )
    );
  END LOOP;
END;
$$;

-- 4. Batch-close all competitions whose end_date has passed
CREATE OR REPLACE FUNCTION close_due_competitions()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_comp RECORD;
BEGIN
  FOR v_comp IN
    SELECT id
    FROM competitions
    WHERE status   = 'active'
      AND end_date <= today_bogota()
  LOOP
    PERFORM close_competition(v_comp.id);
  END LOOP;
END;
$$;

-- 5. Deprecate any remaining pending entries from past days
--    (safety net that runs independently of competition closure)
CREATE OR REPLACE FUNCTION deprecate_pending_entries()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE competition_entries
  SET is_deprecated    = true,
      validation_status = 'rejected'
  WHERE validation_status = 'pending'
    AND day_date < today_bogota();
END;
$$;

-- 6. Schedule cron jobs
--    Bogotá midnight = 05:00 UTC (UTC-5, no DST).
--    close_due_competitions runs at 05:05 UTC to allow a small buffer.
--    deprecate_pending_entries runs at 05:00 UTC.
SELECT cron.schedule(
  'close_competitions_midnight_bogota',
  '5 5 * * *',
  $$SELECT close_due_competitions();$$
);

SELECT cron.schedule(
  'deprecate_pending_entries_midnight',
  '0 5 * * *',
  $$SELECT deprecate_pending_entries();$$
);
