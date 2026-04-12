-- =============================================================================
-- MIGRACIÓN 005: Sistema de Seguimiento (Follow)
-- Tablas: follows
-- Descripción: Grafo dirigido: seguidor → seguido.
--              Soporta perfiles tanto públicos (aprobación automática) como privados (pendiente).
-- =============================================================================
create table if not exists public.follows (
  id bigint generated always as identity primary key,
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  -- Máquina de estados: pending → accepted (para perfiles privados)
  -- Perfiles públicos: se insertan directamente como 'accepted'
  status text not null default 'accepted' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Un usuario no puede seguirse a sí mismo
  constraint follows_no_self_follow check (follower_id <> following_id),
  -- Una relación de seguimiento única por par
  constraint follows_unique unique (follower_id, following_id)
);
create trigger follows_updated_at before
update on public.follows for each row execute function public.set_updated_at();
-- Índices — se necesitan ambas direcciones para las consultas del feed
create index if not exists follows_follower_idx on public.follows (follower_id, status);
create index if not exists follows_following_idx on public.follows (following_id, status);
-- Índice parcial para solicitudes pendientes (bandeja de entrada para perfiles privados)
create index if not exists follows_pending_idx on public.follows (following_id)
where status = 'pending';
select audit.enable_audit('public', 'follows');
-- ---------------------------------------------------------------------------
-- DISPARADOR: auto-aceptar seguimientos para perfiles públicos
-- ---------------------------------------------------------------------------
create or replace function public.handle_follow_request() returns trigger language plpgsql security definer
set search_path = '' as $$
declare v_is_public boolean;
begin
select is_public into v_is_public
from public.profiles
where id = new.following_id;
if v_is_public then new.status := 'accepted';
else new.status := 'pending';
end if;
return new;
end;
$$;
create trigger follows_auto_accept before
insert on public.follows for each row execute function public.handle_follow_request();
-- ---------------------------------------------------------------------------
-- FUNCIÓN DE AYUDA: ¿puede ver el perfil completo?
-- Usa esta función tanto en RLS como en la vista pública enmascarada.
-- SECURITY DEFINER para poder leer follows / roles sin quedar bloqueado por RLS.
-- ---------------------------------------------------------------------------
create or replace function public.can_view_full_profile(p_profile_id uuid) returns boolean language sql stable security definer
set search_path = '' as $$
select -- El propio dueño siempre ve todo
  (
    select auth.uid()
  ) = p_profile_id -- Perfiles públicos
  or exists (
    select 1
    from public.profiles p
    where p.id = p_profile_id
      and p.is_public = true
  ) -- Seguidores aceptados también ven todo
  or exists (
    select 1
    from public.follows f
    where f.following_id = p_profile_id
      and f.follower_id = (
        select auth.uid()
      )
      and f.status = 'accepted'
  ) -- Roles especiales
  or public.has_role('admin');
$$;
-- ---------------------------------------------------------------------------
-- CONTEOS DE SEGUIDORES MATERIALIZADOS (optimización opcional para alto tráfico)
-- Justificación: Calcular COUNT(*) en follows por usuario en cada vista de perfil
-- es costoso a escala. Se actualiza un contador en caché mediante un disparador.
-- Esta es una desnormalización intencional para el rendimiento de lectura.
-- ---------------------------------------------------------------------------
-- NOTA: Implementado como un simple caché de contador en perfiles para evitar
-- un ciclo completo de refresco de vista materializada. Podría actualizarse a mat view si es necesario.
create or replace function public.update_follow_counts() returns trigger language plpgsql security definer
set search_path = '' as $$ begin if TG_OP = 'INSERT'
  and new.status = 'accepted' then
update public.profiles
set followers_count = followers_count + 1
where id = new.following_id;
update public.profiles
set following_count = following_count + 1
where id = new.follower_id;
elsif TG_OP = 'UPDATE' then -- Aceptado: incrementar
if old.status <> 'accepted'
and new.status = 'accepted' then
update public.profiles
set followers_count = followers_count + 1
where id = new.following_id;
update public.profiles
set following_count = following_count + 1
where id = new.follower_id;
-- Dejó de seguir o rechazado: decrementar
elsif old.status = 'accepted'
and new.status <> 'accepted' then
update public.profiles
set followers_count = greatest(followers_count - 1, 0)
where id = new.following_id;
update public.profiles
set following_count = greatest(following_count - 1, 0)
where id = new.follower_id;
end if;
elsif TG_OP = 'DELETE'
and old.status = 'accepted' then
update public.profiles
set followers_count = greatest(followers_count - 1, 0)
where id = old.following_id;
update public.profiles
set following_count = greatest(following_count - 1, 0)
where id = old.follower_id;
end if;
return coalesce(new, old);
end;
$$;
create trigger follows_update_counts
after
insert
  or
update
  or delete on public.follows for each row execute function public.update_follow_counts();
-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.follows enable row level security;
-- Lectura: público, dueño, seguidores aceptados y admin
create policy "profiles_read" on public.profiles for
select to authenticated using (public.can_view_full_profile(id));
-- Lectura: ver seguimientos donde eres cualquiera de las partes, o perfiles públicos
create policy "follows_read" on public.follows for
select to authenticated using (
    (
      select auth.uid()
    ) = follower_id
    or (
      select auth.uid()
    ) = following_id
    or exists (
      select 1
      from public.profiles p
      where p.id = following_id
        and p.is_public = true
    )
  );
-- Inserción: el usuario autenticado puede seguir a otros
create policy "follows_insert" on public.follows for
insert to authenticated with check (
    (
      select auth.uid()
    ) = follower_id
  );
-- Actualización: solo el usuario seguido puede aceptar/rechazar
create policy "follows_update" on public.follows for
update to authenticated using (
    (
      select auth.uid()
    ) = following_id
  ) with check (
    (
      select auth.uid()
    ) = following_id
  );
-- Eliminación: el seguidor puede dejar de seguir; el seguido puede eliminar a un seguidor
create policy "follows_delete" on public.follows for delete to authenticated using (
  (
    select auth.uid()
  ) = follower_id
  or (
    select auth.uid()
  ) = following_id
);
-- ---------------------------------------------------------------------------
-- VISTA DE PERFIL: público ve solo username en perfiles privados
-- Si el usuario puede ver el perfil completo, devuelve todos los campos.
-- Si no puede, devuelve únicamente username y el id para joins internos.
-- ---------------------------------------------------------------------------
create or replace view public.profiles_public_view as
select p.id,
  p.username,
  case
    when v.can_view_full_profile then p.first_name
    else null
  end as first_name,
  case
    when v.can_view_full_profile then p.last_name
    else null
  end as last_name,
  case
    when v.can_view_full_profile then p.bio
    else null
  end as bio,
  case
    when v.can_view_full_profile then p.avatar_url
    else null
  end as avatar_url,
  case
    when v.can_view_full_profile then p.phone
    else null
  end as phone,
  case
    when v.can_view_full_profile then p.date_of_birth
    else null
  end as date_of_birth,
  case
    when v.can_view_full_profile then p.sex
    else null
  end as sex,
  case
    when v.can_view_full_profile then p.height_cm
    else null
  end as height_cm,
  case
    when v.can_view_full_profile then p.is_public
    else null
  end as is_public,
  case
    when v.can_view_full_profile then p.is_complete
    else null
  end as is_complete,
  case
    when v.can_view_full_profile then p.dark_mode
    else null
  end as dark_mode,
  case
    when v.can_view_full_profile then p.followers_count
    else null
  end as followers_count,
  case
    when v.can_view_full_profile then p.following_count
    else null
  end as following_count,
  case
    when v.can_view_full_profile then p.created_at
    else null
  end as created_at,
  case
    when v.can_view_full_profile then p.updated_at
    else null
  end as updated_at
from public.profiles p
  cross join lateral (
    select public.can_view_full_profile(p.id) as can_view_full_profile
  ) v;
revoke
select on public.profiles
from authenticated;
grant select on public.profiles_public_view to authenticated;
-- ---------------------------------------------------------------------------
-- PERMISOS
-- ---------------------------------------------------------------------------
grant select,
  insert,
  update,
  delete on public.follows to authenticated;