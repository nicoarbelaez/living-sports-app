import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';

interface DeleteRoutineDayBody {
  day_of_week: number;
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

    const body: DeleteRoutineDayBody = await req.json();
    const { day_of_week } = body;

    if (day_of_week === undefined || day_of_week === null || day_of_week < 0 || day_of_week > 6)
      throw new Error('day_of_week debe ser un número entre 0 y 6.');

    const { error: deleteError } = await supabase
      .from('routines')
      .delete()
      .eq('user_id', userId)
      .eq('day_of_week', day_of_week);

    if (deleteError) throw new Error(deleteError.message ?? 'No se pudo eliminar el día de rutina.');

    return jsonResponse({ message: 'Día de rutina eliminado exitosamente.' });
  } catch (error) {
    return errorResponse(error);
  }
});
