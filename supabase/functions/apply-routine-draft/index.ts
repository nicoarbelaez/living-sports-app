import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';

interface RoutineExercise {
  exercise_id: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  sort_order: number;
}

interface RoutineDay {
  day_of_week: number;
  title: string;
  description?: string;
  duration_sec?: number;
  is_rest: boolean;
  exercises: RoutineExercise[];
}

interface ApplyDraftBody {
  draft_id: string;
  days: RoutineDay[];
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

    const body: ApplyDraftBody = await req.json();
    const { draft_id, days } = body;

    if (!draft_id?.trim()) throw new Error('draft_id es requerido.');
    if (!days || !Array.isArray(days) || days.length === 0)
      throw new Error('days es requerido y no puede estar vacío.');

    // Verify draft belongs to user
    const { data: draft, error: draftError } = await supabase
      .from('ai_routine_drafts')
      .select('id')
      .eq('id', draft_id)
      .eq('user_id', userId)
      .single<{ id: string }>();

    if (draftError || !draft) throw new Error('Borrador no encontrado o no te pertenece.');

    // Apply each day: upsert routine + replace exercises
    for (const day of days) {
      const { day_of_week, title, description, duration_sec, is_rest, exercises } = day;

      if (day_of_week === undefined || day_of_week === null || day_of_week < 0 || day_of_week > 6)
        throw new Error(`day_of_week inválido: ${day_of_week}.`);

      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .upsert(
          {
            user_id: userId,
            day_of_week,
            title: title?.trim() ?? '',
            description: description?.trim() ?? null,
            duration_sec: duration_sec ?? null,
            is_rest,
          },
          { onConflict: 'user_id,day_of_week' }
        )
        .select()
        .single<{ id: string }>();

      if (routineError || !routine) {
        throw new Error(routineError?.message ?? `No se pudo guardar el día ${day_of_week}.`);
      }

      // Delete existing exercises
      const { error: deleteError } = await supabase
        .from('routine_exercises')
        .delete()
        .eq('routine_id', routine.id);

      if (deleteError)
        throw new Error(deleteError.message ?? `Error al limpiar ejercicios del día ${day_of_week}.`);

      // Insert new exercises
      if (!is_rest && exercises?.length > 0) {
        const exerciseRows = exercises.map((ex) => ({
          routine_id: routine.id,
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          sort_order: ex.sort_order,
        }));

        const { error: insertError } = await supabase.from('routine_exercises').insert(exerciseRows);
        if (insertError)
          throw new Error(insertError.message ?? `Error al insertar ejercicios del día ${day_of_week}.`);
      }
    }

    // Mark draft as applied
    await supabase
      .from('ai_routine_drafts')
      .update({ applied_at: new Date().toISOString() })
      .eq('id', draft_id);

    return jsonResponse({ message: 'Rutina aplicada exitosamente.' });
  } catch (error) {
    return errorResponse(error);
  }
});
