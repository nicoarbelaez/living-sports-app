import { type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { createSupabaseClient, extractBearerToken } from './supabase-client.ts';

interface AuthResult {
  userId: string;
  supabase: SupabaseClient;
}

interface AuthenticateUserOptions {
  request?: Request;
}

export async function authenticateUser(
  authHeader: string | null,
  options?: AuthenticateUserOptions
): Promise<AuthResult> {
  const token = extractBearerToken(authHeader);

  const supabase = createSupabaseClient(authHeader ?? undefined);

  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData?.user) {
    const request = options?.request;
    const endpoint = request?.headers.get('referer') ?? request?.headers.get('origin') ?? 'unknown';
    const method = request?.method ?? 'unknown';
    const userAgent = request?.headers.get('user-agent') ?? 'unknown';

    console.error('[AUTHENTICATION_ERROR]', {
      endpoint,
      method,
      userAgent,
      error: userError?.message ?? 'User not found',
      timestamp: new Date().toISOString(),
    });

    throw new Error('Usuario no autenticado.');
  }

  return {
    userId: userData.user.id,
    supabase,
  };
}
