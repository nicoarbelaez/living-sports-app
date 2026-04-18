-- =============================================================================
-- TEST 008: Feed Social
-- Migración: 20260401015011_social_feed.sql
-- Cubre: posts, post_media, post_likes, comments, comment_replies,
--        comment_likes, comment_reply_likes — contadores, RLS, profundidad=1
-- =============================================================================
begin;
select plan(45);
-- ---------------------------------------------------------------------------
-- TABLAS EXISTEN
-- ---------------------------------------------------------------------------
select has_table(
        'public',
        'posts',
        'posts table exists'
    );
select has_table(
        'public',
        'post_media',
        'post_media table exists'
    );
select has_table(
        'public',
        'post_likes',
        'post_likes table exists'
    );
select has_table(
        'public',
        'comments',
        'comments table exists'
    );
select has_table(
        'public',
        'comment_likes',
        'comment_likes table exists'
    );
select has_table(
        'public',
        'comment_replies',
        'comment_replies table exists'
    );
select has_table(
        'public',
        'comment_reply_likes',
        'comment_reply_likes table exists'
    );
-- ---------------------------------------------------------------------------
-- GARANTÍA ESTRUCTURAL: comment_replies NO tiene parent_reply_id (profundidad=1)
-- ---------------------------------------------------------------------------
select ok(
        not exists (
            select 1
            from information_schema.columns
            where table_schema = 'public'
                and table_name = 'comment_replies'
                and column_name = 'parent_reply_id'
        ),
        'comment_replies has no parent_reply_id column (depth=1 is structural)'
    );
-- ---------------------------------------------------------------------------
-- COLUMNAS CLAVE EN posts
-- ---------------------------------------------------------------------------
select has_column(
        'public',
        'posts',
        'likes_count',
        'posts.likes_count exists'
    );
select has_column(
        'public',
        'posts',
        'comments_count',
        'posts.comments_count exists'
    );
select has_column(
        'public',
        'posts',
        'is_deleted',
        'posts.is_deleted exists'
    );
-- ---------------------------------------------------------------------------
-- COLUMNAS CLAVE EN comments
-- ---------------------------------------------------------------------------
select has_column(
        'public',
        'comments',
        'likes_count',
        'comments.likes_count exists'
    );
select has_column(
        'public',
        'comments',
        'replies_count',
        'comments.replies_count exists'
    );
-- ---------------------------------------------------------------------------
-- COLUMNAS CLAVE EN comment_replies
-- ---------------------------------------------------------------------------
select has_column(
        'public',
        'comment_replies',
        'likes_count',
        'comment_replies.likes_count exists'
    );
-- ---------------------------------------------------------------------------
-- RLS HABILITADO
-- ---------------------------------------------------------------------------
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.posts'::regclass
        ),
        'posts has RLS enabled'
    );
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.post_media'::regclass
        ),
        'post_media has RLS enabled'
    );
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.post_likes'::regclass
        ),
        'post_likes has RLS enabled'
    );
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.comments'::regclass
        ),
        'comments has RLS enabled'
    );
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.comment_likes'::regclass
        ),
        'comment_likes has RLS enabled'
    );
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.comment_replies'::regclass
        ),
        'comment_replies has RLS enabled'
    );
select ok(
        (
            select relrowsecurity
            from pg_class
            where oid = 'public.comment_reply_likes'::regclass
        ),
        'comment_reply_likes has RLS enabled'
    );
-- ---------------------------------------------------------------------------
-- FUNCIONES
-- ---------------------------------------------------------------------------
select has_function(
        'public',
        'can_view_user_content',
        array ['uuid'],
        'can_view_user_content(uuid) exists'
    );
-- ---------------------------------------------------------------------------
-- TRIGGERS DE CONTADORES
-- ---------------------------------------------------------------------------
select has_trigger(
        'public',
        'post_likes',
        'post_likes_count_trigger',
        'post_likes has counter trigger'
    );
select has_trigger(
        'public',
        'comments',
        'comments_count_trigger',
        'comments has counter trigger'
    );
select has_trigger(
        'public',
        'comment_likes',
        'comment_likes_count_trigger',
        'comment_likes has counter trigger'
    );
select has_trigger(
        'public',
        'comment_replies',
        'comment_replies_count_trigger',
        'comment_replies has counter trigger'
    );
select has_trigger(
        'public',
        'comment_reply_likes',
        'reply_likes_count_trigger',
        'comment_reply_likes has counter trigger'
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
        'dd000001-0000-0000-0000-000000000000',
        'author@feed.test',
        'x',
        now(),
        now()
    ),
    (
        'dd000002-0000-0000-0000-000000000000',
        'fan@feed.test',
        'x',
        now(),
        now()
    );
-- post de prueba
insert into public.posts (id, user_id, body)
values (
        'eeeeeeee-0000-0000-0000-000000000001',
        'dd000001-0000-0000-0000-000000000000',
        'Hola mundo'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: like en post → likes_count incrementa
-- ---------------------------------------------------------------------------
insert into public.post_likes (post_id, user_id)
values (
        'eeeeeeee-0000-0000-0000-000000000001',
        'dd000002-0000-0000-0000-000000000000'
    );
select results_eq(
        $$select likes_count
        from public.posts
        where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
            $$values (1) $$,
            'posts.likes_count increments on post_likes INSERT'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: eliminar like → likes_count decrementa (nunca < 0)
-- ---------------------------------------------------------------------------
delete from public.post_likes
where post_id = 'eeeeeeee-0000-0000-0000-000000000001'
    and user_id = 'dd000002-0000-0000-0000-000000000000';
select results_eq(
        $$select likes_count
        from public.posts
        where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
            $$values (0) $$,
            'posts.likes_count decrements on post_likes DELETE (never below 0)'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: comentario → comments_count incrementa
-- ---------------------------------------------------------------------------
insert into public.comments (id, post_id, user_id, body)
values (
        'cccccccc-0000-0000-0000-000000000001',
        'eeeeeeee-0000-0000-0000-000000000001',
        'dd000002-0000-0000-0000-000000000000',
        'Qué buen post!'
    );
select results_eq(
        $$select comments_count
        from public.posts
        where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
            $$values (1) $$,
            'posts.comments_count increments on comment INSERT'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: eliminar comentario → comments_count decrementa
-- ---------------------------------------------------------------------------
delete from public.comments
where id = 'cccccccc-0000-0000-0000-000000000001';
select results_eq(
        $$select comments_count
        from public.posts
        where id = 'eeeeeeee-0000-0000-0000-000000000001' $$,
            $$values (0) $$,
            'posts.comments_count decrements on comment DELETE'
    );
-- Recrear comentario para los tests siguientes
insert into public.comments (id, post_id, user_id, body)
values (
        'cccccccc-0000-0000-0000-000000000001',
        'eeeeeeee-0000-0000-0000-000000000001',
        'dd000002-0000-0000-0000-000000000000',
        'Comentario de prueba'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: like en comentario → comments.likes_count incrementa
-- ---------------------------------------------------------------------------
insert into public.comment_likes (comment_id, user_id)
values (
        'cccccccc-0000-0000-0000-000000000001',
        'dd000001-0000-0000-0000-000000000000'
    );
select results_eq(
        $$select likes_count
        from public.comments
        where id = 'cccccccc-0000-0000-0000-000000000001' $$,
            $$values (1) $$,
            'comments.likes_count increments on comment_likes INSERT'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: eliminar like de comentario → decrementa
-- ---------------------------------------------------------------------------
delete from public.comment_likes
where comment_id = 'cccccccc-0000-0000-0000-000000000001'
    and user_id = 'dd000001-0000-0000-0000-000000000000';
select results_eq(
        $$select likes_count
        from public.comments
        where id = 'cccccccc-0000-0000-0000-000000000001' $$,
            $$values (0) $$,
            'comments.likes_count decrements on comment_likes DELETE'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: respuesta a comentario → replies_count incrementa
-- ---------------------------------------------------------------------------
insert into public.comment_replies (id, comment_id, user_id, body)
values (
        'aaaaaaaa-0000-0000-0000-000000000001',
        'cccccccc-0000-0000-0000-000000000001',
        'dd000001-0000-0000-0000-000000000000',
        'Respuesta de prueba'
    );
select results_eq(
        $$select replies_count
        from public.comments
        where id = 'cccccccc-0000-0000-0000-000000000001' $$,
            $$values (1) $$,
            'comments.replies_count increments on comment_replies INSERT'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: like en reply → comment_replies.likes_count incrementa
-- ---------------------------------------------------------------------------
insert into public.comment_reply_likes (reply_id, user_id)
values (
        'aaaaaaaa-0000-0000-0000-000000000001',
        'dd000002-0000-0000-0000-000000000000'
    );
select results_eq(
        $$select likes_count
        from public.comment_replies
        where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
            $$values (1) $$,
            'comment_replies.likes_count increments on reply_likes INSERT'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: eliminar like de reply → decrementa
-- ---------------------------------------------------------------------------
delete from public.comment_reply_likes
where reply_id = 'aaaaaaaa-0000-0000-0000-000000000001'
    and user_id = 'dd000002-0000-0000-0000-000000000000';
select results_eq(
        $$select likes_count
        from public.comment_replies
        where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
            $$values (0) $$,
            'comment_replies.likes_count decrements on reply_likes DELETE'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: eliminar reply → replies_count decrementa
-- ---------------------------------------------------------------------------
delete from public.comment_replies
where id = 'aaaaaaaa-0000-0000-0000-000000000001';
select results_eq(
        $$select replies_count
        from public.comments
        where id = 'cccccccc-0000-0000-0000-000000000001' $$,
            $$values (0) $$,
            'comments.replies_count decrements on comment_replies DELETE'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: doble like en el mismo post → unique (23505)
-- ---------------------------------------------------------------------------
insert into public.post_likes (post_id, user_id)
values (
        'eeeeeeee-0000-0000-0000-000000000001',
        'dd000002-0000-0000-0000-000000000000'
    );
select throws_ok(
        $$insert into public.post_likes (post_id, user_id)
        values (
                'eeeeeeee-0000-0000-0000-000000000001',
                'dd000002-0000-0000-0000-000000000000'
            ) $$,
            '23505',
            null,
            'duplicate post like raises unique violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: doble like en mismo comentario → unique (23505)
-- ---------------------------------------------------------------------------
insert into public.comment_likes (comment_id, user_id)
values (
        'cccccccc-0000-0000-0000-000000000001',
        'dd000001-0000-0000-0000-000000000000'
    );
select throws_ok(
        $$insert into public.comment_likes (comment_id, user_id)
        values (
                'cccccccc-0000-0000-0000-000000000001',
                'dd000001-0000-0000-0000-000000000000'
            ) $$,
            '23505',
            null,
            'duplicate comment like raises unique violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: comentario con body vacío → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$insert into public.comments (post_id, user_id, body)
        values (
                'eeeeeeee-0000-0000-0000-000000000001',
                'dd000002-0000-0000-0000-000000000000',
                ''
            ) $$,
            '23514',
            null,
            'empty comment body raises check constraint violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: comentario con body > 2000 chars → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
        format(
            $$insert into public.comments (post_id, user_id, body)
            values (
                    'eeeeeeee-0000-0000-0000-000000000001',
                    'dd000002-0000-0000-0000-000000000000',
                    '%s'
                ) $$,
                repeat('x', 2001)
        ),
        '23514',
        null,
        'comment body > 2000 chars raises check constraint violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: respuesta con body vacío → check constraint (23514)
-- ---------------------------------------------------------------------------
select throws_ok(
        $$insert into public.comment_replies (comment_id, user_id, body)
        values (
                'cccccccc-0000-0000-0000-000000000001',
                'dd000001-0000-0000-0000-000000000000',
                ''
            ) $$,
            '23514',
            null,
            'empty reply body raises check constraint violation'
    );
-- ---------------------------------------------------------------------------
-- ERROR CASE: post con is_deleted=true invisible para otro usuario (RLS)
-- ---------------------------------------------------------------------------
insert into public.posts (id, user_id, body, is_deleted)
values (
        'eeeeeeee-0000-0000-0000-000000000002',
        'dd000001-0000-0000-0000-000000000000',
        'Post borrado',
        true
    );
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"dd000002-0000-0000-0000-000000000000","role":"authenticated"}';
select results_eq(
        $$select count(*)::int
        from public.posts
        where id = 'eeeeeeee-0000-0000-0000-000000000002' $$,
            $$values (0) $$,
            'deleted post (is_deleted=true) is hidden from other users by RLS'
    );
-- ---------------------------------------------------------------------------
-- HAPPY PATH: post activo del autor público visible para otro usuario (RLS)
-- ---------------------------------------------------------------------------
select results_eq(
        $$select count(*)::int
        from public.posts
        where id = 'eeeeeeee-0000-0000-0000-000000000001'
            and is_deleted = false $$,
            $$values (1) $$,
            'active post from public author is visible to other authenticated users'
    );
reset role;
-- ---------------------------------------------------------------------------
-- AUDITORÍA
-- ---------------------------------------------------------------------------
select results_eq(
        $$select count(*)::int
        from audit.audit_log
        where table_name = 'posts'
            and operation = 'INSERT' $$,
            $$values (2) $$,
            'audit_log records 2 INSERT operations on posts'
    );
select *
from finish();
rollback;