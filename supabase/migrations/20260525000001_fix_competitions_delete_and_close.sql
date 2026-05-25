-- Allow creators to delete their own competitions
GRANT DELETE ON public.competitions TO authenticated;

DROP POLICY IF EXISTS "competitions_delete" ON public.competitions;
CREATE POLICY "competitions_delete" ON public.competitions
  FOR DELETE TO authenticated
  USING (created_by = (SELECT auth.uid()));

-- Recreate close_competition with SECURITY DEFINER so it runs as postgres
-- and bypasses RLS for all internal table operations.
CREATE OR REPLACE FUNCTION close_competition(p_competition_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_group_id uuid;
  v_member   RECORD;
BEGIN
  UPDATE public.competition_entries
  SET is_deprecated    = true,
      validation_status = 'rejected'
  WHERE competition_id   = p_competition_id
    AND validation_status = 'pending'
    AND day_date < public.today_bogota();

  UPDATE public.competitions
  SET status = 'finished'
  WHERE id = p_competition_id;

  SELECT group_id INTO v_group_id
  FROM public.competitions
  WHERE id = p_competition_id;

  INSERT INTO public.group_ranking_snapshots
    (group_id, competition_id, snapshot_type, user_id, points, position, snapshot_date)
  SELECT
    v_group_id,
    p_competition_id,
    'competition',
    user_id,
    total_points,
    position::int,
    public.today_bogota()
  FROM public.v_competition_ranking
  WHERE competition_id = p_competition_id;

  FOR v_member IN
    SELECT user_id
    FROM public.group_members
    WHERE group_id = v_group_id
      AND status   = 'active'
  LOOP
    INSERT INTO public.notifications(user_id, type, payload)
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
