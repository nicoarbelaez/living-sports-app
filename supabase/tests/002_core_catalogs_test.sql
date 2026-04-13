-- =============================================================================
-- TEST 002: Catálogos Core
-- Migración: 20260401014933_core_catalogs.sql
-- Cubre: app_roles, muscle_categories, exercises — estructura, seed, RLS, constraints
-- =============================================================================
begin;
select plan(35);
-- ---------------------------------------------------------------------------
-- TABLAS EXISTEN
-- ---------------------------------------------------------------------------
select has_table(
        'public',
        'app_roles',
        'app_roles table exists'
    );
select has_table(
        'public',
        'muscle_categories',
        'muscle_categories table exists'
    );
select has_table(
        'public',
        'exercises',
        'exercises table exists'
    );
-- ---------------------------------------------------------------------------
-- COLUMNAS CLAVE EN exercises
-- ---------------------------------------------------------------------------
select has_column(
        'public',
        'exercises',
        'id',
        'exercises.id exists'
    );
select has_column(
        'public',
        'exercises',
        'name',
        'exercises.name exists'
    );
select has_column(
        'public',
        'exercises',
        'slug',
        'exercises.slug exists'
    );
select has_column(
        'public',
        'exercises',
        'muscle_category_id',
        'exercises.muscle_category_id exists'
    );
select has_column(
        'public',
        'exercises',
        'is_active',
        'exercises.is_active exists'
    );
select has_column(
        'public',
        'exercises',
        'created_at',
        'exercises.created_at exists'
    );
select has_column(
        'public',
        'exercises',
        'updated_at',
        'exercises.updated_at exists'
    );
-- ---------------------------------------------------------------------------
-- RLS HABILITADO
-- ---------------------------------------------------------------------------
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.app_roles'::regclass
        ),
        'app_roles has RLS enabled'
    );
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.muscle_categories'::regclass
        ),
        'muscle_categories has RLS enabled'
    );
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.exercises'::regclass
        ),
        'exercises has RLS enabled'
    );
-- ---------------------------------------------------------------------------
-- POLÍTICAS RLS
-- ---------------------------------------------------------------------------
select policies_are(
        'public',
        'app_roles',
        array ['catalog_read_authenticated'],
        'app_roles has exactly the expected policies'
    );
select policies_are(
        'public',
        'muscle_categories',
        array ['catalog_read_authenticated'],
        'muscle_categories has exactly the expected policies'
    );
select policies_are(
        'public',
        'exercises',
        array ['exercises_read_active', 'exercises_admin_all'],
        'exercises has exactly the expected policies'
    );
-- ---------------------------------------------------------------------------
-- ÍNDICES
-- ---------------------------------------------------------------------------
select has_index(
        'public',
        'exercises',
        'exercises_name_trgm_idx',
        'trigram index on exercises.name exists'
    );
select has_index(
        'public',
        'exercises',
        'exercises_active_idx',
        'partial index on exercises(is_active) exists'
    );
select has_index(
        'public',
        'exercises',
        'exercises_muscle_category_idx',
        'index on exercises.muscle_category_id exists'
    );
-- ---------------------------------------------------------------------------
-- AUDIT TRIGGERS
-- ---------------------------------------------------------------------------
select has_trigger(
        'public',
        'app_roles',
        'app_roles_audit_trigger',
        'app_roles has audit trigger'
    );
select has_trigger(
        'public',
        'muscle_categories',
        'muscle_categories_audit_trigger',
        'muscle_categories has audit trigger'
    );
select has_trigger(
        'public',
        'exercises',
        'exercises_audit_trigger',
        'exercises has audit trigger'
    );
-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- ---------------------------------------------------------------------------
select has_trigger(
        'public',
        'exercises',
        'exercises_updated_at',
        'exercises has updated_at trigger'
    );
select has_trigger(
        'public',
        'muscle_categories',
        'muscle_categories_updated_at',
        'muscle_categories has updated_at trigger'
    );
select has_trigger(
        'public',
        'app_roles',
        'app_roles_updated_at',
        'app_roles has updated_at trigger'
    );
-- ---------------------------------------------------------------------------
-- SEED DATA: roles
-- ---------------------------------------------------------------------------
select results_eq(
        $$select count(*)::int
        from public.app_roles
        where name = 'admin' $$,
            $$values (1) $$,
            'admin role is seeded'
    );
select results_eq(
        $$select count(*)::int
        from public.app_roles
        where name = 'user' $$,
            $$values (1) $$,
            'user role is seeded'
    );
-- ---------------------------------------------------------------------------
-- SEED DATA: 13 categorías musculares
-- ---------------------------------------------------------------------------
select results_eq(
        $$select count(*)::int
        from public.muscle_categories $$,
            $$values (13) $$,
            '13 muscle categories are seeded'
    );
-- ---------------------------------------------------------------------------
-- FIXTURES DE PRUEBA (admin inserta, rollback lo limpia)
-- ---------------------------------------------------------------------------
insert into public.muscle_categories (name)
values ('__test_cat__');
insert into public.exercises (name, slug, muscle_category_id)
select '__test_exercise__',
    '__test_slug__',
    id
from public.muscle_categories
where name = '__test_cat__';
-- ---------------------------------------------------------------------------
-- HAPPY PATH: ejercicio activo visible para autenticado
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config(
        'request.jwt.claim.sub',
        '00000000-0000-0000-0000-000000000099',
        true
    );
select results_eq(
        $$select count(*)::int
        from public.exercises
        where name = '__test_exercise__'
            and is_active = true $$,
            $$values (1) $$,
            'authenticated user can read an active exercise'
    );
select results_eq(
        $$select count(*)::int
        from public.muscle_categories
        where name = '__test_cat__' $$,
            $$values (1) $$,
            'authenticated user can read muscle_categories'
    );
reset role;
-- ---------------------------------------------------------------------------
-- ERROR CASE: ejercicio inactivo → invisible via RLS (exercises_read_active)
-- ---------------------------------------------------------------------------
update public.exercises
set is_active = false
where name = '__test_exercise__';
set local role authenticated;
select set_config(
        'request.jwt.claim.sub',
        '00000000-0000-0000-0000-000000000099',
        true
    );
select results_eq(
        $$select count(*)::int
        from public.exercises
        where name = '__test_exercise__' $$,
            $$values (0) $$,
            'inactive exercise is hidden from authenticated user by RLS'
    );
reset role;
update public.exercises
set is_active = true
where name = '__test_exercise__';
-- ---------------------------------------------------------------------------
-- ERROR CASE: nombre duplicado en exercises → unique violation (23505)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$insert into public.exercises (name, slug, muscle_category_id)
        select '__test_exercise__',
            '__other_slug__',
            id
        from public.muscle_categories
        where name = '__test_cat__' $$,
            '23505',
            null,
            'duplicate exercise name raises unique_violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: slug duplicado → unique violation (23505)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$insert into public.exercises (name, slug, muscle_category_id)
        select '__other_name__',
            '__test_slug__',
            id
        from public.muscle_categories
        where name = '__test_cat__' $$,
            '23505',
            null,
            'duplicate exercise slug raises unique_violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: muscle_category_id inexistente → FK violation (23503)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$insert into public.exercises (name, slug, muscle_category_id)
        values ('__bad__', '__bad__', 32767) $$,
            '23503',
            null,
            'invalid muscle_category_id raises FK violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: eliminar muscle_category con ejercicios referenciados → restrict (23503)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$delete
        from public.muscle_categories
        where name = '__test_cat__' $$,
            '23503',
            null,
            'deleting muscle_category with referenced exercises raises FK restrict'
    );
select *
from finish();
rollback;