import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';
import { uploadMedia } from '../_shared/cloudinary.ts';

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
    const competitionId = formData.get('competition_id')?.toString()?.trim();
    const exerciseId = formData.get('exercise_id')?.toString()?.trim();
    const prValueRaw = formData.get('pr_value')?.toString()?.trim();
    const description = (formData.get('description')?.toString() ?? '').trim() || null;
    const files = formData.getAll('file').filter((v): v is File => v instanceof File);

    if (!competitionId) throw new Error('competition_id es requerido.');
    if (!exerciseId) throw new Error('exercise_id es requerido.');
    if (!prValueRaw || isNaN(Number(prValueRaw)) || Number(prValueRaw) <= 0)
      throw new Error('pr_value debe ser un número mayor a 0.');
    if (files.length === 0) throw new Error('Se requiere un video como evidencia.');

    const prValue = Number(prValueRaw);
    const today = new Date().toISOString().split('T')[0];

    // Buscar el día activo de hoy para esta competición
    const { data: dayRow, error: dayError } = await supabase
      .from('competition_days')
      .select('id')
      .eq('competition_id', competitionId)
      .eq('day_date', today)
      .eq('is_active', true)
      .single();

    if (dayError || !dayRow) {
      throw new Error('No hay un día activo hoy para esta competición.');
    }

    // Verificar que no exista ya una evidencia del usuario hoy
    const { data: existing } = await supabase
      .from('competition_entries')
      .select('id')
      .eq('competition_day_id', dayRow.id)
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .maybeSingle();

    if (existing) throw new Error('Ya enviaste una evidencia hoy para este ejercicio.');

    // Subir video a Cloudinary
    const [media] = await uploadMedia(
      files,
      `competitions/${competitionId}/entries/${userId}`,
      'post'
    );

    // Insertar evidencia
    const { data: entry, error: entryError } = await supabase
      .from('competition_entries')
      .insert({
        competition_day_id: dayRow.id,
        competition_id: competitionId,
        exercise_id: exerciseId,
        user_id: userId,
        video_url: media.url,
        pr_value: prValue,
        description,
        validation_status: 'pending',
      })
      .select()
      .single();

    if (entryError || !entry) {
      throw new Error(entryError?.message ?? 'No se pudo registrar la evidencia.');
    }

    return jsonResponse({
      message: 'Evidencia enviada exitosamente.',
      entry,
    });
  } catch (error) {
    return errorResponse(error);
  }
});
