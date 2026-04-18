-- =============================================================================
-- MIGRACIÓN 006: Rutinas
-- Tablas: routines, routine_exercises
-- Descripción: Plan de entrenamiento semanal. Una rutina por usuario por día de la semana.
--              Cada rutina contiene espacios de ejercicios ordenados.
-- Regla de negocio aplicada: máximo 1 rutina por usuario por day_of_week (0=Lun…6=Dom).
-- =============================================================================
create table if not exists public.routines (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- Asignación de día de la semana (ISO: 0=Lunes, 6=Domingo)
  day_of_week smallint not null check (
    day_of_week between 0 and 6
  ),
  name text not null,
  description text,
  duration_sec integer,
  -- duración estimada en segundos
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Regla de negocio: una rutina por usuario por día de la semana
  constraint routines_user_day_unique unique (user_id, day_of_week),
  constraint routines_name_length check (
    char_length(name) between 1 and 120
  ),
  constraint routines_duration_positive check (
    duration_sec is null
    or duration_sec between 1 and 86400
  )
);
create trigger routines_updated_at before
update on public.routines for each row execute function public.set_updated_at();
-- Índices
create index if not exists routines_user_idx on public.routines (user_id);
create index if not exists routines_user_day_idx on public.routines (user_id, day_of_week);
-- Parcial: solo las rutinas activas importan para la visualización diaria
create index if not exists routines_active_idx on public.routines (user_id, day_of_week)
where is_active = true;
select audit.enable_audit('public', 'routines');
-- ---------------------------------------------------------------------------
-- EJERCICIOS DE RUTINA (espacios de ejercicios ordenados dentro de una rutina)
-- Justificación: tabla separada para permitir configuración de múltiples series ordenadas
-- por espacio de ejercicio. Uso de sort_order para ordenamiento explícito.
-- ---------------------------------------------------------------------------
create table if not exists public.routine_exercises (
  id uuid not null default gen_random_uuid() primary key,
  routine_id uuid not null references public.routines(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  sets smallint not null check (sets > 0),
  reps smallint,
  -- nulo = AMRAP o basado en tiempo
  rest_seconds smallint check (rest_seconds >= 0),
  sort_order smallint not null default 0,
  -- orden de visualización dentro de la rutina
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger routine_exercises_updated_at before
update on public.routine_exercises for each row execute function public.set_updated_at();
-- Índices
create index if not exists routine_exercises_routine_idx on public.routine_exercises (routine_id, sort_order);
create index if not exists routine_exercises_exercise_idx on public.routine_exercises (exercise_id);
select audit.enable_audit('public', 'routine_exercises');
-- ---------------------------------------------------------------------------
-- RLS: RUTINAS
-- ---------------------------------------------------------------------------
alter table public.routines enable row level security;
create policy "routines_owner_all" on public.routines for all to authenticated using (
  (
    select auth.uid()
  ) = user_id
) with check (
  (
    select auth.uid()
  ) = user_id
);
-- Perfiles públicos: otros pueden leer las rutinas
create policy "routines_public_read" on public.routines for
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
create policy "routines_admin" on public.routines for all to service_role using (true) with check (true);
-- ---------------------------------------------------------------------------
-- RLS: EJERCICIOS DE RUTINA
-- ---------------------------------------------------------------------------
alter table public.routine_exercises enable row level security;
create policy "routine_exercises_owner_all" on public.routine_exercises for all to authenticated using (
  exists (
    select 1
    from public.routines r
    where r.id = routine_id
      and r.user_id = (
        select auth.uid()
      )
  )
) with check (
  exists (
    select 1
    from public.routines r
    where r.id = routine_id
      and r.user_id = (
        select auth.uid()
      )
  )
);
create policy "routine_exercises_public_read" on public.routine_exercises for
select to authenticated using (
    exists (
      select 1
      from public.routines r
        join public.profiles p on p.id = r.user_id
      where r.id = routine_id
        and (
          p.is_public = true
          or (
            select auth.uid()
          ) = p.id
        )
    )
  );
create policy "routine_exercises_admin" on public.routine_exercises for all to service_role using (true) with check (true);
-- ---------------------------------------------------------------------------
-- PERMISOS
-- ---------------------------------------------------------------------------
grant select,
  insert,
  update,
  delete on public.routines to authenticated;
grant select,
  insert,
  update,
  delete on public.routine_exercises to authenticated;