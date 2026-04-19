import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

/**
 * Creates a Supabase client scoped to the requesting user via their Bearer token.
 * RLS policies apply — this client cannot bypass row-level security.
 */
export function createSupabaseClient(authHeader: string): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan SUPABASE_URL o SUPABASE_ANON_KEY en las variables de entorno.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Extracts and validates the Bearer token from the Authorization header.
 * Throws if missing or malformed.
 */
export function extractBearerToken(authHeader: string | null): string {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Falta el header Authorization con Bearer token.');
  }
  return authHeader.replace('Bearer ', '').trim();
}
