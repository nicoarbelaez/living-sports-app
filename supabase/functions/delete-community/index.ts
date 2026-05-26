import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { authenticateUser } from '../_shared/auth.ts';

interface DeleteBody {
  group_id: string;
}

export async function handler(req: Request): Promise<Response> {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get('Authorization');
    const { userId, supabase } = await authenticateUser(authHeader, { request: req });

    const body: DeleteBody = await req.json();
    const groupId = body.group_id?.trim();
    if (!groupId) throw new Error('group_id es requerido.');

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, owner_id')
      .eq('id', groupId)
      .single();

    if (groupError || !group) throw new Error('Comunidad no encontrada.');
    if (group.owner_id !== userId)
      throw new Error('Solo el propietario puede eliminar esta comunidad.');

    const { error: deleteError } = await supabase
      .from('groups')
      .update({ is_deleted: true })
      .eq('id', groupId);

    if (deleteError) throw new Error(deleteError.message ?? 'No se pudo eliminar la comunidad.');

    return jsonResponse({ message: 'Comunidad eliminada exitosamente.' });
  } catch (error) {
    return errorResponse(error);
  }
}

Deno.serve(handler);
