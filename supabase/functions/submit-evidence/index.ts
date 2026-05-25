import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { authenticateUser } from '../_shared/auth.ts';
import { uploadMedia } from '../_shared/cloudinary.ts';

Deno.serve(async (req) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  console.log('[submit-evidence] Incoming request:', {
    method: req.method,
    url: req.url,
  });

  try {
    const { userId, supabase } = await authenticateUser(req.headers.get('Authorization'));

    const formData = await req.formData();

    const competitionId = formData.get('competition_id')?.toString().trim();
    const exerciseId = formData.get('exercise_id')?.toString().trim();
    const prValueRaw = formData.get('pr_value')?.toString().trim();
    const description = formData.get('description')?.toString().trim() || null;

    const file = formData.get('file');

    if (!competitionId || !exerciseId) {
      throw new Error('Missing required identifiers');
    }

    if (!prValueRaw || Number.isNaN(Number(prValueRaw))) {
      throw new Error('Invalid PR value');
    }

    if (!(file instanceof File)) {
      throw new Error('Video file is required');
    }

    const prValue = Number(prValueRaw);
    const today = new Date().toISOString().split('T')[0];

    console.log('[submit-evidence] Payload OK:', {
      competitionId,
      exerciseId,
      prValue,
      hasFile: true,
    });

    const { data: dayRow, error: dayError } = await supabase
      .from('competition_days')
      .select('id')
      .eq('competition_id', competitionId)
      .eq('day_date', today)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (dayError || !dayRow) {
      throw new Error('No hay un día activo hoy para esta competición.');
    }

    const [media] = await uploadMedia([file], `competitions/${competitionId}/evidence`, 'post');

    const { data, error } = await supabase
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
        attempt_number: 1,
        day_date: today,
      })
      .select()
      .single();

    if (error) {
      console.error('[submit-evidence] DB error:', error);
      throw new Error('Failed to insert entry');
    }

    return jsonResponse({
      message: 'Evidence submitted successfully',
      entry: data,
    });
  } catch (error) {
    console.error('[submit-evidence] ERROR:', error);
    return errorResponse(error);
  }
});
