-- Migration: Grant full permissions on profiles table to authenticated users
-- Description: Allows authenticated users to perform SELECT, INSERT, UPDATE, and DELETE operations. 
--             Note: RLS policies will still control which specific rows a user can access.

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.profiles
TO authenticated;
