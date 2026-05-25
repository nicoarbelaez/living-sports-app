import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';

interface JoinBody {
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

    const body: JoinBody = await req.json();
    const groupId = body.group_id?.trim();
    if (!groupId) throw new Error('group_id es requerido.');

    // Check group exists and is public
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, is_public')
      .eq('id', groupId)
      .eq('is_deleted', false)
      .single();

    if (groupError || !group) throw new Error('Comunidad no encontrada.');
    if (!group.is_public) throw new Error('Esta comunidad no es pública.');

    // Check user not already member
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) throw new Error('Ya eres miembro de esta comunidad.');

    const { error: insertError } = await supabase.from('group_members').insert({
      group_id: groupId,
      user_id: userId,
      role: 'member',
      status: 'active',
    });

    if (insertError) throw new Error(insertError.message ?? 'No se pudo unir a la comunidad.');

    return jsonResponse({ message: 'Te uniste a la comunidad exitosamente.', group_id: groupId });
  } catch (error) {
    return errorResponse(error);
  }
}

Deno.serve(handler);
