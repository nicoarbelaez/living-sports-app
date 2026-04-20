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

    const formData = await req.formData();
    const groupId = formData.get('group_id')?.toString()?.trim();
    const title = (formData.get('title')?.toString() ?? '').trim();
    const description = (formData.get('description')?.toString() ?? '').trim() || null;
    const exerciseId = formData.get('exercise_id')?.toString()?.trim();
    const startDate = formData.get('start_date')?.toString()?.trim();
    const endDate = formData.get('end_date')?.toString()?.trim();

    if (!groupId) throw new Error('group_id es requerido.');
    if (!title || title.length < 3) throw new Error('El título debe tener al menos 3 caracteres.');
    if (!exerciseId) throw new Error('exercise_id es requerido.');
    if (!startDate || !endDate) throw new Error('start_date y end_date son requeridos.');
    if (endDate < startDate) throw new Error('end_date debe ser mayor o igual a start_date.');

    const { data: competition, error: insertError } = await supabase
      .from('competitions')
      .insert({
        group_id: groupId,
        created_by: userId,
        title,
        description,
        exercise_id: exerciseId,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        participant_scope: 'all',
      })
      .select('*, exercises(name)')
      .single();

    if (insertError || !competition) {
      throw new Error(insertError?.message ?? 'No se pudo crear la competición.');
    }

    return jsonResponse({
      message: 'Competición creada exitosamente.',
      competition,
    });
  } catch (error) {
    console.log(error)
    return errorResponse(error);
  }
});
