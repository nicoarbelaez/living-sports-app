-- =============================================================================
-- TEST 007: Récords Personales (PRs)
-- Migración: 20260401015009_personal_records.sql
-- Cubre: personal_records, v_personal_records_best — constraints, RLS, vista
-- =============================================================================
begin;
select plan(28);
grant select on public.profiles to authenticated;
-- ---------------------------------------------------------------------------
-- TABLA Y VISTA EXISTEN
-- ---------------------------------------------------------------------------
select has_table(
    'public',
    'personal_records',
    'personal_records table exists'
  );
select has_view (
    'public',
    'v_personal_records_best',
    'v_personal_records_best view exists'
  );
-- ---------------------------------------------------------------------------
-- COLUMNAS CLAVE
-- ---------------------------------------------------------------------------
select has_column(
    'public',
    'personal_records',
    'id',
    'personal_records.id exists'
  );
select has_column(
    'public',
    'personal_records',
    'user_id',
    'personal_records.user_id exists'
  );
select has_column(
    'public',
    'personal_records',
    'exercise_id',
    'personal_records.exercise_id exists'
  );
select has_column(
    'public',
    'personal_records',
    'value',
    'personal_records.value exists'
  );
select has_column(
    'public',
    'personal_records',
    'source',
    'personal_records.source exists'
  );
select has_column(
    'public',
    'personal_records',
    'achieved_on',
    'personal_records.achieved_on exists'
  );
select has_column(
    'public',
    'personal_records',
    'media_url',
    'personal_records.media_url exists'
  );
select has_column(
    'public',
    'personal_records',
    'media_type',
    'personal_records.media_type exists'
  );
-- ---------------------------------------------------------------------------
-- RLS HABILITADO
-- ---------------------------------------------------------------------------
select ok(
    (
      select relrowsecurity
      from pg_class
      where oid = 'public.personal_records'::regclass
    ),
    'personal_records has RLS enabled'
  );
-- ---------------------------------------------------------------------------
-- POLÍTICAS RLS
-- ---------------------------------------------------------------------------
select policies_are(
    'public',
    'personal_records',
    array ['pr_owner_read','pr_public_read','pr_owner_insert',
          'pr_owner_update','pr_owner_delete','pr_admin'],
    'personal_records has exactly the expected RLS policies'
  );
-- ---------------------------------------------------------------------------
-- ÍNDICES
-- ---------------------------------------------------------------------------
select has_index(
    'public',
    'personal_records',
    'pr_user_exercise_idx',
    'user+exercise index exists'
  );
select has_index(
    'public',
    'personal_records',
    'pr_exercise_value_idx',
    'exercise+value index exists'
  );
select has_index(
    'public',
    'personal_records',
    'pr_pending_idx',
    'partial pending index exists'
  );
-- ---------------------------------------------------------------------------
-- TRIGGERS
-- ---------------------------------------------------------------------------
select has_trigger(
    'public',
    'personal_records',
    'personal_records_audit_trigger',
    'personal_records has audit trigger'
  );
select has_trigger(
    'public',
    'personal_records',
    'personal_records_updated_at',
    'personal_records has updated_at trigger'
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
    'cc000001-0000-0000-0000-000000000000',
    'pub@pr.test',
    'x',
    now(),
    now()
  ),
  (
    'cc000002-0000-0000-0000-000000000000',
    'priv@pr.test',
    'x',
    now(),
    now()
  );
update public.profiles
set is_public = false
where id = 'cc000002-0000-0000-0000-000000000000';
insert into public.muscle_categories (name)
values ('__prcat__');
insert into public.exercises (name, slug, muscle_category_id)
select '__prex__',
  '__prex__',
  id
from public.muscle_categories
where name = '__prcat__';
-- ---------------------------------------------------------------------------
-- HAPPY PATH: PR con source='self'
-- ---------------------------------------------------------------------------
insert into public.personal_records (user_id, exercise_id, value, achieved_on, source)
select 'cc000001-0000-0000-0000-000000000000',
  id,
  100.0,
  current_date,
  'self'
from public.exercises
where name = '__prex__';
select results_eq(
    $$select count(*)::int
    from public.personal_records
    where user_id = 'cc000001-0000-0000-0000-000000000000'
      and source = 'self' $$,
      $$values (1) $$,
      'PR with source=self inserted successfully'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: múltiples PRs → v_personal_records_best retorna el mayor valor
-- ---------------------------------------------------------------------------
insert into public.personal_records (user_id, exercise_id, value, achieved_on, source)
select 'cc000001-0000-0000-0000-000000000000',
  id,
  120.0,
  current_date - 1,
  'self'
from public.exercises
where name = '__prex__';
insert into public.personal_records (user_id, exercise_id, value, achieved_on, source)
select 'cc000001-0000-0000-0000-000000000000',
  id,
  90.0,
  current_date - 2,
  'self'
from public.exercises
where name = '__prex__';
select results_eq(
    $$select value::numeric(10, 0)
    from public.v_personal_records_best
    where user_id = 'cc000001-0000-0000-0000-000000000000'
      and exercise_id = (
        select id
        from public.exercises
        where name = '__prex__'
      ) $$,
      $$values (120::numeric(10, 0)) $$,
      'v_personal_records_best returns the highest value for user+exercise'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: source='pending' NO aparece en la vista best
-- ---------------------------------------------------------------------------
insert into public.personal_records (user_id, exercise_id, value, achieved_on, source)
select 'cc000001-0000-0000-0000-000000000000',
  id,
  999.0,
  current_date,
  'pending'
from public.exercises
where name = '__prex__';
select results_eq(
    $$select value::numeric(10, 0)
    from public.v_personal_records_best
    where user_id = 'cc000001-0000-0000-0000-000000000000'
      and exercise_id = (
        select id
        from public.exercises
        where name = '__prex__'
      ) $$,
      $$values (120::numeric(10, 0)) $$,
      'v_personal_records_best excludes PRs with source=pending'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: perfil público — sus PRs visibles para otros
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config(
    'request.jwt.claim.sub',
    'cc000002-0000-0000-0000-000000000000',
    true
  );
select results_eq(
    $$select count(*)::int
    from public.personal_records
    where user_id = 'cc000001-0000-0000-0000-000000000000'
      and source in ('self', 'validated') $$,
      $$values (3) $$,
      'other user can see self/validated PRs of a public profile'
  );
reset role;
-- ---------------------------------------------------------------------------
-- ERROR CASE: PR de perfil privado → invisible para otro usuario (RLS)
-- ---------------------------------------------------------------------------
insert into public.personal_records (user_id, exercise_id, value, source)
select 'cc000002-0000-0000-0000-000000000000',
  id,
  200.0,
  'self'
from public.exercises
where name = '__prex__';
set local role authenticated;
select set_config(
    'request.jwt.claim.sub',
    'cc000001-0000-0000-0000-000000000000',
    true
  );
select results_eq(
    $$select count(*)::int
    from public.personal_records
    where user_id = 'cc000002-0000-0000-0000-000000000000' $$,
      $$values (0) $$,
      'PRs of a private profile are hidden from other users (RLS)'
  );
reset role;
-- ---------------------------------------------------------------------------
-- ERROR CASE: value = 0 → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.personal_records (user_id, exercise_id, value, source)
    select 'cc000001-0000-0000-0000-000000000000',
      id,
      0,
      'self'
    from public.exercises
    where name = '__prex__' $$,
      '23514',
      null,
      'value = 0 raises check constraint violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: value negativo → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.personal_records (user_id, exercise_id, value, source)
    select 'cc000001-0000-0000-0000-000000000000',
      id,
      -5,
      'self'
    from public.exercises
    where name = '__prex__' $$,
      '23514',
      null,
      'negative value raises check constraint violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: source inválido → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.personal_records (user_id, exercise_id, value, source)
    select 'cc000001-0000-0000-0000-000000000000',
      id,
      50,
      'manual'
    from public.exercises
    where name = '__prex__' $$,
      '23514',
      null,
      'invalid source value raises check constraint violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: media_type inválido → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.personal_records (
      user_id,
      exercise_id,
      value,
      source,
      media_url,
      media_type
    )
    select 'cc000001-0000-0000-0000-000000000000',
      id,
      50,
      'self',
      'https://x.com/v',
      'gif'
    from public.exercises
    where name = '__prex__' $$,
      '23514',
      null,
      'invalid media_type raises check constraint violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: usuario autenticado NO puede insertar source='validated' (RLS INSERT check)
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config(
    'request.jwt.claim.sub',
    'cc000001-0000-0000-0000-000000000000',
    true
  );
select throws_ok(
    $$
    insert into public.personal_records (user_id, exercise_id, value, source)
    select 'cc000001-0000-0000-0000-000000000000',
      id,
      150,
      'validated'
    from public.exercises
    where name = '__prex__' $$,
      null,
      null,
      'authenticated user cannot insert PR with source=validated (RLS blocks it)'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: owner NO puede eliminar PR con source='validated' (RLS DELETE)
-- ---------------------------------------------------------------------------
-- Insertar un PR validated como service_role
reset role;
insert into public.personal_records (user_id, exercise_id, value, source)
select 'cc000001-0000-0000-0000-000000000000',
  id,
  130,
  'validated'
from public.exercises
where name = '__prex__';
set local role authenticated;
select set_config(
    'request.jwt.claim.sub',
    'cc000001-0000-0000-0000-000000000000',
    true
  );
select results_eq(
    $$delete
    from public.personal_records
    where user_id = 'cc000001-0000-0000-0000-000000000000'
      and source = 'validated'
    returning id $$,
      $$select null::uuid
    where false $$,
      'owner cannot delete a validated PR (RLS blocks it)'
  );
reset role;
select *
from finish();
rollback;