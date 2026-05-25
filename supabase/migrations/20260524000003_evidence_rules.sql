-- ============================================================
-- Migration: evidence_rules
-- Extends competition_entries with scoring/attempt columns,
-- adds a helper function for counting failed attempts, and
-- replaces the static process_validation_vote trigger with a
-- dynamic majority-based version.
-- ============================================================

-- 1. Add new columns to competition_entries (idempotent)
DO $$ BEGIN
  ALTER TABLE competition_entries ADD COLUMN points integer NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE competition_entries ADD COLUMN is_deprecated boolean NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE competition_entries ADD COLUMN attempt_number integer NOT NULL DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE competition_entries ADD COLUMN day_date date;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 2. Helper: count rejected attempts for a user on a given competition day
CREATE OR REPLACE FUNCTION count_failed_attempts(
  p_user_id        uuid,
  p_competition_id uuid,
  p_day_date       date
) RETURNS int LANGUAGE sql STABLE AS $$
  SELECT COUNT(*)::int
  FROM competition_entries
  WHERE user_id        = p_user_id
    AND competition_id = p_competition_id
    AND day_date       = p_day_date
    AND validation_status = 'rejected';
$$;

-- 3. Replace process_validation_vote with dynamic majority logic
--    Drop the old trigger first, then recreate function + trigger.
DROP TRIGGER IF EXISTS process_validation_vote ON competition_validations;

CREATE OR REPLACE FUNCTION process_validation_vote_fn()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_entry          competition_entries%ROWTYPE;
  v_active_members int;
  v_threshold      int;
  v_approvals      int;
  v_rejections     int;
BEGIN
  -- Fetch the entry being voted on
  SELECT * INTO v_entry
  FROM competition_entries
  WHERE id = NEW.entry_id;

  -- Count active members in the group who are not the entry author
  SELECT COUNT(*) INTO v_active_members
  FROM group_members gm
  JOIN competitions c ON c.id = v_entry.competition_id
  WHERE gm.group_id = c.group_id
    AND gm.status   = 'active'
    AND gm.user_id != v_entry.user_id;

  -- Dynamic majority threshold
  v_threshold := FLOOR(v_active_members::float / 2) + 1;

  -- Fresh vote counts
  SELECT
    COUNT(*) FILTER (WHERE vote = 'approve'),
    COUNT(*) FILTER (WHERE vote = 'reject')
  INTO v_approvals, v_rejections
  FROM competition_validations
  WHERE entry_id = NEW.entry_id;

  -- Persist updated counts on the entry
  UPDATE competition_entries
  SET approvals_count  = v_approvals,
      rejections_count = v_rejections
  WHERE id = NEW.entry_id;

  -- Apply status + points when a threshold is reached
  IF v_approvals >= v_threshold THEN
    UPDATE competition_entries
    SET validation_status = 'approved',
        points            = 1
    WHERE id = NEW.entry_id;
  ELSIF v_rejections >= v_threshold THEN
    UPDATE competition_entries
    SET validation_status = 'rejected',
        points            = -2
    WHERE id = NEW.entry_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER process_validation_vote
  AFTER INSERT ON competition_validations
  FOR EACH ROW EXECUTE FUNCTION process_validation_vote_fn();
