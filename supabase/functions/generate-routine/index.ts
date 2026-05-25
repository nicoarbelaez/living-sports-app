import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';

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
  emoji: string | null;
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

    const body: GenerateRoutineBody = await req.json();
    const { goals, level, daysPerWeek, equipment, prompt } = body;

    if (!goals?.length) throw new Error('goals es requerido.');
    if (!level?.trim()) throw new Error('level es requerido.');
    if (!daysPerWeek || daysPerWeek < 1 || daysPerWeek > 7)
      throw new Error('daysPerWeek debe estar entre 1 y 7.');
    if (!equipment?.length) throw new Error('equipment es requerido.');

    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openrouterKey) throw new Error('OpenRouter key not configured.');

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('bio, first_name')
      .eq('id', userId)
      .single<{ bio: string | null; first_name: string | null }>();

    // Fetch exercises catalog
    const { data: exercises } = await supabase
      .from('exercises')
      .select('id, name, emoji')
      .returns<ExerciseCatalog[]>();

    const systemPrompt = `You are a fitness coach. Generate a 7-day weekly routine as JSON.
Output ONLY valid JSON matching this schema:
{
  "days": [
    {
      "day_of_week": 0,
      "title": "string",
      "is_rest": false,
      "description": "string",
      "duration_sec": 3600,
      "exercises": [
        { "exercise_name": "string", "sets": 3, "reps": 12, "rest_seconds": 60 }
      ]
    }
  ]
}
day_of_week: 0=Monday ... 6=Sunday. is_rest=true means no exercises.
Available exercises: ${exercises?.map((e) => e.name).join(', ')}.
User info: ${profile?.first_name ?? 'User'}. Bio: ${profile?.bio ?? 'none'}.`;

    const userMessage = `Goals: ${goals.join(', ')}. Level: ${level}. Days/week: ${daysPerWeek}. Equipment: ${equipment.join(', ')}. ${prompt ?? ''}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + openrouterKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const llmData = await response.json();
    const content = llmData.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response from AI.');

    const parsed: AIRoutinePayload = JSON.parse(content);
    if (!parsed.days || !Array.isArray(parsed.days)) throw new Error('Invalid AI response format.');

    // Resolve exercise names to IDs and assign sort_order
    const exerciseMap = new Map(exercises?.map((e) => [e.name.toLowerCase(), e.id]) ?? []);
    for (const day of parsed.days) {
      if (Array.isArray(day.exercises)) {
        day.exercises = day.exercises.map((ex, index) => ({
          ...ex,
          exercise_id: exerciseMap.get(ex.exercise_name?.toLowerCase()) ?? null,
          sort_order: index,
        }));
      }
    }

    // Save draft
    const { data: draft, error: draftError } = await supabase
      .from('ai_routine_drafts')
      .insert({ user_id: userId, payload: parsed })
      .select()
      .single<{ id: string }>();

    if (draftError || !draft) {
      throw new Error(draftError?.message ?? 'No se pudo guardar el borrador de rutina.');
    }

    return jsonResponse({ draft_id: draft.id, payload: parsed });
  } catch (error) {
    return errorResponse(error);
  }
});
