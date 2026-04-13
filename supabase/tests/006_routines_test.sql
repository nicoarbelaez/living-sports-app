-- =============================================================================
-- TEST 006: Rutinas
-- Migración: 20260401014942_routines.sql
-- Cubre: routines, routine_exercises — estructura, constraints, RLS, auditoría
-- =============================================================================
begin;
select plan(30);
grant select on public.profiles to authenticated;
-- ---------------------------------------------------------------------------
-- TABLAS EXISTEN
-- ---------------------------------------------------------------------------
select has_table(
    'public',
    'routines',
    'routines table exists'
  );
select has_table(
    'public',
    'routine_exercises',
    'routine_exercises table exists'
  );
-- ---------------------------------------------------------------------------
-- COLUMNAS CLAVE EN routines
-- ---------------------------------------------------------------------------
select has_column(
    'public',
    'routines',
    'id',
    'routines.id exists'
  );
select has_column(
    'public',
    'routines',
    'user_id',
    'routines.user_id exists'
  );
select has_column(
    'public',
    'routines',
    'day_of_week',
    'routines.day_of_week exists'
  );
select has_column(
    'public',
    'routines',
    'name',
    'routines.name exists'
  );
select has_column(
    'public',
    'routines',
    'duration_sec',
    'routines.duration_sec exists'
  );
select has_column(
    'public',
    'routines',
    'is_active',
    'routines.is_active exists'
  );
-- ---------------------------------------------------------------------------
-- RLS HABILITADO
-- ---------------------------------------------------------------------------
select ok(
    (
      select relrowsecurity
      from pg_class
      where oid = 'public.routines'::regclass
    ),
    'routines has RLS enabled'
  );
select ok(
    (
      select relrowsecurity
      from pg_class
      where oid = 'public.routine_exercises'::regclass
    ),
    'routine_exercises has RLS enabled'
  );
-- ---------------------------------------------------------------------------
-- ÍNDICES
-- ---------------------------------------------------------------------------
select has_index(
    'public',
    'routines',
    'routines_user_idx',
    'routines user index exists'
  );
select has_index(
    'public',
    'routines',
    'routines_user_day_idx',
    'routines user+day index exists'
  );
select has_index(
    'public',
    'routines',
    'routines_active_idx',
    'routines active partial index exists'
  );
-- ---------------------------------------------------------------------------
-- TRIGGERS
-- ---------------------------------------------------------------------------
select has_trigger(
    'public',
    'routines',
    'routines_audit_trigger',
    'routines has audit trigger'
  );
select has_trigger(
    'public',
    'routines',
    'routines_updated_at',
    'routines has updated_at trigger'
  );
select has_trigger(
    'public',
    'routine_exercises',
    'routine_exercises_audit_trigger',
    'routine_exercises has audit trigger'
  );
select has_trigger(
    'public',
    'routine_exercises',
    'routine_exercises_updated_at',
    'routine_exercises has updated_at trigger'
  );
-- ---------------------------------------------------------------------------
-- FIXTURES
-- ---------------------------------------------------------------------------
insert into auth.users (
    id,
    email,
    encrypted_password,
    created_at,
    updated_at
  )
values (
    'bb000001-0000-0000-0000-000000000000',
    'pub@routines.test',
    'x',
    now(),
    now()
  ),
  (
    'bb000002-0000-0000-0000-000000000000',
    'priv@routines.test',
    'x',
    now(),
    now()
  );
-- usuario privado
update public.profiles
set is_public = false
where id = 'bb000002-0000-0000-0000-000000000000';
-- ejercicio para routine_exercises
insert into public.muscle_categories (name)
values ('__rcat__');
insert into public.exercises (name, slug, muscle_category_id)
select '__rexercise__',
  '__rexercise__',
  id
from public.muscle_categories
where name = '__rcat__';
-- ---------------------------------------------------------------------------
-- HAPPY PATH: crear rutina para día 0 (lunes)
-- ---------------------------------------------------------------------------
insert into public.routines (user_id, day_of_week, name)
values (
    'bb000001-0000-0000-0000-000000000000',
    0,
    'Lunes - Pecho'
  );
select results_eq(
    $$select count(*)::int
    from public.routines
    where user_id = 'bb000001-0000-0000-0000-000000000000'
      and day_of_week = 0 $$,
      $$values (1) $$,
      'routine created for day 0 successfully'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: 7 rutinas (una por día)
-- ---------------------------------------------------------------------------
insert into public.routines (user_id, day_of_week, name)
values (
    'bb000001-0000-0000-0000-000000000000',
    1,
    'Martes - Espalda'
  ),
  (
    'bb000001-0000-0000-0000-000000000000',
    2,
    'Miércoles - Hombros'
  ),
  (
    'bb000001-0000-0000-0000-000000000000',
    3,
    'Jueves - Bíceps'
  ),
  (
    'bb000001-0000-0000-0000-000000000000',
    4,
    'Viernes - Tríceps'
  ),
  (
    'bb000001-0000-0000-0000-000000000000',
    5,
    'Sábado - Pierna'
  ),
  (
    'bb000001-0000-0000-0000-000000000000',
    6,
    'Domingo - Cardio'
  );
select results_eq(
    $$select count(*)::int
    from public.routines
    where user_id = 'bb000001-0000-0000-0000-000000000000' $$,
      $$values (7) $$,
      'user can have one routine per day of week (7 total)'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: routine_exercise con reps = null (AMRAP)
-- ---------------------------------------------------------------------------
insert into public.routine_exercises (routine_id, exercise_id, sets, reps)
select r.id,
  e.id,
  3,
  null
from public.routines r,
  public.exercises e
where r.user_id = 'bb000001-0000-0000-0000-000000000000'
  and r.day_of_week = 0
  and e.name = '__rexercise__';
select results_eq(
    $$select count(*)::int
    from public.routine_exercises re
      join public.routines r on r.id = re.routine_id
    where r.user_id = 'bb000001-0000-0000-0000-000000000000'
      and re.reps is null $$,
      $$values (1) $$,
      'routine_exercise with null reps (AMRAP) inserted successfully'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: owner puede leer sus rutinas (RLS)
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config(
    'request.jwt.claim.sub',
    'bb000001-0000-0000-0000-000000000000',
    true
  );
select results_eq(
    $$select count(*)::int
    from public.routines
    where user_id = 'bb000001-0000-0000-0000-000000000000' $$,
      $$values (7) $$,
      'owner can read their own routines'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: otro usuario puede leer rutinas de perfil público
-- ---------------------------------------------------------------------------
select set_config(
    'request.jwt.claim.sub',
    'bb000002-0000-0000-0000-000000000000',
    true
  );
select results_eq(
    $$select count(*)::int
    from public.routines
    where user_id = 'bb000001-0000-0000-0000-000000000000' $$,
      $$values (7) $$,
      'other user can read routines of a public profile'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: perfil privado — rutinas no visibles para otro (RLS)
-- ---------------------------------------------------------------------------
insert into public.routines (user_id, day_of_week, name)
values (
    'bb000002-0000-0000-0000-000000000000',
    0,
    'Privado Lunes'
  );
select set_config(
    'request.jwt.claim.sub',
    'bb000001-0000-0000-0000-000000000000',
    true
  );
select results_eq(
    $$select count(*)::int
    from public.routines
    where user_id = 'bb000002-0000-0000-0000-000000000000' $$,
      $$values (0) $$,
      'routines of a private profile are hidden from other users (RLS)'
  );
reset role;
-- ---------------------------------------------------------------------------
-- ERROR CASE: segunda rutina mismo usuario mismo día → unique (23505)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.routines (user_id, day_of_week, name)
    values (
        'bb000001-0000-0000-0000-000000000000',
        0,
        'Lunes Duplicado'
      ) $$,
      '23505',
      null,
      'duplicate routine for same user+day raises unique violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: day_of_week = 7 → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.routines (user_id, day_of_week, name)
    values (
        'bb000001-0000-0000-0000-000000000000',
        7,
        'Día inválido'
      ) $$,
      '23514',
      null,
      'day_of_week = 7 raises check constraint violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: day_of_week = -1 → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.routines (user_id, day_of_week, name)
    values (
        'bb000002-0000-0000-0000-000000000000',
        -1,
        'Día negativo'
      ) $$,
      '23514',
      null,
      'day_of_week = -1 raises check constraint violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: duration_sec = 0 → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.routines (user_id, day_of_week, name, duration_sec)
    values (
        'bb000002-0000-0000-0000-000000000000',
        1,
        'Test',
        0
      ) $$,
      '23514',
      null,
      'duration_sec = 0 raises check constraint violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: duration_sec > 86400 → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.routines (user_id, day_of_week, name, duration_sec)
    values (
        'bb000002-0000-0000-0000-000000000000',
        2,
        'Test',
        86401
      ) $$,
      '23514',
      null,
      'duration_sec > 86400 raises check constraint violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: sets = 0 en routine_exercise → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.routine_exercises (routine_id, exercise_id, sets)
    select r.id,
      e.id,
      0
    from public.routines r,
      public.exercises e
    where r.user_id = 'bb000001-0000-0000-0000-000000000000'
      and r.day_of_week = 0
      and e.name = '__rexercise__' $$,
      '23514',
      null,
      'sets = 0 in routine_exercise raises check constraint violation'
  );
-- ---------------------------------------------------------------------------
-- AUDITORÍA: INSERT genera registro
-- ---------------------------------------------------------------------------
select results_eq(
    $$select count(*)::int
    from audit.audit_log
    where table_name = 'routines'
      and operation = 'INSERT' $$,
      $$values (8) $$,
      'audit_log records INSERT operations on routines (8 inserted)'
  );
select *
from finish();
rollback;