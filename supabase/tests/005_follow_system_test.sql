-- =============================================================================
-- TEST 005: Sistema de Seguimiento (Follow)
-- Migración: 20260401014940_follow_system.sql
-- Cubre: follows, auto-accept, contadores, profiles_public_view,
--        can_view_full_profile, RLS
-- =============================================================================
begin;
select plan(37);
-- ---------------------------------------------------------------------------
-- TABLA Y VISTA EXISTEN
-- ---------------------------------------------------------------------------
select has_table(
        'public',
        'follows',
        'follows table exists'
    );
select has_view(
        'public',
        'profiles_public_view',
        'profiles_public_view view exists'
    );
-- ---------------------------------------------------------------------------
-- COLUMNAS CLAVE EN follows
-- ---------------------------------------------------------------------------
select has_column(
        'public',
        'follows',
        'id',
        'follows.id exists'
    );
select has_column(
        'public',
        'follows',
        'follower_id',
        'follows.follower_id exists'
    );
select has_column(
        'public',
        'follows',
        'following_id',
        'follows.following_id exists'
    );
select has_column(
        'public',
        'follows',
        'status',
        'follows.status exists'
    );
-- ---------------------------------------------------------------------------
-- RLS HABILITADO
-- ---------------------------------------------------------------------------
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.follows'::regclass
        ),
        'follows has RLS enabled'
    );
-- ---------------------------------------------------------------------------
-- POLÍTICAS
-- ---------------------------------------------------------------------------
select policies_are(
        'public',
        'follows',
        array ['follows_read', 'follows_insert', 'follows_update', 'follows_delete'],
        'follows has exactly the expected RLS policies'
    );
-- ---------------------------------------------------------------------------
-- TRIGGERS
-- ---------------------------------------------------------------------------
select has_trigger(
        'public',
        'follows',
        'follows_auto_accept',
        'follows_auto_accept trigger exists'
    );
select has_trigger(
        'public',
        'follows',
        'follows_update_counts',
        'follows_update_counts trigger exists'
    );
select has_trigger(
        'public',
        'follows',
        'follows_audit_trigger',
        'follows has audit trigger'
    );
-- ---------------------------------------------------------------------------
-- ÍNDICES
-- ---------------------------------------------------------------------------
select has_index(
        'public',
        'follows',
        'follows_follower_idx',
        'follower index exists'
    );
select has_index(
        'public',
        'follows',
        'follows_following_idx',
        'following index exists'
    );
select has_index(
        'public',
        'follows',
        'follows_pending_idx',
        'partial pending index exists'
    );
-- ---------------------------------------------------------------------------
-- FUNCIONES
-- ---------------------------------------------------------------------------
select has_function(
        'public',
        'can_view_full_profile',
        array ['uuid'],
        'can_view_full_profile(uuid) exists'
    );
select has_function(
        'public',
        'handle_follow_request',
        'handle_follow_request function exists'
    );
select has_function(
        'public',
        'update_follow_counts',
        'update_follow_counts function exists'
    );
-- ---------------------------------------------------------------------------
-- FIXTURES: usuarios y perfiles válidos
-- profiles requiere:
-- username, first_name, last_name, date_of_birth, sex
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
        'f0000001-0000-0000-0000-000000000000',
        'pub@follow.test',
        'x',
        jsonb_build_object(
            'username',
            'pub_follow_1',
            'first_name',
            'Public',
            'last_name',
            'User',
            'date_of_birth',
            '1990-01-01',
            'sex',
            'other',
            'is_public',
            true
        ),
        now(),
        now()
    ),
    (
        'f0000002-0000-0000-0000-000000000000',
        'priv@follow.test',
        'x',
        jsonb_build_object(
            'username',
            'priv_follow_1',
            'first_name',
            'Private',
            'last_name',
            'User',
            'date_of_birth',
            '1991-02-02',
            'sex',
            'female',
            'is_public',
            false
        ),
        now(),
        now()
    ),
    (
        'f0000003-0000-0000-0000-000000000000',
        'fan@follow.test',
        'x',
        jsonb_build_object(
            'username',
            'fan_follow_1',
            'first_name',
            'Fan',
            'last_name',
            'User',
            'date_of_birth',
            '1992-03-03',
            'sex',
            'male',
            'is_public',
            true
        ),
        now(),
        now()
    );
insert into public.profiles (
        id,
        username,
        first_name,
        last_name,
        date_of_birth,
        sex,
        is_public,
        is_complete,
        dark_mode,
        followers_count,
        following_count
    )
values (
        'f0000001-0000-0000-0000-000000000000',
        'pub_follow_1',
        'Public',
        'User',
        '1990-01-01',
        'other',
        true,
        false,
        false,
        0,
        0
    ),
    (
        'f0000002-0000-0000-0000-000000000000',
        'priv_follow_1',
        'Private',
        'User',
        '1991-02-02',
        'female',
        false,
        false,
        false,
        0,
        0
    ),
    (
        'f0000003-0000-0000-0000-000000000000',
        'fan_follow_1',
        'Fan',
        'User',
        '1992-03-03',
        'male',
        true,
        false,
        false,
        0,
        0
    ) on conflict (id) do
update
set username = excluded.username,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    date_of_birth = excluded.date_of_birth,
    sex = excluded.sex,
    is_public = excluded.is_public,
    is_complete = excluded.is_complete,
    dark_mode = excluded.dark_mode,
    followers_count = excluded.followers_count,
    following_count = excluded.following_count;
-- ---------------------------------------------------------------------------
-- HAPPY PATH: seguir perfil público → auto-accepted
-- ---------------------------------------------------------------------------
insert into public.follows (follower_id, following_id)
values (
        'f0000003-0000-0000-0000-000000000000',
        'f0000001-0000-0000-0000-000000000000'
    );
select results_eq(
        $$select status
        from public.follows
        where follower_id = 'f0000003-0000-0000-0000-000000000000'
            and following_id = 'f0000001-0000-0000-0000-000000000000' $$,
            $$values ('accepted') $$,
            'following a public profile auto-sets status to accepted'
    );
select results_eq(
        $$select followers_count
        from public.profiles
        where id = 'f0000001-0000-0000-0000-000000000000' $$,
            $$values (1) $$,
            'followers_count increments when follow is accepted'
    );
select results_eq(
        $$select following_count
        from public.profiles
        where id = 'f0000003-0000-0000-0000-000000000000' $$,
            $$values (1) $$,
            'following_count increments when follow is accepted'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: seguir perfil privado → status = pending
-- ---------------------------------------------------------------------------
insert into public.follows (follower_id, following_id)
values (
        'f0000003-0000-0000-0000-000000000000',
        'f0000002-0000-0000-0000-000000000000'
    );
select results_eq(
        $$select status
        from public.follows
        where follower_id = 'f0000003-0000-0000-0000-000000000000'
            and following_id = 'f0000002-0000-0000-0000-000000000000' $$,
            $$values ('pending') $$,
            'following a private profile sets status to pending'
    );
select results_eq(
        $$select followers_count
        from public.profiles
        where id = 'f0000002-0000-0000-0000-000000000000' $$,
            $$values (0) $$,
            'followers_count does NOT increment for a pending follow'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: aceptar follow pendiente → contadores incrementan
-- ---------------------------------------------------------------------------
update public.follows
set status = 'accepted'
where follower_id = 'f0000003-0000-0000-0000-000000000000'
    and following_id = 'f0000002-0000-0000-0000-000000000000';
select results_eq(
        $$select followers_count
        from public.profiles
        where id = 'f0000002-0000-0000-0000-000000000000' $$,
            $$values (1) $$,
            'followers_count increments when pending follow is accepted'
    );
select results_eq(
        $$select following_count
        from public.profiles
        where id = 'f0000003-0000-0000-0000-000000000000' $$,
            $$values (2) $$,
            'following_count increments when pending follow is accepted'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: eliminar follow aceptado → contadores decrementan
-- ---------------------------------------------------------------------------
delete from public.follows
where follower_id = 'f0000003-0000-0000-0000-000000000000'
    and following_id = 'f0000001-0000-0000-0000-000000000000';
select results_eq(
        $$select followers_count
        from public.profiles
        where id = 'f0000001-0000-0000-0000-000000000000' $$,
            $$values (0) $$,
            'followers_count decrements on follow deletion (never below 0)'
    );
select results_eq(
        $$select following_count
        from public.profiles
        where id = 'f0000003-0000-0000-0000-000000000000' $$,
            $$values (1) $$,
            'following_count decrements on follow deletion'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: can_view_full_profile
-- ---------------------------------------------------------------------------
select set_config(
        'request.jwt.claim.sub',
        'f0000003-0000-0000-0000-000000000000',
        true
    );
select ok(
        public.can_view_full_profile('f0000001-0000-0000-0000-000000000000'),
        'can_view_full_profile returns true for public profile'
    );
select ok(
        public.can_view_full_profile('f0000003-0000-0000-0000-000000000000'),
        'can_view_full_profile returns true for own profile'
    );
select ok(
        public.can_view_full_profile('f0000002-0000-0000-0000-000000000000'),
        'can_view_full_profile returns true for private profile when following (accepted)'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: can_view_full_profile = false para perfil privado sin follow
-- ---------------------------------------------------------------------------
select set_config(
        'request.jwt.claim.sub',
        'f0000001-0000-0000-0000-000000000000',
        true
    );
select ok(
        not public.can_view_full_profile('f0000002-0000-0000-0000-000000000000'),
        'can_view_full_profile returns false for private profile without accepted follow'
    );
reset role;
-- ---------------------------------------------------------------------------
-- HAPPY PATH: profiles_public_view muestra campos públicos
-- ---------------------------------------------------------------------------
select isnt(
        (
            select first_name
            from public.profiles_public_view
            where id = 'f0000001-0000-0000-0000-000000000000'
        ),
        null,
        'profiles_public_view shows first_name for public profile'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: profiles_public_view oculta campos de perfil privado para no-follower
-- ---------------------------------------------------------------------------
select set_config(
        'request.jwt.claim.sub',
        'f0000001-0000-0000-0000-000000000000',
        true
    );
select is(
        (
            select first_name
            from public.profiles_public_view
            where id = 'f0000002-0000-0000-0000-000000000000'
        ),
        null,
        'profiles_public_view hides first_name for private profile (no follow relationship)'
    );
reset role;
-- ---------------------------------------------------------------------------
-- ERROR CASE: auto-follow (follower = following) → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$
        insert into public.follows (follower_id, following_id)
        values (
                'f0000001-0000-0000-0000-000000000000',
                'f0000001-0000-0000-0000-000000000000'
            ) $$,
            '23514',
            null,
            'self-follow raises check constraint violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: follow duplicado → unique constraint (23505)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$
        insert into public.follows (follower_id, following_id)
        values (
                'f0000003-0000-0000-0000-000000000000',
                'f0000002-0000-0000-0000-000000000000'
            ) $$,
            '23505',
            null,
            'duplicate follow raises unique constraint violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: status inválido → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$
        update public.follows
        set status = 'blocked'
        where follower_id = 'f0000003-0000-0000-0000-000000000000'
            and following_id = 'f0000002-0000-0000-0000-000000000000' $$,
            '23514',
            null,
            'invalid follow status raises check constraint violation'
    );
-- ---------------------------------------------------------------------------
-- RLS: follower puede insertar follow con su propio follower_id
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config(
        'request.jwt.claim.sub',
        'f0000001-0000-0000-0000-000000000000',
        true
    );
select lives_ok(
        $$
        insert into public.follows (follower_id, following_id)
        values (
                'f0000001-0000-0000-0000-000000000000',
                'f0000003-0000-0000-0000-000000000000'
            ) $$,
            'authenticated user can follow using their own follower_id'
    );
select results_eq(
        $$
        select count(*)::int
        from public.follows
        where follower_id = 'f0000001-0000-0000-0000-000000000000'
            and following_id = 'f0000003-0000-0000-0000-000000000000' $$,
            $$values (1) $$,
            'follow relation persisted correctly'
    );
select *
from finish();
rollback;