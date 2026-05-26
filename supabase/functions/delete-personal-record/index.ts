import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';

interface DeleteRecordBody {
  record_id: string;
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

    const body: DeleteRecordBody = await req.json();
    const recordId = body.record_id?.trim();
    if (!recordId) throw new Error('record_id es requerido.');

    // Verify ownership
    const { data: record, error: checkError } = await supabase
      .from('personal_records')
      .select('id')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (checkError || !record) throw new Error('Récord no encontrado o no te pertenece.');

    const { error: deleteError } = await supabase
      .from('personal_records')
      .delete()
      .eq('id', recordId);

    if (deleteError) throw new Error(deleteError.message ?? 'No se pudo eliminar el récord.');

    return jsonResponse({ message: 'Récord personal eliminado exitosamente.' });
  } catch (error) {
    return errorResponse(error);
  }
});
