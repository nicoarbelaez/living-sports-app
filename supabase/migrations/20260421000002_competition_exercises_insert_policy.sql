-- Permite al creador de la competición insertar en competition_exercises.
-- La FK constraint ya garantiza que la competición exista.
create policy "comp_exercises_insert" on public.competition_exercises
  for insert to authenticated
  with check (
    exists (
      select 1 from public.competitions
      where id = competition_id
        and created_by = auth.uid()
    )
  );
