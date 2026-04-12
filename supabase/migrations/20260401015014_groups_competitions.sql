-- =============================================================================
-- MIGRACIÓN 009: Grupos y Competiciones
-- Tablas: groups, group_tags, group_tag_assignments, group_members,
--         competitions, competition_exercises, competition_participants,
--         competition_days, competition_entries, competition_validations
-- Descripción: Los grupos son comunidades. Las competiciones ocurren dentro de los grupos.
--              Cada día los participantes envían pruebas (se requiere vídeo).
--              Los pares validan las pruebas → activa la creación de PR tras la aprobación.
-- =============================================================================
-- ---------------------------------------------------------------------------
-- GRUPOS
-- ---------------------------------------------------------------------------
create table if not exists public.groups (
  id uuid not null default gen_random_uuid() primary key,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null unique,
  description text,
  image_url text,
  emoji text,
  -- alternativa a la imagen (visualización de un solo emoji)
  is_public boolean not null default true,
  -- Desnormalizado
  members_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint groups_name_length check (
    char_length(name) between 3 and 80
  ),
  -- Sea imagen o emoji, no es obligatorio tener ambos
  constraint groups_identity check (
    image_url is not null
    or emoji is not null
    or true
  )
);
create trigger groups_updated_at before
update on public.groups for each row execute function public.set_updated_at();
create index if not exists groups_owner_idx on public.groups (owner_id);
create index if not exists groups_public_idx on public.groups (is_public)
where is_public = true;
select audit.enable_audit('public', 'groups');
-- ---------------------------------------------------------------------------
-- ETIQUETAS DE GRUPO (catálogo de etiquetas dinámico — crece a medida que los usuarios crean etiquetas)
-- ---------------------------------------------------------------------------
create table if not exists public.group_tags (
  id smallint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);
-- ---------------------------------------------------------------------------
-- ASIGNACIONES DE ETIQUETAS DE GRUPO (N:M: grupos ↔ etiquetas)
-- ---------------------------------------------------------------------------
create table if not exists public.group_tag_assignments (
  group_id uuid not null references public.groups(id) on delete cascade,
  tag_id smallint not null references public.group_tags(id) on delete cascade,
  primary key (group_id, tag_id)
);
create index if not exists group_tag_assignments_tag_idx on public.group_tag_assignments (tag_id);
-- ---------------------------------------------------------------------------
-- MIEMBROS DE GRUPO (N:M: perfiles ↔ grupos)
-- ---------------------------------------------------------------------------
create table if not exists public.group_members (
  id bigint generated always as identity primary key,
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'active' check (status in ('active', 'pending', 'banned')),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint group_members_unique unique (group_id, user_id)
);
create trigger group_members_updated_at before
update on public.group_members for each row execute function public.set_updated_at();
create index if not exists group_members_group_idx on public.group_members (group_id, status);
create index if not exists group_members_user_idx on public.group_members (user_id);
-- Disparador de contador para members_count
create or replace function public.update_group_members_count() returns trigger language plpgsql security definer
set search_path = '' as $$ begin if TG_OP = 'INSERT'
  and new.status = 'active' then
update public.groups
set members_count = members_count + 1
where id = new.group_id;
elsif TG_OP = 'DELETE'
and old.status = 'active' then
update public.groups
set members_count = greatest(members_count - 1, 0)
where id = old.group_id;
elsif TG_OP = 'UPDATE' then if old.status <> 'active'
and new.status = 'active' then
update public.groups
set members_count = members_count + 1
where id = new.group_id;
elsif old.status = 'active'
and new.status <> 'active' then
update public.groups
set members_count = greatest(members_count - 1, 0)
where id = new.group_id;
end if;
end if;
return coalesce(new, old);
end;
$$;
create trigger group_members_count_trigger
after
insert
  or
update
  or delete on public.group_members for each row execute function public.update_group_members_count();
select audit.enable_audit('public', 'group_members');
-- ---------------------------------------------------------------------------
-- COMPETICIONES (dentro de un grupo)
-- ---------------------------------------------------------------------------
create table if not exists public.competitions (
  id uuid not null default gen_random_uuid() primary key,
  group_id uuid not null references public.groups(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  description text,
  -- Alcance de participación: 'all' = todos los miembros del grupo; 'selected' = lista explícita
  participant_scope text not null default 'all' check (participant_scope in ('all', 'selected')),
  -- Calendario de competición: basado en fecha (granularidad de día, sin hora)
  start_date date not null,
  end_date date not null,
  -- Reglas de negocio (almacenadas como JSONB para flexibilidad sin EAV)
  -- ej. {"min_reps": 10, "counting": "max_value", "tie_break": "earliest"}
  rules jsonb not null default '{}',
  status text not null default 'draft' check (
    status in ('draft', 'active', 'finished', 'cancelled')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint competitions_dates_valid check (end_date >= start_date),
  constraint competitions_title_length check (
    char_length(title) between 3 and 120
  )
);
create trigger competitions_updated_at before
update on public.competitions for each row execute function public.set_updated_at();
create index if not exists competitions_group_idx on public.competitions (group_id, status);
create index if not exists competitions_dates_idx on public.competitions (start_date, end_date);
create index if not exists competitions_active_idx on public.competitions (status)
where status = 'active';
select audit.enable_audit('public', 'competitions');
-- ---------------------------------------------------------------------------
-- EJERCICIOS DE COMPETICIÓN (N:M: competiciones ↔ ejercicios)
-- Una competición puede dirigirse a uno o más ejercicios.
-- ---------------------------------------------------------------------------
create table if not exists public.competition_exercises (
  competition_id uuid not null references public.competitions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  primary key (competition_id, exercise_id)
);
create index if not exists comp_exercises_exercise_idx on public.competition_exercises (exercise_id);
-- ---------------------------------------------------------------------------
-- PARTICIPANTES DE COMPETICIÓN
-- Lista explícita cuando participant_scope = 'selected'.
-- Cuando scope = 'all', esta tabla se ignora (todos los miembros activos del grupo califican).
-- ---------------------------------------------------------------------------
create table if not exists public.competition_participants (
  id bigint generated always as identity primary key,
  competition_id uuid not null references public.competitions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  invited_by uuid references public.profiles(id) on delete
  set null,
    status text not null default 'invited' check (status in ('invited', 'accepted', 'declined')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint competition_participants_unique unique (competition_id, user_id)
);
create trigger competition_participants_updated_at before
update on public.competition_participants for each row execute function public.set_updated_at();
create index if not exists comp_participants_comp_idx on public.competition_participants (competition_id, status);
create index if not exists comp_participants_user_idx on public.competition_participants (user_id);
select audit.enable_audit('public', 'competition_participants');
-- ---------------------------------------------------------------------------
-- DÍAS DE COMPETICIÓN (días de calendario explícitos dentro del rango de competición)
-- Justificación: almacenar días explícitos (no generados) permite a los admins
-- desactivar días específicos (ej. días de descanso), añadir reglas específicas del día, etc.
-- Generados de start_date→end_date al crear la competición mediante función.
-- ---------------------------------------------------------------------------
create table if not exists public.competition_days (
  id uuid not null default gen_random_uuid() primary key,
  competition_id uuid not null references public.competitions(id) on delete cascade,
  day_date date not null,
  is_active boolean not null default true,
  -- el administrador puede desactivar un día
  day_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint competition_days_unique unique (competition_id, day_date)
);
create trigger competition_days_updated_at before
update on public.competition_days for each row execute function public.set_updated_at();
create index if not exists comp_days_comp_date_idx on public.competition_days (competition_id, day_date);
-- Autogeneración de días al crear competición
create or replace function public.generate_competition_days() returns trigger language plpgsql security definer
set search_path = '' as $$
declare v_day date;
begin v_day := new.start_date;
while v_day <= new.end_date loop
insert into public.competition_days (competition_id, day_date)
values (new.id, v_day) on conflict do nothing;
v_day := v_day + interval '1 day';
end loop;
return new;
end;
$$;
create trigger competitions_generate_days
after
insert on public.competitions for each row execute function public.generate_competition_days();
select audit.enable_audit('public', 'competition_days');
-- ---------------------------------------------------------------------------
-- ENTRADAS DE COMPETICIÓN (envíos de evidencia diarios)
-- Una entrada por usuario por día de competición por ejercicio.
-- ---------------------------------------------------------------------------
create table if not exists public.competition_entries (
  id uuid not null default gen_random_uuid() primary key,
  competition_day_id uuid not null references public.competition_days(id) on delete cascade,
  competition_id uuid not null references public.competitions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- Evidencia (se REQUIERE vídeo según requerimiento)
  video_url text not null,
  description text,
  -- PR reclamado en esta entrada
  pr_value numeric(10, 4) not null check (pr_value > 0),
  -- Ciclo de vida de validación
  -- 'pending'   → esperando validación de pares
  -- 'approved'  → suficientes pares aprobaron → crea registro de PR
  -- 'rejected'  → suficientes pares rechazaron → el usuario puede re-editar
  -- 'resubmitted' → el usuario editó tras rechazo, vuelve a pendiente
  validation_status text not null default 'pending' check (
    validation_status in ('pending', 'approved', 'rejected', 'resubmitted')
  ),
  -- Conteos (actualizados por disparador de validación)
  approvals_count integer not null default 0,
  rejections_count integer not null default 0,
  -- Enlace al PR creado tras aprobación (establecido por disparador)
  resulting_pr_id uuid references public.personal_records(id) on delete
  set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    -- Una entrada por usuario por día por ejercicio en una competición
    constraint competition_entries_unique unique (competition_day_id, user_id, exercise_id),
    -- el ejercicio debe estar registrado para esta competición
    constraint competition_entries_exercise_valid foreign key (competition_id, exercise_id) references public.competition_exercises(competition_id, exercise_id)
);
create trigger competition_entries_updated_at before
update on public.competition_entries for each row execute function public.set_updated_at();
create index if not exists comp_entries_day_idx on public.competition_entries (competition_day_id);
create index if not exists comp_entries_user_idx on public.competition_entries (user_id, competition_id);
create index if not exists comp_entries_pending_idx on public.competition_entries (validation_status)
where validation_status in ('pending', 'resubmitted');
select audit.enable_audit('public', 'competition_entries');
-- ---------------------------------------------------------------------------
-- VALIDACIONES DE COMPETICIÓN (votos de pares por entrada)
-- ---------------------------------------------------------------------------
create table if not exists public.competition_validations (
  id bigint generated always as identity primary key,
  entry_id uuid not null references public.competition_entries(id) on delete cascade,
  validator_id uuid not null references public.profiles(id) on delete cascade,
  vote text not null check (vote in ('approve', 'reject')),
  reason text,
  -- motivo opcional (requerido al rechazar, fomentado)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint competition_validations_unique unique (entry_id, validator_id)
);
-- Prevención de autovalidación mediante disparador (más portable)
create or replace function public.prevent_self_validation() returns trigger language plpgsql security definer
set search_path = '' as $$
declare v_entry_user_id uuid;
begin
select user_id into v_entry_user_id
from public.competition_entries
where id = new.entry_id;
if new.validator_id = v_entry_user_id then raise exception 'Users cannot validate their own competition entries';
end if;
return new;
end;
$$;
create trigger competition_validations_no_self before
insert on public.competition_validations for each row execute function public.prevent_self_validation();
-- Disparador de umbral de aprobación: auto-aprueba/rechaza entrada y crea PR
-- Umbral: voto mayoritario (configurable vía reglas de competición)
create or replace function public.process_validation_vote() returns trigger language plpgsql security definer
set search_path = '' as $$
declare v_entry public.competition_entries %rowtype;
v_competition public.competitions %rowtype;
v_total_votes integer;
v_approvals integer;
v_rejections integer;
v_threshold integer := 3;
-- configurable: podría leer de competition.rules->>'min_votes'
v_new_pr_id uuid;
begin -- Actualizar conteos en la entrada
select count(*) filter (
    where vote = 'approve'
  ),
  count(*) filter (
    where vote = 'reject'
  ) into v_approvals,
  v_rejections
from public.competition_validations
where entry_id = new.entry_id;
update public.competition_entries
set approvals_count = v_approvals,
  rejections_count = v_rejections
where id = new.entry_id;
select * into v_entry
from public.competition_entries
where id = new.entry_id;
select * into v_competition
from public.competitions
where id = v_entry.competition_id;
v_total_votes := v_approvals + v_rejections;
-- Condición de auto-aprobación: 3+ aprobaciones con mayoría
if v_approvals >= v_threshold
and v_approvals > v_rejections
and v_entry.validation_status not in ('approved') then -- Crear PR validado
insert into public.personal_records (
    user_id,
    exercise_id,
    value,
    media_url,
    media_type,
    achieved_on,
    source
  )
values (
    v_entry.user_id,
    v_entry.exercise_id,
    v_entry.pr_value,
    v_entry.video_url,
    'video',
    current_date,
    'validated'
  )
returning id into v_new_pr_id;
update public.competition_entries
set validation_status = 'approved',
  resulting_pr_id = v_new_pr_id
where id = new.entry_id;
-- Condición de auto-rechazo: 3+ rechazos con mayoría
elsif v_rejections >= v_threshold
and v_rejections > v_approvals
and v_entry.validation_status not in ('rejected') then
update public.competition_entries
set validation_status = 'rejected'
where id = new.entry_id;
end if;
return new;
end;
$$;
create trigger competition_validations_process
after
insert on public.competition_validations for each row execute function public.process_validation_vote();
-- Permitir re-envío de entradas rechazadas (resetea votos)
create or replace function public.resubmit_entry(
    p_entry_id uuid,
    p_video_url text,
    p_description text,
    p_pr_value numeric
  ) returns void language plpgsql security definer
set search_path = '' as $$ begin -- Verificar que la entrada pertenece al emisor y está rechazada
  if not exists (
    select 1
    from public.competition_entries
    where id = p_entry_id
      and user_id = (
        select auth.uid()
      )
      and validation_status = 'rejected'
  ) then raise exception 'Entry not found or not in rejected state';
end if;
-- Eliminar votos antiguos
delete from public.competition_validations
where entry_id = p_entry_id;
-- Actualizar entrada
update public.competition_entries
set video_url = p_video_url,
  description = p_description,
  pr_value = p_pr_value,
  validation_status = 'resubmitted',
  approvals_count = 0,
  rejections_count = 0
where id = p_entry_id;
end;
$$;
select audit.enable_audit('public', 'competition_validations');
-- ---------------------------------------------------------------------------
-- RLS: GRUPOS
-- ---------------------------------------------------------------------------
alter table public.groups enable row level security;
alter table public.group_tags enable row level security;
alter table public.group_tag_assignments enable row level security;
alter table public.group_members enable row level security;
alter table public.competitions enable row level security;
alter table public.competition_exercises enable row level security;
alter table public.competition_participants enable row level security;
alter table public.competition_days enable row level security;
alter table public.competition_entries enable row level security;
alter table public.competition_validations enable row level security;
-- Ayuda: ¿es el usuario actual miembro de un grupo?
create or replace function public.is_group_member(p_group_id uuid) returns boolean language sql stable security definer
set search_path = '' as $$
select exists (
    select 1
    from public.group_members
    where group_id = p_group_id
      and user_id = (
        select auth.uid()
      )
      and status = 'active'
  );
$$;
-- GRUPOS
create policy "groups_read" on public.groups for
select to authenticated using (
    is_public = true
    or (
      select public.is_group_member(id)
    )
  );
create policy "groups_create" on public.groups for
insert to authenticated with check (
    (
      select auth.uid()
    ) = owner_id
  );
create policy "groups_update" on public.groups for
update to authenticated using (
    owner_id = (
      select auth.uid()
    )
  ) with check (
    owner_id = (
      select auth.uid()
    )
  );
create policy "groups_admin" on public.groups for all to service_role using (true) with check (true);
-- ETIQUETAS DE GRUPO
create policy "group_tags_read" on public.group_tags for
select to authenticated using (true);
create policy "group_tags_write" on public.group_tags for
insert to authenticated with check (true);
-- ASIGNACIONES DE ETIQUETAS DE GRUPO
create policy "gta_read" on public.group_tag_assignments for
select to authenticated using (true);
create policy "gta_write" on public.group_tag_assignments for all to authenticated using (
  exists (
    select 1
    from public.groups
    where id = group_id
      and owner_id = (
        select auth.uid()
      )
  )
) with check (true);
-- MIEMBROS DE GRUPO
create policy "group_members_read" on public.group_members for
select to authenticated using (
    (
      select public.is_group_member(group_id)
    )
    or user_id = (
      select auth.uid()
    )
  );
create policy "group_members_join" on public.group_members for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "group_members_update" on public.group_members for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
    or exists (
      select 1
      from public.groups
      where id = group_id
        and owner_id = (
          select auth.uid()
        )
    )
  );
-- COMPETICIONES
create policy "competitions_read" on public.competitions for
select to authenticated using (
    (
      select public.is_group_member(group_id)
    )
  );
create policy "competitions_create" on public.competitions for
insert to authenticated with check (
    (
      select auth.uid()
    ) = created_by
    and (
      select public.is_group_member(group_id)
    )
  );
create policy "competitions_update" on public.competitions for
update to authenticated using (
    created_by = (
      select auth.uid()
    )
  );
create policy "competitions_admin" on public.competitions for all to service_role using (true) with check (true);
-- EJERCICIOS DE COMPETICIÓN, DÍAS — legibles por miembros del grupo
create policy "comp_exercises_read" on public.competition_exercises for
select to authenticated using (
    exists (
      select 1
      from public.competitions c
      where c.id = competition_id
        and (
          select public.is_group_member(c.group_id)
        )
    )
  );
create policy "comp_exercises_admin" on public.competition_exercises for all to service_role using (true) with check (true);
create policy "comp_days_read" on public.competition_days for
select to authenticated using (
    exists (
      select 1
      from public.competitions c
      where c.id = competition_id
        and (
          select public.is_group_member(c.group_id)
        )
    )
  );
create policy "comp_days_admin" on public.competition_days for all to service_role using (true) with check (true);
-- PARTICIPANTES DE COMPETICIÓN
create policy "comp_participants_read" on public.competition_participants for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
    or exists (
      select 1
      from public.competitions c
      where c.id = competition_id
        and (
          select public.is_group_member(c.group_id)
        )
    )
  );
create policy "comp_participants_write" on public.competition_participants for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "comp_participants_update" on public.competition_participants for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "comp_participants_admin" on public.competition_participants for all to service_role using (true) with check (true);
-- ENTRADAS DE COMPETICIÓN
create policy "comp_entries_read" on public.competition_entries for
select to authenticated using (
    exists (
      select 1
      from public.competitions c
      where c.id = competition_id
        and (
          select public.is_group_member(c.group_id)
        )
    )
  );
create policy "comp_entries_write" on public.competition_entries for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "comp_entries_update" on public.competition_entries for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
    and validation_status in ('rejected')
  );
create policy "comp_entries_admin" on public.competition_entries for all to service_role using (true) with check (true);
-- VALIDACIONES DE COMPETICIÓN
create policy "comp_validations_read" on public.competition_validations for
select to authenticated using (
    exists (
      select 1
      from public.competition_entries e
        join public.competitions c on c.id = e.competition_id
      where e.id = entry_id
        and (
          select public.is_group_member(c.group_id)
        )
    )
  );
create policy "comp_validations_write" on public.competition_validations for
insert to authenticated with check (
    validator_id = (
      select auth.uid()
    )
  );
create policy "comp_validations_admin" on public.competition_validations for all to service_role using (true) with check (true);
-- ---------------------------------------------------------------------------
-- PERMISOS
-- ---------------------------------------------------------------------------
grant select,
  insert,
  update on public.groups to authenticated;
grant select,
  insert on public.group_tags to authenticated;
grant select,
  insert,
  delete on public.group_tag_assignments to authenticated;
grant select,
  insert,
  update on public.group_members to authenticated;
grant select,
  insert,
  update on public.competitions to authenticated;
grant select on public.competition_exercises to authenticated;
grant select,
  insert,
  update on public.competition_participants to authenticated;
grant select on public.competition_days to authenticated;
grant select,
  insert,
  update on public.competition_entries to authenticated;
grant select,
  insert on public.competition_validations to authenticated;