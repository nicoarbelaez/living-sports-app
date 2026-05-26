import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';

interface VoteBody {
  entry_id: string;
  vote: 'approve' | 'reject';
}

interface CompetitionEntry {
  id: string;
  user_id: string;
  validation_status: string;
  competition_id: string;
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
    const userId = userData.user.id;

    const body: VoteBody = await req.json();
    const entryId = body.entry_id?.trim();
    const vote = body.vote;

    if (!entryId) throw new Error('entry_id es requerido.');
    if (!vote || !['approve', 'reject'].includes(vote))
      throw new Error("vote debe ser 'approve' o 'reject'.");

    // Get entry with competition info
    const { data: entry, error: entryError } = await supabase
      .from('competition_entries')
      .select('id, user_id, validation_status, competition_id')
      .eq('id', entryId)
      .single<CompetitionEntry>();

    if (entryError || !entry) throw new Error('Evidencia no encontrada.');
    if (entry.validation_status !== 'pending')
      throw new Error('Esta evidencia ya no está pendiente de validación.');
    if (entry.user_id === userId)
      throw new Error('No puedes votar tu propia evidencia.');

    // Get group_id from competition
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('group_id')
      .eq('id', entry.competition_id)
      .single<{ group_id: string }>();

    if (compError || !competition) throw new Error('Competencia no encontrada.');

    // Validate user is active member of the group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', competition.group_id)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (memberError || !membership)
      throw new Error('Debes ser miembro activo del grupo para votar.');

    // Check user hasn't already voted
    const { data: existingVote } = await supabase
      .from('competition_validations')
      .select('id')
      .eq('entry_id', entryId)
      .eq('validator_id', userId)
      .maybeSingle();

    if (existingVote) throw new Error('Ya votaste esta evidencia.');

    // Insert vote
    const { error: voteError } = await supabase.from('competition_validations').insert({
      entry_id: entryId,
      validator_id: userId,
      vote,
    });

    if (voteError) throw new Error(voteError.message ?? 'No se pudo registrar el voto.');

    return jsonResponse({ message: 'Voto registrado exitosamente.', entry_id: entryId });
  } catch (error) {
    return errorResponse(error);
  }
}

Deno.serve(handler);
