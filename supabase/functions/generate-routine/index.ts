import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

import { generateText } from 'npm:ai';
import { google } from 'npm:@ai-sdk/google';

serve(async (req) => {
  try {
    const body = await req.json();

    const {
      goal,
      experience,
      days,
      duration,
    } = body;

    const prompt = `
      Eres un entrenador profesional fitness.

      Crea una rutina de gimnasio personalizada.

      Objetivo: ${goal}
      Nivel: ${experience}
      Días por semana: ${days}
      Duración por sesión: ${duration} minutos

      Devuelve:
      - nombre del día
      - ejercicios
      - series
      - repeticiones

      Responde en español.
    `;

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt,
    });

    return new Response(
      JSON.stringify({
        routine: text,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: String(error),
      }),
      {
        status: 500,
      }
    );
  }
});