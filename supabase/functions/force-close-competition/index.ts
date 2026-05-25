import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';

interface ForceCloseBody {
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

    const body: ForceCloseBody = await req.json();
    const competitionId = body.competition_id?.trim();
    if (!competitionId) throw new Error('competition_id es requerido.');

    const { data: competition, error: compError } = await client
      .from('competitions')
      .select('id, group_id')
      .eq('id', competitionId)
      .single();

    if (compError || !competition) throw new Error('Competencia no encontrada.');

    const { data: group, error: groupError } = await client
      .from('groups')
      .select('id, owner_id')
      .eq('id', competition.group_id)
      .single();

    if (groupError || !group) throw new Error('Grupo no encontrado.');
    if (group.owner_id !== userId)
      throw new Error('Solo el dueno del grupo puede cerrar la competencia.');

    const { error: rpcError } = await client.rpc('close_competition', {
      p_competition_id: competitionId,
    });

    if (rpcError) throw new Error(rpcError.message);

    return jsonResponse({ message: 'Competencia cerrada.' });
  } catch (error) {
    return errorResponse(error);
  }
}

Deno.serve(handler);
