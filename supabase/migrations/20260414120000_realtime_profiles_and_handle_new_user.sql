-- =============================================================================
-- MIGRACIÓN: Realtime en profiles + mejora de handle_new_user
-- 1. Activa publicación Realtime para public.profiles
-- 2. Actualiza handle_new_user para extraer name/avatar_url de OAuth metadata
-- =============================================================================
-- ---------------------------------------------------------------------------
-- 1. REALTIME
-- ---------------------------------------------------------------------------
alter publication supabase_realtime
add table public.profiles;
-- ---------------------------------------------------------------------------
-- 2. HANDLE NEW USER — soporte para name (OAuth genérico), given_name/family_name
--    (Google/Apple), y avatar_url / picture
--
--    Precedencia de nombre:
--      given_name  → first_name (Google/Apple explícito)
--      name        → split por primer espacio: izquierda=first, derecha=last
--      email prefix → fallback final
--
--    Precedencia de avatar:
--      avatar_url → picture → NULL
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger language plpgsql security definer
set search_path = '' as $$
declare v_raw jsonb := new.raw_user_meta_data;
v_full_name text := trim(v_raw->>'name');
v_first_name text;
v_last_name text;
v_avatar_url text;
begin -- Resolver first_name / last_name
if (v_raw->>'given_name') is not null then -- Google / Apple proporcionan campos separados
v_first_name := trim(v_raw->>'given_name');
v_last_name := coalesce(trim(v_raw->>'family_name'), '');
elsif v_full_name is not null
and v_full_name <> '' then -- Nombre completo genérico: split por el primer espacio
v_first_name := split_part(v_full_name, ' ', 1);
-- Todo lo que queda después del primer token es el apellido
v_last_name := trim(
  substring(
    v_full_name
    from length(split_part(v_full_name, ' ', 1)) + 2
  )
);
else -- Último recurso: prefijo del email
v_first_name := split_part(new.email, '@', 1);
v_last_name := '';
end if;
-- Resolver avatar_url (Google usa "picture", otros pueden usar "avatar_url")
v_avatar_url := coalesce(
  nullif(trim(v_raw->>'avatar_url'), ''),
  nullif(trim(v_raw->>'picture'), '')
);
insert into public.profiles (
    id,
    username,
    first_name,
    last_name,
    avatar_url,
    date_of_birth,
    sex
  )
values (
    new.id,
    lower(split_part(new.email, '@', 1)) || '_' || substr(gen_random_uuid()::text, 1, 6),
    v_first_name,
    v_last_name,
    v_avatar_url,
    '2000-01-01'::date,
    'prefer_not_to_say'
  );
return new;
end;
$$;