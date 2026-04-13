-- =============================================================================
-- MIGRACIÓN 004: Historial de Mediciones Corporales
-- Tablas: body_snapshots
-- Descripción: Historial versionado / de solo adición de mediciones físicas.
--              Cada fila = una sesión de medición en una fecha dada.
--              Todas las columnas de medición son opcionales excepto user_id + recorded_on.
-- Decisión de diseño: Tabla única ancha (no EAV) para el conjunto fijo de mediciones corporales.
--              Justificación: la lista de mediciones es conocida, limitada (15 columnas),
--              y las consultas agregan a través de las columnas.
--              EAV haría imposibles las agregaciones y la seguridad de tipos.
-- Almacenamiento de unidades: todos los valores físicos se almacenan en unidades base SI (kg, cm).
--              La capa de la aplicación convierte para la visualización. Evita errores de conversión.
-- =============================================================================
create table if not exists public.body_snapshots (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- Fecha de la medición (se aplica una instantánea por usuario por día abajo)
  recorded_on date not null,
  -- Peso y composición
  weight_kg numeric(6, 2),
  -- peso corporal en kg
  body_fat_pct numeric(5, 2),
  -- % de grasa corporal
  muscle_mass_kg numeric(6, 2),
  -- masa muscular magra en kg
  -- Mediciones de circunferencia (todas en cm)
  neck_cm numeric(5, 2),
  shoulders_cm numeric(5, 2),
  chest_cm numeric(5, 2),
  bicep_right_cm numeric(5, 2),
  bicep_left_cm numeric(5, 2),
  forearm_right_cm numeric(5, 2),
  forearm_left_cm numeric(5, 2),
  waist_cm numeric(5, 2),
  -- punto más estrecho
  abdomen_cm numeric(5, 2),
  -- en el ombligo
  hips_cm numeric(5, 2),
  -- punto más ancho (glúteos)
  thigh_right_cm numeric(5, 2),
  thigh_left_cm numeric(5, 2),
  calf_right_cm numeric(5, 2),
  calf_left_cm numeric(5, 2),
  -- Notas opcionales para la sesión
  notes text,
  -- Marcas de tiempo
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Regla de negocio: una instantánea por usuario por día
  constraint body_snapshots_user_day_unique unique (user_id, recorded_on),
  -- Verificaciones de cordura
  constraint body_snapshots_weight_positive check (
    weight_kg is null
    or weight_kg > 0
  ),
  constraint body_snapshots_fat_range check (
    body_fat_pct is null
    or (
      body_fat_pct between 0 and 100
    )
  ),
  constraint body_snapshots_muscle_positive check (
    muscle_mass_kg is null
    or muscle_mass_kg > 0
  )
);
create trigger body_snapshots_updated_at before
update on public.body_snapshots for each row execute function public.set_updated_at();
-- Índices
-- Patrón de acceso primario: las últimas N instantáneas para un usuario (línea de tiempo)
create index if not exists body_snapshots_user_date_idx on public.body_snapshots (user_id, recorded_on desc);
-- Consultas de rango por fecha para graficar el progreso
create index if not exists body_snapshots_date_idx on public.body_snapshots (recorded_on desc);
select audit.enable_audit('public', 'body_snapshots');
-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.body_snapshots enable row level security;
-- El propietario lee su propio historial
create policy "body_snapshots_owner_read" on public.body_snapshots for
select to authenticated using (
    (
      select auth.uid()
    ) = user_id
  );
-- El propietario escribe
create policy "body_snapshots_owner_write" on public.body_snapshots for
insert to authenticated with check (
    (
      select auth.uid()
    ) = user_id
  );
create policy "body_snapshots_owner_update" on public.body_snapshots for
update to authenticated using (
    (
      select auth.uid()
    ) = user_id
  ) with check (
    (
      select auth.uid()
    ) = user_id
  );
create policy "body_snapshots_owner_delete" on public.body_snapshots for delete to authenticated using (
  (
    select auth.uid()
  ) = user_id
);
-- Acceso total para administradores
create policy "body_snapshots_admin" on public.body_snapshots for all to service_role using (true) with check (true);
-- ---------------------------------------------------------------------------
-- PERMISOS
-- ---------------------------------------------------------------------------
grant select,
  insert,
  update,
  delete on public.body_snapshots to authenticated;