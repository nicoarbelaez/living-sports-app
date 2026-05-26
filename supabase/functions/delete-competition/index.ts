import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';

interface DeleteBody {
  competition_id: string;
}

export async function handler(req: Request): Promise<Response> {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get('Authorization');
    const token = extractBearerToken(authHeader);
    const client = createSupabaseClient(authHeader!);

    const { data: userData, error: userError } = await client.auth.getUser(token);
    if (userError || !userData?.user) throw new Error('Usuario no autenticado.');
    const userId = userData.user.id;

    const body: DeleteBody = await req.json();
    const competitionId = body.competition_id?.trim();
    if (!competitionId) throw new Error('competition_id es requerido.');

    const { data: competition, error: compError } = await client
      .from('competitions')
      .select('id, created_by')
      .eq('id', competitionId)
      .single();

    if (compError || !competition) throw new Error('Competicion no encontrada.');
    if (competition.created_by !== userId)
      throw new Error('Solo el creador puede eliminar esta competicion.');

    const { error: deleteError } = await client
      .from('competitions')
      .delete()
      .eq('id', competitionId);

    if (deleteError) throw new Error(deleteError.message);

    return jsonResponse({ message: 'Competicion eliminada.' });
  } catch (error) {
    return errorResponse(error);
  }
}

Deno.serve(handler);
