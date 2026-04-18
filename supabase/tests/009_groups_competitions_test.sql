-- =============================================================================
-- TEST 009: Grupos y Competiciones
-- Migración: 20260401015014_groups_competitions.sql
-- Cubre: groups, group_members, competitions, competition_days, competition_entries,
--        competition_validations — triggers, auto-approve/reject, resubmit, RLS
-- =============================================================================
begin;
select plan(61);
-- ---------------------------------------------------------------------------
-- TABLAS EXISTEN
-- ---------------------------------------------------------------------------
select has_table(
    'public',
    'groups',
    'groups table exists'
  );
select has_table(
    'public',
    'group_tags',
    'group_tags table exists'
  );
select has_table(
    'public',
    'group_tag_assignments',
    'group_tag_assignments table exists'
  );
select has_table(
    'public',
    'group_members',
    'group_members table exists'
  );
select has_table(
    'public',
    'competitions',
    'competitions table exists'
  );
select has_table(
    'public',
    'competition_exercises',
    'competition_exercises table exists'
  );
select has_table(
    'public',
    'competition_participants',
    'competition_participants table exists'
  );
select has_table(
    'public',
    'competition_days',
    'competition_days table exists'
  );
select has_table(
    'public',
    'competition_entries',
    'competition_entries table exists'
  );
select has_table(
    'public',
    'competition_validations',
    'competition_validations table exists'
  );
-- ---------------------------------------------------------------------------
-- COLUMNAS CLAVE
-- ---------------------------------------------------------------------------
select has_column(
    'public',
    'groups',
    'members_count',
    'groups.members_count exists'
  );
select has_column(
    'public',
    'groups',
    'is_public',
    'groups.is_public exists'
  );
select has_column(
    'public',
    'competitions',
    'start_date',
    'competitions.start_date exists'
  );
select has_column(
    'public',
    'competitions',
    'end_date',
    'competitions.end_date exists'
  );
select has_column(
    'public',
    'competitions',
    'status',
    'competitions.status exists'
  );
select has_column(
    'public',
    'competition_entries',
    'validation_status',
    'competition_entries.validation_status exists'
  );
select has_column(
    'public',
    'competition_entries',
    'approvals_count',
    'competition_entries.approvals_count exists'
  );
select has_column(
    'public',
    'competition_entries',
    'rejections_count',
    'competition_entries.rejections_count exists'
  );
select has_column(
    'public',
    'competition_entries',
    'resulting_pr_id',
    'competition_entries.resulting_pr_id exists'
  );
-- ---------------------------------------------------------------------------
-- RLS HABILITADO
-- ---------------------------------------------------------------------------
select ok(
    (
      select relrowsecurity
      from pg_class
      where oid = 'public.groups'::regclass
    ),
    'groups has RLS enabled'
  );
select ok(
    (
      select relrowsecurity
      from pg_class
      where oid = 'public.group_members'::regclass
    ),
    'group_members has RLS enabled'
  );
select ok(
    (
      select relrowsecurity
      from pg_class
      where oid = 'public.competitions'::regclass
    ),
    'competitions has RLS enabled'
  );
select ok(
    (
      select relrowsecurity
      from pg_class
      where oid = 'public.competition_entries'::regclass
    ),
    'competition_entries has RLS enabled'
  );
select ok(
    (
      select relrowsecurity
      from pg_class
      where oid = 'public.competition_validations'::regclass
    ),
    'competition_validations has RLS enabled'
  );
-- ---------------------------------------------------------------------------
-- FUNCIONES
-- ---------------------------------------------------------------------------
select has_function(
    'public',
    'is_group_member',
    array ['uuid'],
    'is_group_member(uuid) exists'
  );
select has_function(
    'public',
    'prevent_self_validation',
    'prevent_self_validation function exists'
  );
select has_function(
    'public',
    'process_validation_vote',
    'process_validation_vote function exists'
  );
select has_function(
    'public',
    'resubmit_entry',
    array ['uuid','text','text','numeric'],
    'resubmit_entry function exists'
  );
select has_function(
    'public',
    'generate_competition_days',
    'generate_competition_days function exists'
  );
select has_function(
    'public',
    'update_group_members_count',
    'update_group_members_count function exists'
  );
-- ---------------------------------------------------------------------------
-- TRIGGERS
-- ---------------------------------------------------------------------------
select has_trigger(
    'public',
    'group_members',
    'group_members_count_trigger',
    'group_members has count trigger'
  );
select has_trigger(
    'public',
    'competitions',
    'competitions_generate_days',
    'competitions has generate_days trigger'
  );
select has_trigger(
    'public',
    'competition_validations',
    'competition_validations_no_self',
    'competition_validations has no_self trigger'
  );
select has_trigger(
    'public',
    'competition_validations',
    'competition_validations_process',
    'competition_validations has process trigger'
  );
select has_trigger(
    'public',
    'groups',
    'groups_audit_trigger',
    'groups has audit trigger'
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
    'ee000001-0000-0000-0000-000000000000',
    'owner@grp.test',
    'x',
    now(),
    now()
  ),
  (
    'ee000002-0000-0000-0000-000000000000',
    'member1@grp.test',
    'x',
    now(),
    now()
  ),
  (
    'ee000003-0000-0000-0000-000000000000',
    'member2@grp.test',
    'x',
    now(),
    now()
  ),
  (
    'ee000004-0000-0000-0000-000000000000',
    'member3@grp.test',
    'x',
    now(),
    now()
  ),
  (
    'ee000005-0000-0000-0000-000000000000',
    'outsider@grp.test',
    'x',
    now(),
    now()
  );
-- Ejercicio de prueba
insert into public.muscle_categories (name)
values ('__gcat__');
insert into public.exercises (name, slug, muscle_category_id)
select '__gex__',
  '__gex__',
  id
from public.muscle_categories
where name = '__gcat__';
-- ---------------------------------------------------------------------------
-- HAPPY PATH: crear grupo
-- ---------------------------------------------------------------------------
insert into public.groups (id, owner_id, name, is_public)
values (
    'ffffffff-0000-0000-0000-000000000001',
    'ee000001-0000-0000-0000-000000000000',
    'Grupo de prueba',
    true
  );
select results_eq(
    $$select count(*)::int
    from public.groups
    where name = 'Grupo de prueba' $$,
      $$values (1) $$,
      'group created successfully'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: miembro activo → members_count incrementa
-- ---------------------------------------------------------------------------
insert into public.group_members (group_id, user_id, role, status)
values (
    'ffffffff-0000-0000-0000-000000000001',
    'ee000001-0000-0000-0000-000000000000',
    'owner',
    'active'
  ),
  (
    'ffffffff-0000-0000-0000-000000000001',
    'ee000002-0000-0000-0000-000000000000',
    'member',
    'active'
  ),
  (
    'ffffffff-0000-0000-0000-000000000001',
    'ee000003-0000-0000-0000-000000000000',
    'member',
    'active'
  ),
  (
    'ffffffff-0000-0000-0000-000000000001',
    'ee000004-0000-0000-0000-000000000000',
    'member',
    'active'
  );
select results_eq(
    $$select members_count
    from public.groups
    where id = 'ffffffff-0000-0000-0000-000000000001' $$,
      $$values (4) $$,
      'members_count increments for each active member inserted'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: miembro pendiente NO incrementa members_count
-- ---------------------------------------------------------------------------
insert into public.group_members (group_id, user_id, role, status)
values (
    'ffffffff-0000-0000-0000-000000000001',
    'ee000005-0000-0000-0000-000000000000',
    'member',
    'pending'
  );
select results_eq(
    $$select members_count
    from public.groups
    where id = 'ffffffff-0000-0000-0000-000000000001' $$,
      $$values (4) $$,
      'pending member does not increment members_count'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: activar miembro pendiente → members_count incrementa
-- ---------------------------------------------------------------------------
update public.group_members
set status = 'active'
where group_id = 'ffffffff-0000-0000-0000-000000000001'
  and user_id = 'ee000005-0000-0000-0000-000000000000';
select results_eq(
    $$select members_count
    from public.groups
    where id = 'ffffffff-0000-0000-0000-000000000001' $$,
      $$values (5) $$,
      'members_count increments when pending member becomes active'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: banear miembro activo → members_count decrementa
-- ---------------------------------------------------------------------------
update public.group_members
set status = 'banned'
where group_id = 'ffffffff-0000-0000-0000-000000000001'
  and user_id = 'ee000005-0000-0000-0000-000000000000';
select results_eq(
    $$select members_count
    from public.groups
    where id = 'ffffffff-0000-0000-0000-000000000001' $$,
      $$values (4) $$,
      'members_count decrements when active member is banned'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: crear competición → días auto-generados
-- ---------------------------------------------------------------------------
insert into public.competitions (
    id,
    group_id,
    created_by,
    title,
    start_date,
    end_date,
    status
  )
values (
    'cccccccc-1111-0000-0000-000000000001',
    'ffffffff-0000-0000-0000-000000000001',
    'ee000001-0000-0000-0000-000000000000',
    'Competición Test',
    '2026-06-01',
    '2026-06-05',
    'active'
  );
select results_eq(
    $$select count(*)::int
    from public.competition_days
    where competition_id = 'cccccccc-1111-0000-0000-000000000001' $$,
      $$values (5) $$,
      '5 competition_days auto-generated for a 5-day competition'
  );
-- Registrar ejercicio para la competición
insert into public.competition_exercises (competition_id, exercise_id)
select 'cccccccc-1111-0000-0000-000000000001',
  id
from public.exercises
where name = '__gex__';
-- ---------------------------------------------------------------------------
-- HAPPY PATH: es_group_member retorna true/false correctamente
-- ---------------------------------------------------------------------------
set local "request.jwt.claims" to '{"sub":"ee000002-0000-0000-0000-000000000000","role":"authenticated"}';
select ok(
    public.is_group_member('ffffffff-0000-0000-0000-000000000001'),
    'is_group_member returns true for an active member'
  );
set local "request.jwt.claims" to '{"sub":"ee000005-0000-0000-0000-000000000000","role":"authenticated"}';
select ok(
    not public.is_group_member('ffffffff-0000-0000-0000-000000000001'),
    'is_group_member returns false for a banned member'
  );
reset role;
-- ---------------------------------------------------------------------------
-- HAPPY PATH: flujo completo de validación — auto-aprobación (3+ aprobaciones con mayoría)
-- ---------------------------------------------------------------------------
-- Obtener el primer día de la competición
do $$
declare v_day_id uuid;
v_ex_id uuid;
begin
select id into v_day_id
from public.competition_days
where competition_id = 'cccccccc-1111-0000-0000-000000000001'
order by day_date
limit 1;
select id into v_ex_id
from public.exercises
where name = '__gex__';
-- Entrada del miembro 2
insert into public.competition_entries (
    id,
    competition_day_id,
    competition_id,
    exercise_id,
    user_id,
    video_url,
    pr_value
  )
values (
    'eeeeeeee-aaaa-0000-0000-000000000001',
    v_day_id,
    'cccccccc-1111-0000-0000-000000000001',
    v_ex_id,
    'ee000002-0000-0000-0000-000000000000',
    'https://storage.example.com/video1.mp4',
    100.0
  );
-- 3 aprobaciones de miembros distintos (umbral = 3)
insert into public.competition_validations (entry_id, validator_id, vote)
values (
    'eeeeeeee-aaaa-0000-0000-000000000001',
    'ee000001-0000-0000-0000-000000000000',
    'approve'
  ),
  (
    'eeeeeeee-aaaa-0000-0000-000000000001',
    'ee000003-0000-0000-0000-000000000000',
    'approve'
  ),
  (
    'eeeeeeee-aaaa-0000-0000-000000000001',
    'ee000004-0000-0000-0000-000000000000',
    'approve'
  );
end $$;
select results_eq(
    $$select validation_status
    from public.competition_entries
    where id = 'eeeeeeee-aaaa-0000-0000-000000000001' $$,
      $$values ('approved') $$,
      'entry is auto-approved after 3 approvals with majority'
  );
select results_eq(
    $$select approvals_count
    from public.competition_entries
    where id = 'eeeeeeee-aaaa-0000-0000-000000000001' $$,
      $$values (3) $$,
      'approvals_count is updated to 3 after votes'
  );
-- PR validado creado automáticamente
select results_eq(
    $$select count(*)::int
    from public.personal_records
    where user_id = 'ee000002-0000-0000-0000-000000000000'
      and source = 'validated' $$,
      $$values (1) $$,
      'validated PR is auto-created in personal_records after approval'
  );
-- resulting_pr_id apunta al PR creado
select isnt(
    (
      select resulting_pr_id
      from public.competition_entries
      where id = 'eeeeeeee-aaaa-0000-0000-000000000001'
    ),
    null,
    'resulting_pr_id is set after auto-approval'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: auto-rechazo (3+ rechazos con mayoría)
-- ---------------------------------------------------------------------------
do $$
declare v_day_id uuid;
v_ex_id uuid;
begin
select id into v_day_id
from public.competition_days
where competition_id = 'cccccccc-1111-0000-0000-000000000001'
order by day_date offset 1
limit 1;
select id into v_ex_id
from public.exercises
where name = '__gex__';
insert into public.competition_entries (
    id,
    competition_day_id,
    competition_id,
    exercise_id,
    user_id,
    video_url,
    pr_value
  )
values (
    'eeeeeeee-bbbb-0000-0000-000000000001',
    v_day_id,
    'cccccccc-1111-0000-0000-000000000001',
    v_ex_id,
    'ee000003-0000-0000-0000-000000000000',
    'https://storage.example.com/video2.mp4',
    50.0
  );
insert into public.competition_validations (entry_id, validator_id, vote)
values (
    'eeeeeeee-bbbb-0000-0000-000000000001',
    'ee000001-0000-0000-0000-000000000000',
    'reject'
  ),
  (
    'eeeeeeee-bbbb-0000-0000-000000000001',
    'ee000002-0000-0000-0000-000000000000',
    'reject'
  ),
  (
    'eeeeeeee-bbbb-0000-0000-000000000001',
    'ee000004-0000-0000-0000-000000000000',
    'reject'
  );
end $$;
select results_eq(
    $$select validation_status
    from public.competition_entries
    where id = 'eeeeeeee-bbbb-0000-0000-000000000001' $$,
      $$values ('rejected') $$,
      'entry is auto-rejected after 3 rejections with majority'
  );
select results_eq(
    $$select rejections_count
    from public.competition_entries
    where id = 'eeeeeeee-bbbb-0000-0000-000000000001' $$,
      $$values (3) $$,
      'rejections_count is updated to 3'
  );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: resubmit_entry en entry rechazada → resetea votos
-- ---------------------------------------------------------------------------
-- Contexto: el dueño de la entry rechazada
set local role authenticated;
select set_config(
    'request.jwt.claim.sub',
    'ee000003-0000-0000-0000-000000000000',
    true
  );
select set_config(
    'request.jwt.claims',
    '{"sub":"ee000003-0000-0000-0000-000000000000","role":"authenticated"}',
    true
  );
select lives_ok(
    $$select public.resubmit_entry(
      'eeeeeeee-bbbb-0000-0000-000000000001',
      'https://storage.example.com/video3.mp4',
      'Intento corregido',
      55.0
    ) $$,
    'resubmit_entry succeeds on a rejected entry'
  );
select results_eq(
    $$select validation_status
    from public.competition_entries
    where id = 'eeeeeeee-bbbb-0000-0000-000000000001' $$,
      $$values ('resubmitted') $$,
      'entry status changes to resubmitted after resubmit_entry'
  );
select results_eq(
    $$select approvals_count,
    rejections_count
    from public.competition_entries
    where id = 'eeeeeeee-bbbb-0000-0000-000000000001' $$,
      $$values (0, 0) $$,
      'vote counts reset to 0 after resubmit_entry'
  );
select results_eq(
    $$select count(*)::int
    from public.competition_validations
    where entry_id = 'eeeeeeee-bbbb-0000-0000-000000000001' $$,
      $$values (0) $$,
      'existing votes deleted after resubmit_entry'
  );
reset role;
-- ---------------------------------------------------------------------------
-- ERROR CASE: auto-validación → trigger lanza excepción
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.competition_validations (entry_id, validator_id, vote)
    values (
        'eeeeeeee-aaaa-0000-0000-000000000001',
        'ee000002-0000-0000-0000-000000000000',
        'approve'
      ) $$,
      'P0001',
      'Users cannot validate their own competition entries',
      'self-validation raises exception from prevent_self_validation trigger'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: resubmit_entry en entry NO rechazada → excepción controlada
-- ---------------------------------------------------------------------------
select throws_ok(
    $$select public.resubmit_entry(
      'eeeeeeee-aaaa-0000-0000-000000000001',
      'https://x.com/v',
      '',
      1.0
    ) $$,
    'P0001',
    'Entry not found or not in rejected state',
    'resubmit_entry on non-rejected entry raises controlled exception'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: competición con end_date < start_date → check (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.competitions (
      group_id,
      created_by,
      title,
      start_date,
      end_date
    )
    values (
        'ffffffff-0000-0000-0000-000000000001',
        'ee000001-0000-0000-0000-000000000000',
        'Comp inválida',
        '2026-06-10',
        '2026-06-05'
      ) $$,
      '23514',
      null,
      'competition with end_date before start_date raises check constraint violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: nombre de grupo < 3 chars → check (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.groups (owner_id, name)
    values ('ee000001-0000-0000-0000-000000000000', 'AB') $$,
      '23514',
      null,
      'group name shorter than 3 chars raises check constraint violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: entrada duplicada (mismo day + user + exercise) → unique (23505)
-- ---------------------------------------------------------------------------
select throws_ok(
    $$insert into public.competition_entries (
      competition_day_id,
      competition_id,
      exercise_id,
      user_id,
      video_url,
      pr_value
    )
    select cd.id,
      'cccccccc-1111-0000-0000-000000000001',
      e.id,
      'ee000002-0000-0000-0000-000000000000',
      'https://x.com/v2',
      110.0
    from public.competition_days cd,
      public.exercises e
    where cd.competition_id = 'cccccccc-1111-0000-0000-000000000001'
      and e.name = '__gex__'
    order by cd.day_date
    limit 1 $$, '23505', null,
      'duplicate competition entry (same day+user+exercise) raises unique violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: entrada con ejercicio no registrado en la competición → FK (23503)
-- ---------------------------------------------------------------------------
insert into public.muscle_categories (name)
values ('__gcat2__');
insert into public.exercises (name, slug, muscle_category_id)
select '__gex2__',
  '__gex2__',
  id
from public.muscle_categories
where name = '__gcat2__';
select throws_ok(
    $$insert into public.competition_entries (
      competition_day_id,
      competition_id,
      exercise_id,
      user_id,
      video_url,
      pr_value
    )
    select cd.id,
      'cccccccc-1111-0000-0000-000000000001',
      e.id,
      'ee000003-0000-0000-0000-000000000000',
      'https://x.com/v_bad',
      80.0
    from public.competition_days cd,
      public.exercises e
    where cd.competition_id = 'cccccccc-1111-0000-0000-000000000001'
      and e.name = '__gex2__'
    order by cd.day_date offset 2
    limit 1 $$, '23503', null,
      'competition entry with unregistered exercise raises FK violation'
  );
-- ---------------------------------------------------------------------------
-- ERROR CASE: competición solo visible para miembros del grupo (RLS)
-- ---------------------------------------------------------------------------
-- Asegurar que el grupo NO sea público (clave para que el test tenga sentido)
update public.groups
set is_public = false
where id = 'ffffffff-0000-0000-0000-000000000001';
set local role authenticated;
-- ---------------------------------------------------------------------------
-- Caso 1: usuario NO miembro activo (baneado) → NO ve la competición
-- ---------------------------------------------------------------------------
select set_config(
    'request.jwt.claim.sub',
    'ee000005-0000-0000-0000-000000000000',
    true
  );
select set_config(
    'request.jwt.claims',
    '{"sub":"ee000005-0000-0000-0000-000000000000","role":"authenticated"}',
    true
  );
select results_eq(
    $$select count(*)::int
    from public.competitions
    where id = 'cccccccc-1111-0000-0000-000000000001' $$,
      $$values (0) $$,
      'competition is not visible to non-members (RLS)'
  );
-- ---------------------------------------------------------------------------
-- Caso 2: usuario miembro activo → SÍ ve la competición
-- ---------------------------------------------------------------------------
select set_config(
    'request.jwt.claim.sub',
    'ee000002-0000-0000-0000-000000000000',
    true
  );
select set_config(
    'request.jwt.claims',
    '{"sub":"ee000002-0000-0000-0000-000000000000","role":"authenticated"}',
    true
  );
select results_eq(
    $$select count(*)::int
    from public.competitions
    where id = 'cccccccc-1111-0000-0000-000000000001' $$,
      $$values (1) $$,
      'competition is visible to active group members (RLS)'
  );
reset role;
select *
from finish();
rollback;