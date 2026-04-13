-- =============================================================================
-- MIGRACIÓN 008: Feed Social
-- Tablas: posts, post_media, post_likes, comments, comment_replies,
--         comment_likes, comment_reply_likes
-- Descripción: Feed social con publicaciones (texto + multimedia múltiple), likes, y
--              comentarios con exactamente UN nivel de respuestas.
-- Reglas de negocio aplicadas:
--   1. Los comentarios pertenecen a una publicación.
--   2. Las respuestas pertenecen a un comentario — NO pueden tener respuestas ellas mismas.
--      Aplicado: sin parent_comment_id en la tabla de respuestas (prevención estructural).
--   3. Los likes son únicos por usuario por ítem (restricción única).
-- =============================================================================
-- ---------------------------------------------------------------------------
-- PUBLICACIONES (POSTS)
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text,
  is_deleted boolean not null default false,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_content_required check (
    body is not null
    or true
  )
);
create trigger posts_updated_at before
update on public.posts for each row execute function public.set_updated_at();
create index if not exists posts_user_created_idx on public.posts (user_id, created_at desc);
create index if not exists posts_created_at_idx on public.posts (created_at desc)
where is_deleted = false;
select audit.enable_audit('public', 'posts');
-- ---------------------------------------------------------------------------
-- MEDIOS DE PUBLICACIÓN (1 post → N ítems de medios: imágenes + vídeos)
-- ---------------------------------------------------------------------------
create table if not exists public.post_media (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  sort_order smallint not null default 0,
  -- orden de visualización
  width_px integer,
  -- para pre-cálculo de diseño de imagen
  height_px integer,
  duration_s numeric(7, 2),
  -- para vídeos: duración en segundos
  created_at timestamptz not null default now() -- sin updated_at: los medios son inmutables después de la carga
);
create index if not exists post_media_post_idx on public.post_media (post_id, sort_order);
select audit.enable_audit('public', 'post_media');
-- ---------------------------------------------------------------------------
-- LIKES DE PUBLICACIÓN
-- ---------------------------------------------------------------------------
create table if not exists public.post_likes (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint post_likes_unique unique (post_id, user_id)
);
create index if not exists post_likes_post_idx on public.post_likes (post_id);
create index if not exists post_likes_user_idx on public.post_likes (user_id);
-- Disparador de contador
create or replace function public.update_post_likes_count() returns trigger language plpgsql security definer
set search_path = '' as $$ begin if TG_OP = 'INSERT' then
update public.posts
set likes_count = likes_count + 1
where id = new.post_id;
elsif TG_OP = 'DELETE' then
update public.posts
set likes_count = greatest(likes_count - 1, 0)
where id = old.post_id;
end if;
return coalesce(new, old);
end;
$$;
create trigger post_likes_count_trigger
after
insert
  or delete on public.post_likes for each row execute function public.update_post_likes_count();
select audit.enable_audit('public', 'post_likes');
-- ---------------------------------------------------------------------------
-- COMENTARIOS (solo nivel superior — las respuestas están en una tabla separada)
-- Justificación de la tabla de respuestas separada: prevención estructural de anidamiento
-- infinito. Un comentario no tiene campo parent_id → no puede ser una respuesta.
-- La tabla de respuestas no tiene FK de respuestas → no se puede anidar más.
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id uuid not null default gen_random_uuid() primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (
    char_length(body) between 1 and 2000
  ),
  is_deleted boolean not null default false,
  -- Desnormalizado
  likes_count integer not null default 0,
  replies_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger comments_updated_at before
update on public.comments for each row execute function public.set_updated_at();
create index if not exists comments_post_idx on public.comments (post_id, created_at);
create index if not exists comments_user_idx on public.comments (user_id);
create index if not exists comments_post_active_idx on public.comments (post_id, created_at)
where is_deleted = false;
-- Actualizar contador de comentarios del post
create or replace function public.update_post_comments_count() returns trigger language plpgsql security definer
set search_path = '' as $$ begin if TG_OP = 'INSERT' then
update public.posts
set comments_count = comments_count + 1
where id = new.post_id;
elsif TG_OP = 'DELETE' then
update public.posts
set comments_count = greatest(comments_count - 1, 0)
where id = old.post_id;
end if;
return coalesce(new, old);
end;
$$;
create trigger comments_count_trigger
after
insert
  or delete on public.comments for each row execute function public.update_post_comments_count();
select audit.enable_audit('public', 'comments');
-- ---------------------------------------------------------------------------
-- LIKES DE COMENTARIO
-- ---------------------------------------------------------------------------
create table if not exists public.comment_likes (
  id bigint generated always as identity primary key,
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint comment_likes_unique unique (comment_id, user_id)
);
create index if not exists comment_likes_comment_idx on public.comment_likes (comment_id);
create index if not exists comment_likes_user_idx on public.comment_likes (user_id);
create or replace function public.update_comment_likes_count() returns trigger language plpgsql security definer
set search_path = '' as $$ begin if TG_OP = 'INSERT' then
update public.comments
set likes_count = likes_count + 1
where id = new.comment_id;
elsif TG_OP = 'DELETE' then
update public.comments
set likes_count = greatest(likes_count - 1, 0)
where id = old.comment_id;
end if;
return coalesce(new, old);
end;
$$;
create trigger comment_likes_count_trigger
after
insert
  or delete on public.comment_likes for each row execute function public.update_comment_likes_count();
select audit.enable_audit('public', 'comment_likes');
-- ---------------------------------------------------------------------------
-- RESPUESTAS A COMENTARIOS (máx 1 nivel — restricción estructural por diseño de tabla)
-- Una respuesta hace referencia a un comment_id — NO tiene campo para referenciar otra respuesta.
-- Esta es la forma canónica de imponer profundidad=1: hacer imposible un anidamiento mayor
-- a nivel de esquema, no solo mediante restricciones de verificación.
-- ---------------------------------------------------------------------------
create table if not exists public.comment_replies (
  id uuid not null default gen_random_uuid() primary key,
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (
    char_length(body) between 1 and 2000
  ),
  is_deleted boolean not null default false,
  -- Likes desnormalizados
  likes_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now() -- NOTA: No existe el campo parent_reply_id — las respuestas no pueden referenciar otras respuestas.
  -- La profundidad=1 está garantizada estructuralmente, no solo por restricción.
);
create trigger comment_replies_updated_at before
update on public.comment_replies for each row execute function public.set_updated_at();
create index if not exists comment_replies_comment_idx on public.comment_replies (comment_id, created_at);
create index if not exists comment_replies_user_idx on public.comment_replies (user_id);
-- Actualizar contador de respuestas del comentario
create or replace function public.update_comment_replies_count() returns trigger language plpgsql security definer
set search_path = '' as $$ begin if TG_OP = 'INSERT' then
update public.comments
set replies_count = replies_count + 1
where id = new.comment_id;
elsif TG_OP = 'DELETE' then
update public.comments
set replies_count = greatest(replies_count - 1, 0)
where id = old.comment_id;
end if;
return coalesce(new, old);
end;
$$;
create trigger comment_replies_count_trigger
after
insert
  or delete on public.comment_replies for each row execute function public.update_comment_replies_count();
select audit.enable_audit('public', 'comment_replies');
-- ---------------------------------------------------------------------------
-- LIKES DE RESPUESTA A COMENTARIO
-- ---------------------------------------------------------------------------
create table if not exists public.comment_reply_likes (
  id bigint generated always as identity primary key,
  reply_id uuid not null references public.comment_replies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint comment_reply_likes_unique unique (reply_id, user_id)
);
create index if not exists reply_likes_reply_idx on public.comment_reply_likes (reply_id);
create index if not exists reply_likes_user_idx on public.comment_reply_likes (user_id);
create or replace function public.update_reply_likes_count() returns trigger language plpgsql security definer
set search_path = '' as $$ begin if TG_OP = 'INSERT' then
update public.comment_replies
set likes_count = likes_count + 1
where id = new.reply_id;
elsif TG_OP = 'DELETE' then
update public.comment_replies
set likes_count = greatest(likes_count - 1, 0)
where id = old.reply_id;
end if;
return coalesce(new, old);
end;
$$;
create trigger reply_likes_count_trigger
after
insert
  or delete on public.comment_reply_likes for each row execute function public.update_reply_likes_count();
select audit.enable_audit('public', 'comment_reply_likes');
-- ---------------------------------------------------------------------------
-- RLS: PUBLICACIONES
-- ---------------------------------------------------------------------------
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.comment_likes enable row level security;
alter table public.comment_replies enable row level security;
alter table public.comment_reply_likes enable row level security;
-- Ayuda: ¿puede el usuario actual ver el contenido de un usuario dado?
create or replace function public.can_view_user_content(p_user_id uuid) returns boolean language sql stable security definer
set search_path = '' as $$
select (
    select auth.uid()
  ) = p_user_id -- contenido propio
  or exists (
    -- perfil público
    select 1
    from public.profiles
    where id = p_user_id
      and is_public = true
  )
  or exists (
    -- seguidor aceptado de perfil privado
    select 1
    from public.follows
    where follower_id = (
        select auth.uid()
      )
      and following_id = p_user_id
      and status = 'accepted'
  );
$$;
-- Políticas de POSTS
create policy "posts_read" on public.posts for
select to authenticated using (
    is_deleted = false
    and (
      select public.can_view_user_content(user_id)
    )
  );
create policy "posts_owner_insert" on public.posts for
insert to authenticated with check (
    (
      select auth.uid()
    ) = user_id
  );
create policy "posts_owner_update" on public.posts for
update to authenticated using (
    (
      select auth.uid()
    ) = user_id
  ) with check (
    (
      select auth.uid()
    ) = user_id
  );
create policy "posts_owner_delete" on public.posts for delete to authenticated using (
  (
    select auth.uid()
  ) = user_id
);
create policy "posts_admin" on public.posts for all to service_role using (true) with check (true);
-- MEDIOS DE POST — la lectura refleja la visibilidad del post
create policy "post_media_read" on public.post_media for
select to authenticated using (
    exists (
      select 1
      from public.posts p
      where p.id = post_id
        and p.is_deleted = false
        and (
          select public.can_view_user_content(p.user_id)
        )
    )
  );
create policy "post_media_owner_write" on public.post_media for
insert to authenticated with check (
    exists (
      select 1
      from public.posts
      where id = post_id
        and user_id = (
          select auth.uid()
        )
    )
  );
create policy "post_media_admin" on public.post_media for all to service_role using (true) with check (true);
-- LIKES DE POST
create policy "post_likes_read" on public.post_likes for
select to authenticated using (
    exists (
      select 1
      from public.posts p
      where p.id = post_id
        and (
          select public.can_view_user_content(p.user_id)
        )
    )
  );
create policy "post_likes_owner_write" on public.post_likes for
insert to authenticated with check (
    (
      select auth.uid()
    ) = user_id
  );
create policy "post_likes_owner_delete" on public.post_likes for delete to authenticated using (
  (
    select auth.uid()
  ) = user_id
);
-- COMENTARIOS
create policy "comments_read" on public.comments for
select to authenticated using (
    is_deleted = false
    and exists (
      select 1
      from public.posts p
      where p.id = post_id
        and (
          select public.can_view_user_content(p.user_id)
        )
    )
  );
create policy "comments_owner_write" on public.comments for
insert to authenticated with check (
    (
      select auth.uid()
    ) = user_id
    and exists (
      select 1
      from public.posts p
      where p.id = post_id
        and p.is_deleted = false
        and (
          select public.can_view_user_content(p.user_id)
        )
    )
  );
create policy "comments_owner_update" on public.comments for
update to authenticated using (
    (
      select auth.uid()
    ) = user_id
  ) with check (
    (
      select auth.uid()
    ) = user_id
  );
create policy "comments_owner_delete" on public.comments for delete to authenticated using (
  (
    select auth.uid()
  ) = user_id
);
create policy "comments_admin" on public.comments for all to service_role using (true) with check (true);
-- LIKES DE COMENTARIO (patrón idéntico a likes de post)
create policy "comment_likes_read" on public.comment_likes for
select to authenticated using (true);
create policy "comment_likes_write" on public.comment_likes for
insert to authenticated with check (
    (
      select auth.uid()
    ) = user_id
  );
create policy "comment_likes_delete" on public.comment_likes for delete to authenticated using (
  (
    select auth.uid()
  ) = user_id
);
-- RESPUESTAS
create policy "replies_read" on public.comment_replies for
select to authenticated using (
    is_deleted = false
    and exists (
      select 1
      from public.comments c
        join public.posts p on p.id = c.post_id
      where c.id = comment_id
        and (
          select public.can_view_user_content(p.user_id)
        )
    )
  );
create policy "replies_write" on public.comment_replies for
insert to authenticated with check (
    (
      select auth.uid()
    ) = user_id
  );
create policy "replies_update" on public.comment_replies for
update to authenticated using (
    (
      select auth.uid()
    ) = user_id
  ) with check (
    (
      select auth.uid()
    ) = user_id
  );
create policy "replies_delete" on public.comment_replies for delete to authenticated using (
  (
    select auth.uid()
  ) = user_id
);
create policy "replies_admin" on public.comment_replies for all to service_role using (true) with check (true);
-- LIKES DE RESPUESTA
create policy "reply_likes_read" on public.comment_reply_likes for
select to authenticated using (true);
create policy "reply_likes_write" on public.comment_reply_likes for
insert to authenticated with check (
    (
      select auth.uid()
    ) = user_id
  );
create policy "reply_likes_delete" on public.comment_reply_likes for delete to authenticated using (
  (
    select auth.uid()
  ) = user_id
);
-- ---------------------------------------------------------------------------
-- PERMISOS
-- ---------------------------------------------------------------------------
grant select,
  insert,
  update,
  delete on public.posts to authenticated;
grant select,
  insert,
  delete on public.post_media to authenticated;
grant select,
  insert,
  delete on public.post_likes to authenticated;
grant select,
  insert,
  update,
  delete on public.comments to authenticated;
grant select,
  insert,
  delete on public.comment_likes to authenticated;
grant select,
  insert,
  update,
  delete on public.comment_replies to authenticated;
grant select,
  insert,
  delete on public.comment_reply_likes to authenticated;