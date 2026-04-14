-- Migration: Update profile visibility logic
-- Description: Drops the temporary broad select policy and updates the core visibility function to include follower checks.

-- 1. Drop the temporary policy created in previous fix
DROP POLICY IF EXISTS "profiles_select_all_authenticated" ON public.profiles;

-- 2. Update the visibility function with the new logic (including follows)
CREATE OR REPLACE FUNCTION public.can_view_full_profile(p_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public AS $$
SELECT
  auth.uid() = p_profile_id
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = p_profile_id AND p.is_public = true
  )
  OR EXISTS (
    SELECT 1 FROM public.follows f
    WHERE f.following_id = p_profile_id
      AND f.follower_id = auth.uid()
      AND f.status = 'accepted'
  )
  OR public.has_role('admin');
$$;

-- 3. Ensure the profiles table HAS a policy that uses this function.
-- If "profiles_read" already exists, this is redundant but safe to ensure it's active.
DROP POLICY IF EXISTS "profiles_read" ON public.profiles;
CREATE POLICY "profiles_read" ON public.profiles
FOR SELECT TO authenticated
USING (public.can_view_full_profile(id));
