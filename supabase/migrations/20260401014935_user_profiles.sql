-- =============================================================================
-- MIGRACIÓN 003: Perfiles de Usuario y Asignación de Roles
-- Tablas: profiles, user_roles, user_social_links
-- Descripción: Extiende auth.users con datos de perfil a nivel de aplicación.
--              Se integra limpiamente con Supabase auth — sin duplicación.
-- Decisión de diseño: 1-a-1 entre auth.users y profiles. Los enlaces sociales están
--              en una tabla hija para permitir URLs ilimitadas sin EAV.
-- =============================================================================
-- ---------------------------------------------------------------------------
-- PERFILES
-- Una fila por cada fila en auth.users. Creado automáticamente al registrarse vía disparador.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  -- La PK refleja auth.users.id — no se necesita clave subrogada (ES la FK)
  id uuid not null references auth.users(id) on delete cascade primary key,
  -- Identidad
  username text not null unique,
  first_name text not null,
  last_name text not null,
  bio text,
  avatar_url text,
  phone text,
  -- opcional, se recomienda formato E.164
  -- Biológico (línea base de fitness — hechos inmutables sobre el usuario)
  date_of_birth date not null,
  sex text not null check (
    sex in ('male', 'female', 'other', 'prefer_not_to_say')
  ),
  height_cm numeric(5, 2),
  -- almacenado en cm; la app convierte para visualización
  -- Justificación: una sola unidad evita errores de conversión en consultas
  -- Ajustes (banderas que afectan visualización/privacidad — no datos de comportamiento)
  is_public boolean not null default true,
  -- visibilidad pública del perfil
  is_complete boolean not null default false,
  -- indica si el perfil está completo
  dark_mode boolean not null default false,
  -- preferencia de UI
  followers_count integer not null default 0,
  following_count integer not null default 0,
  -- Marcas de tiempo
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Restricciones
  constraint profiles_username_length check (
    char_length(username) between 3 and 30
  ),
  constraint profiles_username_format check (username ~ '^[a-z0-9_\.]+$'),
  constraint profiles_height_positive check (height_cm > 0)
);
create trigger profiles_updated_at before
update on public.profiles for each row execute function public.set_updated_at();
-- Índices
create index if not exists profiles_username_idx on public.profiles (username);
select audit.enable_audit('public', 'profiles');
-- ---------------------------------------------------------------------------
-- CREACIÓN AUTOMÁTICA DE PERFIL AL REGISTRARSE
-- Disparado por inserción en auth.users (Supabase gestiona OAuth, nosotros lo extendemos).
-- El nombre de usuario por defecto es el prefijo del email — el usuario debe actualizarlo.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger language plpgsql security definer
set search_path = '' as $$ begin
insert into public.profiles (
    id,
    username,
    first_name,
    last_name,
    date_of_birth,
    sex
  )
values (
    new.id,
    -- Derivar nombre de usuario del prefijo del email + sufijo aleatorio corto para evitar colisiones
    lower(split_part(new.email, '@', 1)) || '_' || substr(gen_random_uuid()::text, 1, 6),
    coalesce(
      new.raw_user_meta_data->>'given_name',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'family_name', ''),
    -- Fecha de nacimiento de marcador — el usuario debe completarla en el onboarding
    '2000-01-01'::date,
    'prefer_not_to_say'
  );
return new;
end;
$$;
create or replace trigger on_auth_user_created
after
insert on auth.users for each row execute function public.handle_new_user();
-- ---------------------------------------------------------------------------
-- ROLES DE USUARIO (N:M — los usuarios pueden tener múltiples roles, ej. admin + usuario)
-- Justificación: N:M soporta futuras combinaciones de roles sin cambios de esquema.
-- En la práctica, la mayoría de las filas serán (user_id, 'user').
-- ---------------------------------------------------------------------------
create table if not exists public.user_roles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id smallint not null references public.app_roles(id) on delete restrict,
  granted_by uuid references auth.users(id) on delete
  set null,
    -- admin que lo otorgó
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint user_roles_unique unique (user_id, role_id)
);
create trigger user_roles_updated_at before
update on public.user_roles for each row execute function public.set_updated_at();
-- Índices
create index if not exists user_roles_user_idx on public.user_roles (user_id);
create index if not exists user_roles_role_idx on public.user_roles (role_id);
select audit.enable_audit('public', 'user_roles');
-- Disparador de rol por defecto: asignar rol 'user' al crear el perfil
create or replace function public.assign_default_role() returns trigger language plpgsql security definer
set search_path = '' as $$
declare v_user_role_id smallint;
begin
select id into v_user_role_id
from public.app_roles
where name = 'user'
limit 1;
if v_user_role_id is not null then
insert into public.user_roles (user_id, role_id)
values (new.id, v_user_role_id) on conflict do nothing;
end if;
return new;
end;
$$;
create or replace trigger on_profile_created_assign_role
after
insert on public.profiles for each row execute function public.assign_default_role();
-- ---------------------------------------------------------------------------
-- ENLACES SOCIALES DE USUARIO
-- Tabla separada: URLs sociales ilimitadas por usuario, sin necesidad de EAV.
-- Justificación: normalizar en una tabla hija permite plataformas ilimitadas
--               sin alterar el esquema de perfiles por cada nueva red.
-- ---------------------------------------------------------------------------
create table if not exists public.user_social_links (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  -- 'instagram', 'twitter', 'strava', 'youtube', etc.
  url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_social_links_unique unique (user_id, platform),
  constraint user_social_links_url_format check (url ~ '^https?://')
);
create trigger user_social_links_updated_at before
update on public.user_social_links for each row execute function public.set_updated_at();
create index if not exists user_social_links_user_idx on public.user_social_links (user_id);
select audit.enable_audit('public', 'user_social_links');
-- ---------------------------------------------------------------------------
-- FUNCIÓN DE AYUDA: comprobar si el usuario actual tiene un rol dado
-- Usado en políticas RLS para evitar subconsultas por fila.
-- SECURITY DEFINER para que pueda leer user_roles omitiendo RLS.
-- ---------------------------------------------------------------------------
create or replace function public.has_role(p_role text) returns boolean language sql stable security definer
set search_path = '' as $$
select exists (
    select 1
    from public.user_roles ur
      join public.app_roles ar on ar.id = ur.role_id
    where ur.user_id = (
        select auth.uid()
      )
      and ar.name = p_role
  );
$$;
-- ---------------------------------------------------------------------------
-- RLS: PERFILES
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
-- El propietario puede actualizar su propio perfil
create policy "profiles_owner_update" on public.profiles for
update to authenticated using (
    (
      select auth.uid()
    ) = id
  ) with check (
    (
      select auth.uid()
    ) = id
  );
-- Los admins pueden leer/actualizar todos los perfiles
create policy "profiles_admin_all" on public.profiles for all to service_role using (true) with check (true);
-- Soporte puede leer todo
create policy "profiles_support_read" on public.profiles for
select to authenticated using (
    (
      select public.has_role('support')
    )
    or (
      select public.has_role('admin')
    )
  );
-- ---------------------------------------------------------------------------
-- RLS: ROLES DE USUARIO
-- ---------------------------------------------------------------------------
alter table public.user_roles enable row level security;
create policy "user_roles_owner_read" on public.user_roles for
select to authenticated using (
    (
      select auth.uid()
    ) = user_id
  );
create policy "user_roles_admin_all" on public.user_roles for all to service_role using (true) with check (true);
-- ---------------------------------------------------------------------------
-- RLS: ENLACES SOCIALES
-- ---------------------------------------------------------------------------
alter table public.user_social_links enable row level security;
create policy "social_links_read" on public.user_social_links for
select to authenticated using (
    exists (
      select 1
      from public.profiles p
      where p.id = user_id
        and (
          p.is_public = true
          or (
            select auth.uid()
          ) = p.id
        )
    )
  );
create policy "social_links_owner_write" on public.user_social_links for all to authenticated using (
  (
    select auth.uid()
  ) = user_id
) with check (
  (
    select auth.uid()
  ) = user_id
);
-- ---------------------------------------------------------------------------
-- PERMISOS
-- ---------------------------------------------------------------------------
grant select,
  update on public.profiles to authenticated;
grant select,
  insert,
  update,
  delete on public.user_social_links to authenticated;
grant select on public.user_roles to authenticated;