import { corsHeaders } from './cors.ts';

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(error: unknown, status = 400): Response {
  return jsonResponse(
    { error: error instanceof Error ? error.message : 'Error inesperado.' },
    status
  );
}
