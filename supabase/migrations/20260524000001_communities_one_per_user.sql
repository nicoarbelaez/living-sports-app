-- ============================================================
-- Migration: communities_one_per_user
-- Enforces max 1 owned community per user, adds soft-delete
-- column, and updates the SELECT RLS policy on groups.
-- ============================================================

-- 1. Add is_deleted column (idempotent)
DO $$ BEGIN
  ALTER TABLE groups ADD COLUMN is_deleted boolean NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 2. Function: prevent a user from owning more than one group
CREATE OR REPLACE FUNCTION check_one_group_per_owner()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM groups
    WHERE owner_id = NEW.owner_id
      AND (is_deleted IS NULL OR is_deleted = false)
  ) THEN
    RAISE EXCEPTION 'Ya tienes una comunidad creada.';
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Trigger: run the check before every INSERT on groups
DROP TRIGGER IF EXISTS enforce_one_group_per_owner ON groups;
CREATE TRIGGER enforce_one_group_per_owner
  BEFORE INSERT ON groups
  FOR EACH ROW EXECUTE FUNCTION check_one_group_per_owner();

-- 4. RLS: members or public groups are readable
DROP POLICY IF EXISTS "Groups are viewable by members or public" ON groups;
CREATE POLICY "Groups are viewable by members or public" ON groups
  FOR SELECT USING (
    is_public = true
    OR owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
        AND group_members.status = 'active'
    )
  );
