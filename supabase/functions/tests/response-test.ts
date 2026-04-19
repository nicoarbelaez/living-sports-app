import { assertEquals } from 'jsr:@std/assert';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { corsHeaders } from '../_shared/cors.ts';

Deno.test('jsonResponse: sets correct status and Content-Type', async () => {
  const res = jsonResponse({ ok: true });
  assertEquals(res.status, 200);
  assertEquals(res.headers.get('Content-Type'), 'application/json');
  const body = await res.json();
  assertEquals(body, { ok: true });
});

Deno.test('jsonResponse: respects custom status code', async () => {
  const res = jsonResponse({ error: 'not found' }, 404);
  assertEquals(res.status, 404);
});

Deno.test('jsonResponse: includes CORS headers', () => {
  const res = jsonResponse({});
  for (const [key, value] of Object.entries(corsHeaders)) {
    assertEquals(res.headers.get(key), value);
  }
});

Deno.test('errorResponse: wraps Error message', async () => {
  const res = errorResponse(new Error('algo falló'));
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body, { error: 'algo falló' });
});

Deno.test('errorResponse: wraps non-Error as fallback string', async () => {
  const res = errorResponse('string error');
  const body = await res.json();
  assertEquals(body, { error: 'Error inesperado.' });
});

Deno.test('errorResponse: respects custom status code', () => {
  const res = errorResponse(new Error('unauthorized'), 401);
  assertEquals(res.status, 401);
});
