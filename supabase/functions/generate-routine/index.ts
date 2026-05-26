import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { authenticateUser } from '../_shared/auth.ts';

interface GenerateRoutineBody {
  goals: string[];
  level: string;
  daysPerWeek: number;
  equipment: string[];
  prompt?: string;
}

interface ExerciseCatalog {
  id: string;
  name: string;
}

interface RoutineExerciseAI {
  exercise_name: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  exercise_id?: string | null;
  sort_order?: number;
}

interface RoutineDayAI {
  day_of_week: number;
  title: string;
  is_rest: boolean;
  description: string;
  duration_sec: number;
  exercises: RoutineExerciseAI[];
}

interface AIRoutinePayload {
  days: RoutineDayAI[];
}

const MAX_ATTEMPTS = 5;
const OPENROUTER_MODEL = 'openrouter/free';

function normalizeLookupKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim();
  }

  return trimmed;
}

function toTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toSafeInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const int = Math.trunc(value);
  return Number.isInteger(int) ? int : null;
}

function buildSystemPrompt(
  exercises: ExerciseCatalog[],
  profile: { bio: string | null; first_name: string | null } | null,
  daysPerWeek: number
): string {
  const availableExercises =
    exercises
      .map((e) => e.name)
      .filter(Boolean)
      .join(', ') || 'none';

  return `
You are a fitness coach.

Return ONLY raw JSON. No markdown. No code fences. No explanations. No comments.
The JSON must match exactly this shape:

{
  "days": [
    {
      "day_of_week": 0,
      "title": "string",
      "is_rest": false,
      "description": "string",
      "duration_sec": 3600,
      "exercises": [
        {
          "exercise_name": "string",
          "sets": 3,
          "reps": 12,
          "rest_seconds": 60
        }
      ]
    }
  ]
}

Rules:
- day_of_week must be an integer from 0 to 6.
- 0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday, 5 = Saturday, 6 = Sunday.
- Generate max 7 days.
- Exactly ${daysPerWeek} days must have is_rest = false.
- The remaining days must have is_rest = true.
- Every non-rest day must contain between 3 and 6 exercises.
- Rest days must have exercises as an empty array.
- Use only the provided exercise names when possible.
- Keep titles short and descriptive.
- Keep descriptions short and practical.
- Prefer exercises that match the user's equipment and goals.

Available exercises:
${availableExercises}

User:
- Name: ${profile?.first_name ?? 'User'}
- Bio: ${profile?.bio ?? 'none'}
`.trim();
}

function buildUserMessage(params: {
  goals: string[];
  level: string;
  daysPerWeek: number;
  equipment: string[];
  prompt?: string;
}): string {
  const { goals, level, daysPerWeek, equipment, prompt } = params;

  return `
Goals: ${goals.join(', ')}
Level: ${level}
Days/week: ${daysPerWeek}
Equipment: ${equipment.join(', ')}

Extra instructions:
${prompt?.trim() || 'none'}

Important:
- Build a weekly routine with exactly ${daysPerWeek} training days.
- Each training day must include several exercises, ideally 3 to 6.
- Rest days must have no exercises.
`.trim();
}

async function callOpenRouter(
  openrouterKey: string,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'Living Sports',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.2,
        max_tokens: 4000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    const llmData = await response.json();

    console.log(
      `[generate-routine] Intento ${attempt}/${MAX_ATTEMPTS} — status: ${response.status}`
    );

    if (!response.ok) {
      console.error(
        `[generate-routine] OpenRouter error intento ${attempt}:`,
        JSON.stringify(llmData)
      );

      if (response.status === 429) {
        const retryAfterSec: number = llmData?.error?.metadata?.retry_after_seconds ?? attempt * 10;

        const waitMs = Math.ceil(retryAfterSec * 1000) + 500;

        if (attempt < MAX_ATTEMPTS) {
          console.log(`[generate-routine] Rate limited. Reintentando en ${retryAfterSec}s...`);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }

        throw new Error(`Rate limited después de ${MAX_ATTEMPTS} intentos.`);
      }

      throw new Error(llmData?.error?.message ?? `OpenRouter error ${response.status}`);
    }

    const content = llmData?.choices?.[0]?.message?.content ?? null;

    if (!content) {
      lastError = llmData;
      console.error(
        `[generate-routine] Sin contenido en intento ${attempt}:`,
        JSON.stringify(llmData)
      );

      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, attempt * 5_000));
        continue;
      }

      throw new Error('No response from AI después de varios intentos.');
    }

    return content;
  }

  throw new Error(`No response from AI. Último error: ${JSON.stringify(lastError)}`);
}

function parseAIRoutine(content: string): AIRoutinePayload {
  const cleanContent = stripCodeFences(content);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanContent);
  } catch {
    console.error('[generate-routine] JSON inválido recibido:', cleanContent);
    throw new Error('La IA devolvió JSON inválido.');
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('days' in parsed) ||
    !Array.isArray((parsed as { days: unknown }).days)
  ) {
    throw new Error('Invalid AI response format.');
  }

  const payload = parsed as AIRoutinePayload;

  // if (payload.days.length !== 7) {
  //   throw new Error(`La IA debe devolver exactamente 7 días. Recibidos: ${payload.days.length}.`);
  // }

  return payload;
}

function validateAndOrderDays(days: RoutineDayAI[], daysPerWeek: number): RoutineDayAI[] {
  const seen = new Set<number>();

  for (const day of days) {
    const dayOfWeek = toSafeInt(day.day_of_week);

    if (dayOfWeek === null || dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error(`day_of_week inválido: ${JSON.stringify(day.day_of_week)}.`);
    }

    if (seen.has(dayOfWeek)) {
      throw new Error(`day_of_week duplicado: ${dayOfWeek}.`);
    }

    seen.add(dayOfWeek);
  }

  if (seen.size !== 7) {
    throw new Error(`La IA debe devolver 7 días únicos. Recibidos: ${seen.size}.`);
  }

  const activeDays = days.filter((d) => !d.is_rest);
  if (activeDays.length !== daysPerWeek) {
    throw new Error(
      `La rutina debe tener exactamente ${daysPerWeek} días activos. Recibidos: ${activeDays.length}.`
    );
  }

  for (const day of activeDays) {
    const exercises = Array.isArray(day.exercises) ? day.exercises : [];
    if (exercises.length < 3) {
      throw new Error(
        `El día ${day.day_of_week} debe tener al menos 3 ejercicios. Recibidos: ${exercises.length}.`
      );
    }
    if (exercises.length > 6) {
      throw new Error(
        `El día ${day.day_of_week} no debe exceder 6 ejercicios. Recibidos: ${exercises.length}.`
      );
    }
  }

  return [...days].sort((a, b) => a.day_of_week - b.day_of_week);
}

Deno.serve(async (req) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get('Authorization');
    const { userId, supabase } = await authenticateUser(authHeader, {
      request: req,
    });

    console.log('[generate-routine] Auth OK, userId:', userId);

    const body: GenerateRoutineBody = await req.json();
    const { goals, level, daysPerWeek, equipment, prompt } = body;

    console.log('[generate-routine] Body recibido:', {
      goals,
      level,
      daysPerWeek,
      equipment,
      hasPrompt: !!prompt,
    });

    if (!Array.isArray(goals) || goals.length === 0) {
      throw new Error('goals es requerido.');
    }

    if (typeof level !== 'string' || !level.trim()) {
      throw new Error('level es requerido.');
    }

    if (
      typeof daysPerWeek !== 'number' ||
      !Number.isInteger(daysPerWeek) ||
      daysPerWeek < 1 ||
      daysPerWeek > 7
    ) {
      throw new Error('daysPerWeek debe estar entre 1 y 7.');
    }

    if (!Array.isArray(equipment) || equipment.length === 0) {
      throw new Error('equipment es requerido.');
    }

    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openrouterKey) throw new Error('OpenRouter key not configured.');

    const [profileResult, exercisesResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('bio, first_name')
        .eq('id', userId)
        .single<{ bio: string | null; first_name: string | null }>(),

      supabase.from('exercises').select('id, name').returns<ExerciseCatalog[]>(),
    ]);

    if (profileResult.error) throw profileResult.error;
    if (exercisesResult.error) throw exercisesResult.error;

    const profile = profileResult.data ?? null;
    const exercises = exercisesResult.data ?? [];

    console.log('[generate-routine] Ejercicios disponibles:', exercises.length);

    const systemPrompt = buildSystemPrompt(exercises, profile, daysPerWeek);
    const userMessage = buildUserMessage({
      goals,
      level,
      daysPerWeek,
      equipment,
      prompt,
    });

    console.log('[generate-routine] Llamando a OpenRouter (hasta 5 intentos)...');

    const content = await callOpenRouter(openrouterKey, systemPrompt, userMessage);

    console.log('[generate-routine] Respuesta IA recibida, parseando JSON...');

    const parsed = parseAIRoutine(content);
    const orderedDays = validateAndOrderDays(parsed.days, daysPerWeek);

    console.log('[generate-routine] Días generados:', orderedDays.length);

    const exerciseMap = new Map(exercises.map((e) => [normalizeLookupKey(e.name), e.id]));

    const routineRows: Array<{
      user_id: string;
      day_of_week: number;
      name: string;
      title: string;
      description: string | null;
      duration_sec: number | null;
      is_rest: boolean;
    }> = [];

    const routineExercisesByDay: Array<{
      day_of_week: number;
      rows: Array<{
        exercise_id: string;
        sets: number;
        reps: number | null;
        rest_seconds: number | null;
        sort_order: number;
      }>;
    }> = [];

    for (const day of orderedDays) {
      const dayOfWeek = toSafeInt(day.day_of_week);

      if (dayOfWeek === null || dayOfWeek < 0 || dayOfWeek > 6) {
        throw new Error(`day_of_week inválido: ${JSON.stringify(day.day_of_week)}.`);
      }

      const title = toTrimmedString(day.title) ?? `Día ${dayOfWeek + 1}`;
      const description = toTrimmedString(day.description);
      const isRest = Boolean(day.is_rest);
      const dayExercises = Array.isArray(day.exercises) ? day.exercises : [];

      const rawDuration = toSafeInt(day.duration_sec);

      const durationSec = isRest
        ? null
        : rawDuration !== null && rawDuration >= 1 && rawDuration <= 86400
          ? rawDuration
          : 3600;

      routineRows.push({
        user_id: userId,
        day_of_week: dayOfWeek,
        name: title,
        title,
        description,
        duration_sec: durationSec,
        is_rest: isRest,
      });

      if (isRest) {
        routineExercisesByDay.push({ day_of_week: dayOfWeek, rows: [] });
        continue;
      }

      const mappedRows = dayExercises
        .map((ex, index) => {
          const exerciseName = toTrimmedString(ex.exercise_name);
          if (!exerciseName) return null;

          const exerciseId = exerciseMap.get(normalizeLookupKey(exerciseName));
          if (!exerciseId) return null;

          const sets = toSafeInt(ex.sets);
          if (sets === null || sets < 1) return null;

          const reps = toSafeInt(ex.reps);
          const restSeconds = toSafeInt(ex.rest_seconds);

          return {
            exercise_id: exerciseId,
            sets,
            reps: reps !== null && reps >= 0 ? reps : null,
            rest_seconds: restSeconds !== null && restSeconds >= 0 ? restSeconds : null,
            sort_order: index,
          };
        })
        .filter(
          (
            row
          ): row is {
            exercise_id: string;
            sets: number;
            reps: number | null;
            rest_seconds: number | null;
            sort_order: number;
          } => row !== null
        );

      if (mappedRows.length < 3) {
        throw new Error(
          `El día ${dayOfWeek} debe tener al menos 3 ejercicios válidos y mapeables. Recibidos: ${mappedRows.length}.`
        );
      }

      routineExercisesByDay.push({
        day_of_week: dayOfWeek,
        rows: mappedRows,
      });
    }

    console.log('[generate-routine] Eliminando rutinas previas del usuario...');

    const { error: deleteOldError } = await supabase
      .from('routines')
      .delete()
      .eq('user_id', userId);

    if (deleteOldError) {
      throw new Error(deleteOldError.message ?? 'No se pudieron eliminar las rutinas previas.');
    }

    for (const routineRow of routineRows) {
      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .insert(routineRow)
        .select('id')
        .single<{ id: string }>();

      if (routineError || !routine) {
        throw new Error(
          routineError?.message ?? `No se pudo guardar el día ${routineRow.day_of_week}.`
        );
      }

      const dayExercises =
        routineExercisesByDay.find((item) => item.day_of_week === routineRow.day_of_week)?.rows ??
        [];

      if (dayExercises.length > 0) {
        const exerciseRows = dayExercises.map((ex) => ({
          routine_id: routine.id,
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          sort_order: ex.sort_order,
        }));

        const { error: insertError } = await supabase
          .from('routine_exercises')
          .insert(exerciseRows);

        if (insertError) {
          throw new Error(
            insertError.message ?? `Error al insertar ejercicios del día ${routineRow.day_of_week}.`
          );
        }
      }
    }

    console.log('[generate-routine] Rutina guardada exitosamente para userId:', userId);

    return jsonResponse({ message: 'Rutina generada exitosamente.' });
  } catch (error) {
    console.error('[generate-routine] Error:', error);
    return errorResponse(error);
  }
});
