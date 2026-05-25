import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';

interface LeaveBody {
  group_id: string;
}

export async function handler(req: Request): Promise<Response> {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get('Authorization');
    const token = extractBearerToken(authHeader);
    const supabase = createSupabaseClient(authHeader!);

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) throw new Error('Usuario no autenticado.');
    const userId = userData.user.id;

    const body: LeaveBody = await req.json();
    const groupId = body.group_id?.trim();
    if (!groupId) throw new Error('group_id es requerido.');

    // Check user is an active member
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('id, role, status')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) throw new Error('No eres miembro de esta comunidad.');
    if (membership.status !== 'active') throw new Error('No tienes membresía activa en esta comunidad.');
    if (membership.role === 'owner') throw new Error('El dueño no puede abandonar su propia comunidad.');

    const { error: deleteError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (deleteError) throw new Error(deleteError.message ?? 'No se pudo salir de la comunidad.');

    return jsonResponse({ message: 'Saliste de la comunidad exitosamente.' });
  } catch (error) {
    return errorResponse(error);
  }
}

Deno.serve(handler);
