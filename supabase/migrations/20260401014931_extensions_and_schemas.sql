-- =============================================================================
-- MIGRACIÓN 001: Extensiones, Esquemas y Funciones de Utilidad
-- Aplicación: Fitness Social Network
-- Autor: Arquitecto de DB Senior
-- Descripción: Configuración base para extensiones, esquemas, funciones de utilidad y auditoría
-- =============================================================================
-- ---------------------------------------------------------------------------
-- EXTENSIONES
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";
-- Generación aleatoria segura, hashing
create extension if not exists "pg_trgm";
-- ---------------------------------------------------------------------------
-- ESQUEMAS
-- ---------------------------------------------------------------------------
-- public     → tablas de la aplicación (predeterminado)
-- audit      → tablas de registro de auditoría completas (esquema separado para claridad + aislamiento RLS)
create schema if not exists audit;
-- ---------------------------------------------------------------------------
-- ROLES
-- ---------------------------------------------------------------------------
-- Supabase ya crea: anon, authenticated, service_role
-- Añadimos roles de nivel de aplicación para un control de grano fino
do $$ begin if not exists (
  select 1
  from pg_roles
  where rolname = 'app_admin'
) then create role app_admin nologin;
end if;
end $$;
do $$ begin if not exists (
  select 1
  from pg_roles
  where rolname = 'app_user'
) then create role app_user nologin;
end if;
end $$;
-- Otorgar permisos sobre esquemas
grant usage on schema public to authenticated,
  app_admin,
  app_user;
grant usage on schema audit to app_admin;
-- Revocar acceso público por defecto (principio de mínimo privilegio)
revoke all on schema public
from public;
-- ---------------------------------------------------------------------------
-- UTILIDAD: función de disparador automático updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger language plpgsql security definer
set search_path = '' as $$ begin new.updated_at = now();
return new;
end;
$$;
-- ---------------------------------------------------------------------------
-- INFRAESTRUCTURA DE AUDITORÍA
-- ---------------------------------------------------------------------------
-- Registro de auditoría genérico único para todas las tablas.
-- Captura: quién, qué tabla, qué operación, snapshot JSON antiguo/nuevo, cuándo.
-- Justificación de la desnormalización: almacenar snapshots JSONB es intencional —
-- es un rastro de auditoría, no datos operativos. El anti-patrón EAV NO aplica aquí.
create table if not exists audit.audit_log (
  id bigint generated always as identity primary key,
  schema_name text not null,
  table_name text not null,
  record_id text not null,
  -- almacena PK como texto (universal)
  operation text not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  -- nulo en INSERT
  new_data jsonb,
  -- nulo en DELETE
  changed_by uuid,
  -- auth.uid() al momento de la operación
  changed_at timestamptz not null default now(),
  ip_address inet,
  -- opcional: desde encabezados de solicitud
  user_agent text -- opcional: desde encabezados de solicitud
);
-- El registro de auditoría es de solo adición — no se permiten actualizaciones ni eliminaciones
alter table audit.audit_log enable row level security;
create policy audit_log_admin_read on audit.audit_log for
select to app_admin using (true);
-- Índices para consultas de auditoría
create index if not exists audit_log_table_record_idx on audit.audit_log (table_name, record_id);
create index if not exists audit_log_changed_by_idx on audit.audit_log (changed_by);
create index if not exists audit_log_changed_at_idx on audit.audit_log (changed_at desc);
create index if not exists audit_log_operation_idx on audit.audit_log (operation);
-- ---------------------------------------------------------------------------
-- FUNCIÓN DE DISPARADOR DE AUDITORÍA GENÉRICA
-- ---------------------------------------------------------------------------
create or replace function audit.log_changes() returns trigger language plpgsql security definer
set search_path = '' as $$
declare v_record_id text;
v_old_data jsonb;
v_new_data jsonb;
begin -- Extraer PK de la fila (asume columna llamada 'id')
if TG_OP = 'DELETE' then v_record_id := old.id::text;
v_old_data := to_jsonb(old);
v_new_data := null;
elsif TG_OP = 'INSERT' then v_record_id := new.id::text;
v_old_data := null;
v_new_data := to_jsonb(new);
else -- UPDATE
v_record_id := new.id::text;
v_old_data := to_jsonb(old);
v_new_data := to_jsonb(new);
end if;
insert into audit.audit_log (
    schema_name,
    table_name,
    record_id,
    operation,
    old_data,
    new_data,
    changed_by
  )
values (
    TG_TABLE_SCHEMA,
    TG_TABLE_NAME,
    v_record_id,
    TG_OP,
    v_old_data,
    v_new_data,
    auth.uid()
  );
if TG_OP = 'DELETE' then return old;
end if;
return new;
end;
$$;
-- ---------------------------------------------------------------------------
-- AYUDA: adjuntar disparador de auditoría a una tabla (llamado por migración)
-- ---------------------------------------------------------------------------
create or replace function audit.enable_audit(p_schema text, p_table text) returns void language plpgsql as $$
declare v_trigger_name text := p_table || '_audit_trigger';
begin execute format(
  $tg$
  create or replace trigger %I
  after
  insert
    or
  update
    or delete on %I. %I for each row execute function audit.log_changes() $tg$,
    v_trigger_name,
    p_schema,
    p_table
);
end;
$$;