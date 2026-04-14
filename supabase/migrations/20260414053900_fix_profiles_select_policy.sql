-- Migration: fix_profiles_select_policy
-- Description: Allows users to view their own profile, any public profile, and grants full read access to admin/support roles.

-- First, drop the previous restrictive policy if it exists
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
-- Also drop the support-only policy to consolidate if desired, or just let them coexist. 
DROP POLICY IF EXISTS "profiles_support_read" ON public.profiles;

CREATE POLICY "profiles_select_all_authenticated" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id 
  OR is_public = true 
  OR public.has_role('support') 
  OR public.has_role('admin')
);
