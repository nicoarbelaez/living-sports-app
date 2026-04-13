-- =============================================================================
-- MIGRACIÓN 007: Récords Personales (PRs)
-- Tablas: personal_records
-- Descripción: Mejor rendimiento del usuario por ejercicio, en un momento dado.
--              PRs ilimitados por ejercicio (se preserva el historial — no se reemplaza).
--              Vinculado solo al catálogo de ejercicios (no a rutinas ni competiciones).
-- Regla de negocio: Los PRs son a nivel de perfil. El "mejor actual" es el valor MÁXIMO
--              para una combinación dada de usuario+ejercicio.
-- =============================================================================
create table if not exists public.personal_records (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  -- El valor del PR y su unidad (dinámico según requerimiento)
  value numeric(10, 4) not null check (value > 0),
  -- Medios de prueba opcionales (un solo archivo adjunto por entrada de PR)
  media_url text,
  -- URL de imagen o vídeo (Supabase Storage)
  media_type text check (media_type in ('image', 'video')),
  -- Fecha en que se logró el PR (declarada por el usuario; puede diferir de created_at)
  achieved_on date not null default current_date,
  notes text,
  -- Estado de validación (usado cuando el PR proviene de evidencia de competición)
  -- 'self'       = registrado manualmente por el usuario (siempre válido)
  -- 'validated'  = aprobado por pares vía competición
  -- 'pending'    = esperando validación de pares
  -- 'rejected'   = rechazado por pares (puede ser re-enviado)
  source text not null default 'self' check (
    source in ('self', 'validated', 'pending', 'rejected')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger personal_records_updated_at before
update on public.personal_records for each row execute function public.set_updated_at();
-- Índices
-- Patrón primario: últimos PRs por usuario por ejercicio
create index if not exists pr_user_exercise_idx on public.personal_records (user_id, exercise_id, achieved_on desc);
-- Para consultas de tablas de clasificación: PRs por ejercicio a través de usuarios
create index if not exists pr_exercise_value_idx on public.personal_records (exercise_id, value desc);
-- Para la cola de validación pendiente
create index if not exists pr_pending_idx on public.personal_records (source)
where source = 'pending';
select audit.enable_audit('public', 'personal_records');
-- ---------------------------------------------------------------------------
-- VISTA: último PR por usuario por ejercicio (conveniencia — no materializada)
-- Justificación: evita re-calcular en cada consulta; puede materializarse
--               si el rendimiento lo requiere bajo carga pesada.
-- ---------------------------------------------------------------------------
create or replace view public.v_personal_records_best as
select distinct on (user_id, exercise_id) id,
  user_id,
  exercise_id,
  value,
  media_url,
  media_type,
  achieved_on,
  source
from public.personal_records
where source in ('self', 'validated')
order by user_id,
  exercise_id,
  value desc,
  achieved_on desc;
-- ---------------------------------------------------------------------------
-- RLS: RÉCORDS PERSONALES
-- ---------------------------------------------------------------------------
alter table public.personal_records enable row level security;
-- El propietario lee todos sus propios PRs (incluyendo rechazados/pendientes)
create policy "pr_owner_read" on public.personal_records for
select to authenticated using (
    (
      select auth.uid()
    ) = user_id
  );
-- Perfiles públicos: otros ven solo PRs validados/propios
create policy "pr_public_read" on public.personal_records for
select to authenticated using (
    source in ('self', 'validated')
    and exists (
      select 1
      from public.profiles p
      where p.id = user_id
        and p.is_public = true
    )
  );
-- El propietario inserta (solo fuente 'self'; el sistema de competición inserta pending/validated)
create policy "pr_owner_insert" on public.personal_records for
insert to authenticated with check (
    (
      select auth.uid()
    ) = user_id
    and source = 'self'
  );
-- El propietario puede actualizar notas/medios en sus propios PRs; no puede cambiar la fuente
create policy "pr_owner_update" on public.personal_records for
update to authenticated using (
    (
      select auth.uid()
    ) = user_id
  ) with check (
    (
      select auth.uid()
    ) = user_id
    and source = 'self'
  );
-- El propietario puede eliminar sus propios PRs registrados manualmente
create policy "pr_owner_delete" on public.personal_records for delete to authenticated using (
  (
    select auth.uid()
  ) = user_id
  and source = 'self'
);
-- Acceso total de Admin/servicio (necesario para el flujo de validación de competición)
create policy "pr_admin" on public.personal_records for all to service_role using (true) with check (true);
-- ---------------------------------------------------------------------------
-- PERMISOS
-- ---------------------------------------------------------------------------
grant select,
  insert,
  update,
  delete on public.personal_records to authenticated;
grant select on public.v_personal_records_best to authenticated;