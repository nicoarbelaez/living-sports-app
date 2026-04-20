-- Elimina tabla competition_exercises (ya no se usa)
-- Una competición solo tiene un ejercicio directo en competition.exercise_id

ALTER TABLE public.competition_entries
  DROP CONSTRAINT IF EXISTS competition_entries_exercise_valid;

DROP POLICY IF EXISTS "comp_exercises_insert" ON public.competition_exercises;
DROP POLICY IF EXISTS "comp_exercises_read" ON public.competition_exercises;
DROP POLICY IF EXISTS "comp_exercises_delete" ON public.competition_exercises;

DROP TABLE IF EXISTS public.competition_exercises;
