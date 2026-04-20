-- =============================================================================
-- MIGRACIÓN 002: Catálogos Core
-- Tablas: app_roles, measurement_units, muscle_categories, exercises
-- Descripción: Tablas de búsqueda / catálogo gestionadas por administradores. Estas son las
--              entidades fundamentales referenciadas por todas las demás tablas de dominio.
-- =============================================================================
-- ---------------------------------------------------------------------------
-- ENUM DE ROLES DE APP
-- Justificación: Uso de texto + restricción de verificación (no pg ENUM) para que
-- añadir nuevos roles nunca requiera ALTER TYPE (que bloquea la tabla en versiones antiguas de PG).
-- ---------------------------------------------------------------------------
create table if not exists public.app_roles (
  id smallint generated always as identity primary key,
  name text not null unique,
  -- 'admin' | 'user'
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger app_roles_updated_at before
update on public.app_roles for each row execute function public.set_updated_at();
-- Semilla de roles
insert into public.app_roles (name, description)
values (
    'admin',
    'Acceso total: gestionar usuarios, ejercicios, todos los datos'
  ),
  ('user', 'Usuario autenticado estándar') on conflict (name) do nothing;
select audit.enable_audit('public', 'app_roles');
-- ---------------------------------------------------------------------------
-- CATEGORÍAS MUSCULARES
-- Usadas para clasificar ejercicios. Los administradores gestionan este catálogo.
-- ---------------------------------------------------------------------------
create table if not exists public.muscle_categories (
  id smallint generated always as identity primary key,
  name text not null unique,
  icon_url text,
  -- URL opcional de icono/imagen para la UI
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger muscle_categories_updated_at before
update on public.muscle_categories for each row execute function public.set_updated_at();
-- Semilla de grupos musculares
insert into public.muscle_categories (name)
values ('Pectorales'),
  ('Espalda'),
  ('Hombros'),
  ('Bíceps'),
  ('Tríceps'),
  ('Antebrazos'),
  ('Core / abdomen'),
  ('Glúteos'),
  ('Cuádriceps'),
  ('Isquiotibiales'),
  ('Pantorrillas'),
  ('Cuerpo completo'),
  ('Cardio') on conflict (name) do nothing;
select audit.enable_audit('public', 'muscle_categories');
-- ---------------------------------------------------------------------------
-- EJERCICIOS (Entidad global core — gestionada por admin)
-- Todos los PRs, rutinas y competiciones referencian esta tabla.
-- Justificación: El catálogo central evita la dispersión de nombres y permite
-- comparaciones de PRs entre usuarios y consistencia en la configuración de competiciones.
-- ---------------------------------------------------------------------------
create table if not exists public.exercises (
  id uuid not null default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  muscle_category_id smallint not null references public.muscle_categories(id) on delete restrict,
  image_url text,
  is_active boolean not null default true,
  -- eliminación lógica para ejercicios en uso
  created_by uuid references auth.users(id) on delete
  set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create trigger exercises_updated_at before
update on public.exercises for each row execute function public.set_updated_at();
-- Índices
create index if not exists exercises_muscle_category_idx on public.exercises (muscle_category_id);
create index if not exists exercises_active_idx on public.exercises (is_active)
where is_active = true;
create index if not exists exercises_name_trgm_idx on public.exercises using gin (name gin_trgm_ops);
-- ^ Requiere pg_trgm para búsqueda difusa — habilitado en la migración base
select audit.enable_audit('public', 'exercises');
-- ---------------------------------------------------------------------------
-- PERMISOS: los catálogos son legibles por todos los usuarios autenticados
-- ---------------------------------------------------------------------------
grant select on public.app_roles to authenticated;
grant select on public.muscle_categories to authenticated;
grant select on public.exercises to authenticated;
-- Los admins pueden modificar
grant insert,
  update on public.muscle_categories to app_admin;
grant insert,
  update on public.exercises to app_admin;
-- RLS en catálogos (todos los autenticados pueden leer; solo los admins escriben vía service_role o directo)
alter table public.app_roles enable row level security;
alter table public.muscle_categories enable row level security;
alter table public.exercises enable row level security;
-- Crear politicas
create policy "catalog_read_authenticated" on public.app_roles for
select to authenticated using (true);
create policy "catalog_read_authenticated" on public.muscle_categories for
select to authenticated using (true);
create policy "exercises_read_active" on public.exercises for
select to authenticated using (is_active = true);
-- Los admins omiten RLS vía service_role; soporte lee todo
create policy "exercises_admin_all" on public.exercises for all to service_role using (true) with check (true);