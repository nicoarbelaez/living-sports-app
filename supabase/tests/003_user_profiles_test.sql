-- =============================================================================
-- TEST 003: Perfiles de Usuario
-- Migración: 20260401014935_user_profiles.sql
-- Cubre: profiles, user_roles, user_social_links, triggers handle_new_user,
--        assign_default_role, función has_role, RLS y constraints
-- =============================================================================
begin;
select plan(41);
-- Grant temporal para que el rol authenticated pueda leer profiles
-- (revocado en migración 005; necesario para que las RLS policies que referencian profiles funcionen en tests)
grant select on public.profiles to authenticated;
-- ---------------------------------------------------------------------------
-- TABLAS EXISTEN
-- ---------------------------------------------------------------------------
select has_table(
        'public',
        'profiles',
        'profiles table exists'
    );
select has_table(
        'public',
        'user_roles',
        'user_roles table exists'
    );
select has_table(
        'public',
        'user_social_links',
        'user_social_links table exists'
    );
-- ---------------------------------------------------------------------------
-- COLUMNAS CLAVE EN profiles
-- ---------------------------------------------------------------------------
select has_column(
        'public',
        'profiles',
        'id',
        'profiles.id exists'
    );
select has_column(
        'public',
        'profiles',
        'username',
        'profiles.username exists'
    );
select has_column(
        'public',
        'profiles',
        'first_name',
        'profiles.first_name exists'
    );
select has_column(
        'public',
        'profiles',
        'last_name',
        'profiles.last_name exists'
    );
select has_column(
        'public',
        'profiles',
        'date_of_birth',
        'profiles.date_of_birth exists'
    );
select has_column(
        'public',
        'profiles',
        'sex',
        'profiles.sex exists'
    );
select has_column(
        'public',
        'profiles',
        'is_complete',
        'profiles.is_complete exists'
    );
select has_column(
        'public',
        'profiles',
        'is_public',
        'profiles.is_public exists'
    );
select has_column(
        'public',
        'profiles',
        'followers_count',
        'profiles.followers_count exists'
    );
select has_column(
        'public',
        'profiles',
        'following_count',
        'profiles.following_count exists'
    );
-- ---------------------------------------------------------------------------
-- RLS HABILITADO
-- ---------------------------------------------------------------------------
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.profiles'::regclass
        ),
        'profiles has RLS enabled'
    );
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.user_roles'::regclass
        ),
        'user_roles has RLS enabled'
    );
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.user_social_links'::regclass
        ),
        'user_social_links has RLS enabled'
    );
-- ---------------------------------------------------------------------------
-- FUNCIONES
-- ---------------------------------------------------------------------------
select has_function(
        'public',
        'handle_new_user',
        'handle_new_user function exists'
    );
select has_function(
        'public',
        'assign_default_role',
        'assign_default_role function exists'
    );
select has_function(
        'public',
        'has_role',
        array ['text'],
        'has_role(text) function exists'
    );
-- ---------------------------------------------------------------------------
-- TRIGGERS
-- ---------------------------------------------------------------------------
select has_trigger(
        'auth',
        'users',
        'on_auth_user_created',
        'on_auth_user_created trigger on auth.users exists'
    );
select has_trigger(
        'public',
        'profiles',
        'on_profile_created_assign_role',
        'on_profile_created_assign_role trigger on profiles exists'
    );
select has_trigger(
        'public',
        'profiles',
        'profiles_audit_trigger',
        'profiles has audit trigger'
    );
select has_trigger(
        'public',
        'profiles',
        'profiles_updated_at',
        'profiles has updated_at trigger'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: insertar en auth.users → perfil creado automáticamente
-- ---------------------------------------------------------------------------
insert into auth.users (
        id,
        email,
        encrypted_password,
        raw_user_meta_data,
        created_at,
        updated_at
    )
values (
        '11111111-1111-1111-1111-111111111111',
        'test.user@example.com',
        'hashed',
        '{"given_name":"Juan","family_name":"Pérez"}',
        now(),
        now()
    );
select results_eq(
        $$select count(*)::int
        from public.profiles
        where id = '11111111-1111-1111-1111-111111111111' $$,
            $$values (1) $$,
            'profile auto-created when user inserted into auth.users'
    );
-- Perfil creado con is_complete = false
select results_eq(
        $$select is_complete
        from public.profiles
        where id = '11111111-1111-1111-1111-111111111111' $$,
            $$values (false) $$,
            'auto-created profile has is_complete = false'
    );
-- first_name viene de given_name
select results_eq(
        $$select first_name
        from public.profiles
        where id = '11111111-1111-1111-1111-111111111111' $$,
            $$values ('Juan') $$,
            'first_name is taken from given_name metadata'
    );
-- username contiene prefijo del email
select ok(
        (
            select username
            from public.profiles
            where id = '11111111-1111-1111-1111-111111111111'
        ) like 'test.user%',
        'username starts with email prefix'
    );
-- Rol 'user' asignado automáticamente
select results_eq(
        $$select count(*)::int
        from public.user_roles ur
            join public.app_roles ar on ar.id = ur.role_id
        where ur.user_id = '11111111-1111-1111-1111-111111111111'
            and ar.name = 'user' $$,
            $$values (1) $$,
            'default user role assigned automatically on profile creation'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: has_role() como superuser (security definer puede leer user_roles)
-- ---------------------------------------------------------------------------
-- Simular que el usuario 11111111 está autenticado
select set_config(
        'request.jwt.claim.sub',
        '11111111-1111-1111-1111-111111111111',
        true
    );
select ok(
        public.has_role('user'),
        'has_role returns true for the assigned role'
    );
select ok(
        not public.has_role('admin'),
        'has_role returns false for a non-assigned role'
    );
reset role;
-- ---------------------------------------------------------------------------
-- HAPPY PATH: social link válido
-- ---------------------------------------------------------------------------
insert into public.user_social_links (user_id, platform, url)
values (
        '11111111-1111-1111-1111-111111111111',
        'instagram',
        'https://instagram.com/juanperez'
    );
select results_eq(
        $$select count(*)::int
        from public.user_social_links
        where user_id = '11111111-1111-1111-1111-111111111111'
            and platform = 'instagram' $$,
            $$values (1) $$,
            'valid social link inserted successfully'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: username con mayúsculas → format check (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$update public.profiles
        set username = 'InvalidName'
        where id = '11111111-1111-1111-1111-111111111111' $$,
            '23514',
            null,
            'username with uppercase raises check violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: username muy corto (< 3 chars) → length check (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$update public.profiles
        set username = 'ab'
        where id = '11111111-1111-1111-1111-111111111111' $$,
            '23514',
            null,
            'username shorter than 3 chars raises check violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: username muy largo (> 30 chars) → length check (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$update public.profiles
        set username = 'abcdefghijklmnopqrstuvwxyz12345'
        where id = '11111111-1111-1111-1111-111111111111' $$,
            '23514',
            null,
            'username longer than 30 chars raises check violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: height_cm = 0 → positive check (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$update public.profiles
        set height_cm = 0
        where id = '11111111-1111-1111-1111-111111111111' $$,
            '23514',
            null,
            'height_cm = 0 raises check violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: sex con valor inválido → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$update public.profiles
        set sex = 'unknown'
        where id = '11111111-1111-1111-1111-111111111111' $$,
            '23514',
            null,
            'invalid sex value raises check violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: social link sin http → URL format check (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$insert into public.user_social_links (user_id, platform, url)
        values (
                '11111111-1111-1111-1111-111111111111',
                'twitter',
                'ftp://invalid.com'
            ) $$,
            '23514',
            null,
            'social link URL without http(s) raises check violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: social link duplicado (mismo user + plataforma) → unique (23505)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$insert into public.user_social_links (user_id, platform, url)
        values (
                '11111111-1111-1111-1111-111111111111',
                'instagram',
                'https://instagram.com/otro'
            ) $$,
            '23505',
            null,
            'duplicate social link platform raises unique violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: perfil con username duplicado → unique (23505)
-- ---------------------------------------------------------------------------
insert into auth.users (
        id,
        email,
        encrypted_password,
        created_at,
        updated_at
    )
values (
        '22222222-2222-2222-2222-222222222222',
        'other@example.com',
        'hashed',
        now(),
        now()
    );
select throws_ok(
        $$update public.profiles
        set username = (
                select username
                from public.profiles
                where id = '11111111-1111-1111-1111-111111111111'
            )
        where id = '22222222-2222-2222-2222-222222222222' $$,
            '23505',
            null,
            'duplicate username raises unique violation'
    );
-- ---------------------------------------------------------------------------
-- RLS: owner puede actualizar su propio perfil
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config(
        'request.jwt.claim.sub',
        '11111111-1111-1111-1111-111111111111',
        true
    );
update public.profiles
set bio = 'Hola mundo'
where id = '11111111-1111-1111-1111-111111111111';
select results_eq(
        $$select bio
        from public.profiles
        where id = '11111111-1111-1111-1111-111111111111' $$,
            $$values ('Hola mundo') $$,
            'owner can update their own profile'
    );
-- ---------------------------------------------------------------------------
-- RLS: usuario NO puede actualizar perfil ajeno
-- ---------------------------------------------------------------------------
select results_eq(
        $$update public.profiles
        set bio = 'hacked'
        where id = '22222222-2222-2222-2222-222222222222'
        returning id $$,
            $$select null::uuid
        where false $$,
            'authenticated user cannot update another users profile (RLS)'
    );
reset role;
select *
from finish();
rollback;