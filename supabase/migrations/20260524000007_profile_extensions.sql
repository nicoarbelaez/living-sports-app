-- ============================================================
-- Migration: profile_extensions
-- Extends personal_records (featured PRs with a cap of 3),
-- extends routines (title + rest-day flag), and introduces
-- the ai_routine_drafts table.
-- ============================================================

-- 1. Add columns to personal_records (idempotent)
DO $$ BEGIN
  ALTER TABLE personal_records ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE personal_records ADD COLUMN description text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 2. Enforce a maximum of 3 featured PRs per user
CREATE OR REPLACE FUNCTION check_max_featured_prs()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_featured = true THEN
    IF (
      SELECT COUNT(*)
      FROM personal_records
      WHERE user_id    = NEW.user_id
        AND is_featured = true
        -- Exclude the current row when updating
        AND id != COALESCE(NEW.id, gen_random_uuid())
    ) >= 3
    THEN
      RAISE EXCEPTION 'Máximo 3 PRs destacados permitidos.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_max_featured_prs ON personal_records;
CREATE TRIGGER enforce_max_featured_prs
  BEFORE INSERT OR UPDATE OF is_featured ON personal_records
  FOR EACH ROW EXECUTE FUNCTION check_max_featured_prs();

-- 3. Add columns to routines (idempotent)
DO $$ BEGIN
  ALTER TABLE routines ADD COLUMN title text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE routines ADD COLUMN is_rest boolean NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 4. AI routine drafts table
CREATE TABLE IF NOT EXISTS ai_routine_drafts (
  id         uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payload    jsonb       NOT NULL,
  created_at timestamptz          DEFAULT now(),
  applied_at timestamptz          NULL
);

ALTER TABLE ai_routine_drafts ENABLE ROW LEVEL SECURITY;

-- SELECT: own drafts only
DROP POLICY IF EXISTS "ai_routine_drafts_select" ON ai_routine_drafts;
CREATE POLICY "ai_routine_drafts_select" ON ai_routine_drafts
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: own drafts only
DROP POLICY IF EXISTS "ai_routine_drafts_insert" ON ai_routine_drafts;
CREATE POLICY "ai_routine_drafts_insert" ON ai_routine_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DELETE: own drafts only
DROP POLICY IF EXISTS "ai_routine_drafts_delete" ON ai_routine_drafts;
CREATE POLICY "ai_routine_drafts_delete" ON ai_routine_drafts
  FOR DELETE USING (auth.uid() = user_id);
