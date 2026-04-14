import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/profile';

/**
 * Pure fetch — no hooks, no side effects.
 * Callers (store actions, sync hook) decide what to do with the result.
 * Throws on network/DB error so callers can handle gracefully.
 */
export async function fetchProfileFromAPI(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (error) {
    throw new Error(`[Profile] Fetch failed: ${error.message}`);
  }

  return data;
}
