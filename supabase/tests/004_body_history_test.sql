-- =============================================================================
-- TEST 004: Historial de Mediciones Corporales
-- Migración: 20260401014937_body_history.sql
-- Cubre: body_snapshots — estructura, constraints, RLS, unique por día
-- =============================================================================
begin;
select plan(27);
-- ---------------------------------------------------------------------------
-- TABLA EXISTE
-- ---------------------------------------------------------------------------
select has_table(
    'public',
    'body_snapshots',
    'body_snapshots table exists'
  );
-- ---------------------------------------------------------------------------
-- COLUMNAS CLAVE
-- ---------------------------------------------------------------------------
select has_column(
    'public',
    'body_snapshots',
    'id',
    'body_snapshots.id exists'
  );
select has_column(
    'public',
    'body_snapshots',
    'user_id',
    'body_snapshots.user_id exists'
  );
select has_column(
    'public',
    'body_snapshots',
    'recorded_on',
    'body_snapshots.recorded_on exists'
  );
select has_column(
    'public',
    'body_snapshots',
    'weight_kg',
    'body_snapshots.weight_kg exists'
  );
select has_column(
    'public',
    'body_snapshots',
    'body_fat_pct',
    'body_snapshots.body_fat_pct exists'
  );
select has_column(
    'public',
    'body_snapshots',
    'muscle_mass_kg',
    'body_snapshots.muscle_mass_kg exists'
  );
select has_column(
    'public',
    'body_snapshots',
    'waist_cm',
    'body_snapshots.waist_cm exists'
  );
select has_column(
    'public',
    'body_snapshots',
    'notes',
    'body_snapshots.notes exists'
  );
-- ---------------------------------------------------------------------------
-- RLS HABILITADO
-- ---------------------------------------------------------------------------
select ok(
    (
      select relrowsecurity
      from pg_class
      where oid = 'public.body_snapshots'::regclass
    ),
    'body_snapshots has RLS enabled'
  );
-- ---------------------------------------------------------------------------
-- POLÍTICAS RLS
-- ---------------------------------------------------------------------------
select policies_are(
    'public',
    'body_snapshots',
    array ['body_snapshots_owner_read', 'body_snapshots_owner_write',
          'body_snapshots_owner_update', 'body_snapshots_owner_delete',
          'body_snapshots_admin'],
    'body_snapshots has exactly the expected RLS policies'
  );
-- ---------------------------------------------------------------------------
-- ÍNDICES
-- ---------------------------------------------------------------------------
select has_index(
    'public',
    'body_snapshots',
    'body_snapshots_user_date_idx',
    'user+date index exists'
  );
select has_index(
    'public',
    'body_snapshots',
    'body_snapshots_date_idx',
    'date index exists'
  );
-- ---------------------------------------------------------------------------
-- TRIGGERS
-- ---------------------------------------------------------------------------
select has_trigger(
    'public',
    'body_snapshots',
    'body_snapshots_audit_trigger',
    'body_snapshots has audit trigger'
  );
select has_trigger(
    'public',
    'body_snapshots',
    'body_snapshots_updated_at',
    'body_snapshots has updated_at trigger'
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
    'aaaa0001-0000-0000-0000-000000000000',
    'user1@body.test',
    'x',
    now(),
    now()
  ),
  (
    'aaaa0002-0000-0000-0000-000000000000',
    'user2@body.test',
    'x',
    now(),
    now()
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: snapshot mínimo (solo user_id + recorded_on)
-- ---------------------------------------------------------------------------
insert into public.body_snapshots (user_id, recorded_on)
values (
    'aaaa0001-0000-0000-0000-000000000000',
    '2026-01-01'
  );
select results_eq(
    $$select count(*)::int
    from public.body_snapshots
    where user_id = 'aaaa0001-0000-0000-0000-000000000000' $$,
      $$values (1) $$,
      'minimal body snapshot (user_id + recorded_on) inserted successfully'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: snapshot completo
-- ---------------------------------------------------------------------------
insert into public.body_snapshots (
    user_id,
    recorded_on,
    weight_kg,
    body_fat_pct,
    muscle_mass_kg,
    neck_cm,
    waist_cm,
    hips_cm,
    notes
  )
values (
    'aaaa0001-0000-0000-0000-000000000000',
    '2026-01-02',
    75.5,
    18.0,
    35.2,
    38.0,
    82.0,
    95.0,
    'Test snapshot'
  );
select results_eq(
    $$select weight_kg::numeric(6, 2)
    from public.body_snapshots
    where user_id = 'aaaa0001-0000-0000-0000-000000000000'
      and recorded_on = '2026-01-02' $$,
      $$values (75.50::numeric(6, 2)) $$,
      'full body snapshot inserted with correct weight_kg'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: owner puede leer su snapshot
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config(
    'request.jwt.claim.sub',
    'aaaa0001-0000-0000-0000-000000000000',
    true
  );
select results_eq(
    $$select count(*)::int
    from public.body_snapshots
    where user_id = 'aaaa0001-0000-0000-0000-000000000000' $$,
      $$values (2) $$,
      'owner can read their own body snapshots'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: usuario NO puede leer snapshots ajenos (RLS)
-- ---------------------------------------------------------------------------
select results_eq(
    $$select count(*)::int
    from public.body_snapshots
    where user_id = 'aaaa0002-0000-0000-0000-000000000000' $$,
      $$values (0) $$,
      'user cannot read another users body snapshots (RLS)'
  );
reset role;
-- ---------------------------------------------------------------------------
-- ERROR CASE: dos snapshots misma fecha mismo usuario → unique (23505)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.body_snapshots (user_id, recorded_on)
    values (
        'aaaa0001-0000-0000-0000-000000000000',
        '2026-01-01'
      ) $$,
      '23505',
      null,
      'duplicate snapshot for same user+day raises unique_violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: weight_kg = 0 → check violation (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.body_snapshots (user_id, recorded_on, weight_kg)
    values (
        'aaaa0001-0000-0000-0000-000000000000',
        '2026-02-01',
        0
      ) $$,
      '23514',
      null,
      'weight_kg = 0 raises check violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: weight_kg negativo → check violation (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.body_snapshots (user_id, recorded_on, weight_kg)
    values (
        'aaaa0001-0000-0000-0000-000000000000',
        '2026-02-02',
        -10
      ) $$,
      '23514',
      null,
      'negative weight_kg raises check violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: body_fat_pct > 100 → check violation (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.body_snapshots (user_id, recorded_on, body_fat_pct)
    values (
        'aaaa0001-0000-0000-0000-000000000000',
        '2026-02-03',
        101
      ) $$,
      '23514',
      null,
      'body_fat_pct > 100 raises check violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: body_fat_pct negativo → check violation (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.body_snapshots (user_id, recorded_on, body_fat_pct)
    values (
        'aaaa0001-0000-0000-0000-000000000000',
        '2026-02-04',
        -1
      ) $$,
      '23514',
      null,
      'negative body_fat_pct raises check violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: muscle_mass_kg = 0 → check violation (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.body_snapshots (user_id, recorded_on, muscle_mass_kg)
    values (
        'aaaa0001-0000-0000-0000-000000000000',
        '2026-02-05',
        0
      ) $$,
      '23514',
      null,
      'muscle_mass_kg = 0 raises check violation'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: updated_at se actualiza al modificar
-- ---------------------------------------------------------------------------
do $$
declare v_old timestamptz;
begin
select updated_at into v_old
from public.body_snapshots
where user_id = 'aaaa0001-0000-0000-0000-000000000000'
  and recorded_on = '2026-01-01';
perform pg_sleep(0.01);
update public.body_snapshots
set notes = 'updated'
where user_id = 'aaaa0001-0000-0000-0000-000000000000'
  and recorded_on = '2026-01-01';
end $$;
select ok(
    (
      select updated_at
      from public.body_snapshots
      where user_id = 'aaaa0001-0000-0000-0000-000000000000'
        and recorded_on = '2026-01-01'
    ) > now() - interval '5 seconds',
    'updated_at is refreshed on update'
  );
-- ---------------------------------------------------------------------------
-- AUDITORÍA: insert genera registro en audit.audit_log
-- ---------------------------------------------------------------------------
select results_eq(
    $$select count(*)::int
    from audit.audit_log
    where table_name = 'body_snapshots'
      and operation = 'INSERT'
      and record_id in (
        select id::text
        from public.body_snapshots
        where user_id = 'aaaa0001-0000-0000-0000-000000000000'
      ) $$,
      $$values (2) $$,
      'audit_log records INSERT operations on body_snapshots'
  );
select *
from finish();
rollback;