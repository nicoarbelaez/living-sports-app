-- =============================================================================
-- Agrega exercise_id directo en competitions para simplificar competiciones
-- de un solo ejercicio. competition_exercises se mantiene porque
-- competition_entries_exercise_valid FK lo requiere.
-- =============================================================================
alter table public.competitions
  add column if not exists exercise_id uuid references public.exercises(id) on delete restrict;

create index if not exists competitions_exercise_idx on public.competitions (exercise_id);
