import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';

Deno.serve(async (req) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get('Authorization');
    const token = extractBearerToken(authHeader);
    const supabase = createSupabaseClient(authHeader!);

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) throw new Error('Usuario no autenticado.');
    const userId = userData.user.id;

    const q = new URL(req.url).searchParams.get('q') ?? '';

    const { data: users, error: searchError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${q}%`)
      .neq('id', userId)
      .limit(20);

    if (searchError) throw new Error(searchError.message ?? 'Error al buscar usuarios.');

    return jsonResponse({ users: users ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
});
