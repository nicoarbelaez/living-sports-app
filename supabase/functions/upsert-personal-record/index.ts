import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';

interface UpsertRecordBody {
  exercise_id: string;
  value: number;
  notes?: string;
  media_url?: string;
  media_type?: string;
  achieved_on: string;
  is_featured: boolean;
  description?: string;
  record_id?: string;
}

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

    const body: UpsertRecordBody = await req.json();
    const {
      exercise_id,
      value,
      notes,
      media_url,
      media_type,
      achieved_on,
      is_featured,
      description,
      record_id,
    } = body;

    if (!exercise_id) throw new Error('exercise_id es requerido.');
    if (value === undefined || value === null || isNaN(value) || value <= 0)
      throw new Error('value debe ser un número mayor a 0.');
    if (!achieved_on) throw new Error('achieved_on es requerido.');

    // Validate featured count limit
    if (is_featured) {
      let query = supabase
        .from('personal_records')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_featured', true);

      if (record_id) {
        query = query.neq('id', record_id);
      }

      const { count } = await query;
      if ((count ?? 0) >= 3) throw new Error('Solo puedes tener 3 récords destacados.');
    }

    let record;
    let recordError;

    if (record_id) {
      // Verify ownership before update
      const { data: existing, error: checkError } = await supabase
        .from('personal_records')
        .select('id')
        .eq('id', record_id)
        .eq('user_id', userId)
        .single();

      if (checkError || !existing) throw new Error('Récord no encontrado o no te pertenece.');

      const result = await supabase
        .from('personal_records')
        .update({
          exercise_id,
          value,
          notes: notes ?? null,
          media_url: media_url ?? null,
          media_type: media_type ?? null,
          achieved_on,
          is_featured,
          description: description ?? null,
        })
        .eq('id', record_id)
        .select()
        .single();

      record = result.data;
      recordError = result.error;
    } else {
      const result = await supabase
        .from('personal_records')
        .insert({
          user_id: userId,
          exercise_id,
          value,
          notes: notes ?? null,
          media_url: media_url ?? null,
          media_type: media_type ?? null,
          achieved_on,
          is_featured,
          description: description ?? null,
          source: 'self',
        })
        .select()
        .single();

      record = result.data;
      recordError = result.error;
    }

    if (recordError || !record) {
      throw new Error(recordError?.message ?? 'No se pudo guardar el récord personal.');
    }

    return jsonResponse({ record });
  } catch (error) {
    return errorResponse(error);
  }
});
