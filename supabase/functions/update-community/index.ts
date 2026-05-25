import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';
import { uploadMedia } from '../_shared/cloudinary.ts';

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

    const formData = await req.formData();
    const groupId = (formData.get('group_id')?.toString() ?? '').trim();
    if (!groupId) throw new Error('group_id es requerido.');

    // Validate ownership
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id')
      .eq('id', groupId)
      .eq('owner_id', userId)
      .single();

    if (groupError || !group) throw new Error('No tienes permiso para editar esta comunidad.');

    const updates: Record<string, unknown> = {};

    const name = formData.get('name')?.toString()?.trim();
    if (name !== undefined && name !== '') {
      if (name.length < 3 || name.length > 80)
        throw new Error('El nombre debe tener entre 3 y 80 caracteres.');
      updates.name = name;
    }

    const description = formData.get('description')?.toString();
    if (description !== undefined) updates.description = description.trim() || null;

    const emoji = formData.get('emoji')?.toString();
    if (emoji !== undefined) updates.emoji = emoji.trim() || null;

    const isPublicRaw = formData.get('is_public')?.toString();
    if (isPublicRaw !== undefined) updates.is_public = isPublicRaw !== 'false';

    const files = formData.getAll('file').filter((v): v is File => v instanceof File);
    if (files.length > 0) {
      const [media] = await uploadMedia(files, `groups/${groupId}/cover`, 'avatar');
      updates.image_url = media.url;
    }

    if (Object.keys(updates).length === 0) throw new Error('No hay campos para actualizar.');

    const { data: updatedGroup, error: updateError } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (updateError || !updatedGroup) {
      throw new Error(updateError?.message ?? 'No se pudo actualizar la comunidad.');
    }

    return jsonResponse({ message: 'Comunidad actualizada exitosamente.', group: updatedGroup });
  } catch (error) {
    return errorResponse(error);
  }
}

Deno.serve(handler);
