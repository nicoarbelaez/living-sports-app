-- =============================================================================
-- Semilla de ejercicios base para competiciones
-- muscle_category_id: 1=Pectorales, 2=Espalda, 3=Hombros, 4=Bíceps,
--                     5=Tríceps, 9=Cuádriceps, 12=Cuerpo completo
-- =============================================================================
insert into public.exercises (name, slug, muscle_category_id, is_active)
values
  ('Press de banca',   'press-banca',   1, true),
  ('Fondos',           'fondos',        5, true),
  ('Press militar',    'press-militar', 3, true),
  ('Sentadilla',       'sentadilla',    9, true),
  ('Peso muerto',      'peso-muerto',   12, true),
  ('Dominadas',        'dominadas',     2, true),
  ('Remo con barra',   'remo-barra',    2, true),
  ('Curl de bíceps',   'curl-biceps',   4, true)
on conflict (slug) do nothing;
