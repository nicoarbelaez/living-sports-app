-- Migration: Add select policy for profiles
-- Description: Allows authenticated users to view their own profile data.
CREATE POLICY "Users can view their own profile" ON public.profiles FOR
SELECT TO authenticated USING (auth.uid() = id);