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

interface UpsertRoutineDayBody {
  day_of_week: number;
  title: string;
  description?: string;
  duration_sec?: number;
  is_rest: boolean;
  exercises: RoutineExercise[];
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

    const body: UpsertRoutineDayBody = await req.json();
    const { day_of_week, title, description, duration_sec, is_rest, exercises } = body;

    if (day_of_week === undefined || day_of_week === null || day_of_week < 0 || day_of_week > 6)
      throw new Error('day_of_week debe ser un número entre 0 y 6.');
    if (!title?.trim()) throw new Error('title es requerido.');

    // Upsert routine
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .upsert(
        {
          user_id: userId,
          day_of_week,
          title: title.trim(),
          description: description?.trim() ?? null,
          duration_sec: duration_sec ?? null,
          is_rest,
        },
        { onConflict: 'user_id,day_of_week' }
      )
      .select()
      .single();

    if (routineError || !routine) {
      throw new Error(routineError?.message ?? 'No se pudo guardar la rutina.');
    }

    // Delete existing exercises for this routine
    const { error: deleteError } = await supabase
      .from('routine_exercises')
      .delete()
      .eq('routine_id', routine.id);

    if (deleteError) throw new Error(deleteError.message ?? 'Error al limpiar ejercicios anteriores.');

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
      if (insertError) throw new Error(insertError.message ?? 'Error al guardar los ejercicios.');
    }

    return jsonResponse({ routine });
  } catch (error) {
    return errorResponse(error);
  }
});
