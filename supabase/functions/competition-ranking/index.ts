import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';

interface RankingRow {
  position: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_points: number;
}

export async function handler(req: Request): Promise<Response> {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get('Authorization');
    const token = extractBearerToken(authHeader);
    const supabase = createSupabaseClient(authHeader!);

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) throw new Error('Usuario no autenticado.');

    const params = new URL(req.url).searchParams;
    const type = params.get('type') ?? '';
    const groupId = params.get('group_id') ?? '';
    const competitionId = params.get('competition_id') ?? '';

    if (!['competition', 'weekly', 'total'].includes(type))
      throw new Error("type debe ser 'competition', 'weekly' o 'total'.");

    let ranking: RankingRow[] = [];

    if (type === 'competition') {
      if (!competitionId) throw new Error('competition_id es requerido para type=competition.');

      const { data, error } = await supabase
        .from('v_competition_ranking')
        .select('position, user_id, username, avatar_url, total_points')
        .eq('competition_id', competitionId)
        .order('position', { ascending: true });

      if (error) throw new Error(error.message ?? 'Error al obtener el ranking de la competencia.');
      ranking = (data ?? []) as RankingRow[];
    } else if (type === 'total') {
      if (!groupId) throw new Error('group_id es requerido para type=total.');

      const { data, error } = await supabase
        .from('v_group_ranking_total')
        .select('position, user_id, username, avatar_url, total_points')
        .eq('group_id', groupId)
        .order('position', { ascending: true });

      if (error) throw new Error(error.message ?? 'Error al obtener el ranking total.');
      ranking = (data ?? []) as RankingRow[];
    } else if (type === 'weekly') {
      if (!groupId) throw new Error('group_id es requerido para type=weekly.');

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('v_group_ranking_total')
        .select('position, user_id, username, avatar_url, total_points')
        .eq('group_id', groupId)
        .gte('last_entry_at', sevenDaysAgo)
        .order('position', { ascending: true });

      if (error) throw new Error(error.message ?? 'Error al obtener el ranking semanal.');
      ranking = (data ?? []) as RankingRow[];
    }

    return jsonResponse({ ranking });
  } catch (error) {
    return errorResponse(error);
  }
}

Deno.serve(handler);
