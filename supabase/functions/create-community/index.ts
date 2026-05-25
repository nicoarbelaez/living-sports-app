import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { authenticateUser } from '../_shared/auth.ts';
import { uploadMedia } from '../_shared/cloudinary.ts';

Deno.serve(async (req) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  const start = Date.now();
  console.log('[create-community] start', { method: req.method });

  try {
    const authHeader = req.headers.get('Authorization');
    const { userId, supabase } = await authenticateUser(authHeader, { request: req });

    const formData = await req.formData();
    const name = (formData.get('name')?.toString() ?? '').trim();
    const description = (formData.get('description')?.toString() ?? '').trim() || null;
    const emoji = (formData.get('emoji')?.toString() ?? '').trim() || null;
    const isPublic = formData.get('is_public')?.toString() !== 'false';
    const files = formData.getAll('file').filter((v): v is File => v instanceof File);

    if (!name) throw new Error('El nombre de la comunidad es requerido.');
    if (name.length < 3 || name.length > 80)
      throw new Error('El nombre debe tener entre 3 y 80 caracteres.');

    const { count } = await supabase
      .from('groups')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('is_deleted', false);
    if ((count ?? 0) > 0) throw new Error('Ya tienes una comunidad creada.');

    const { data: newGroup, error: insertError } = await supabase
      .from('groups')
      .insert({ owner_id: userId, name, description, emoji, is_public: isPublic })
      .select()
      .single();

    if (insertError || !newGroup) {
      throw new Error(insertError?.message ?? 'No se pudo crear la comunidad.');
    }
    console.log('[create-community] group inserted', { groupId: newGroup.id });

    let imageUrl: string | null = null;
    if (files.length > 0) {
      const [media] = await uploadMedia(files, `groups/${newGroup.id}/cover`, 'avatar');
      imageUrl = media.url;
      await supabase.from('groups').update({ image_url: imageUrl }).eq('id', newGroup.id);
      console.log('[create-community] image uploaded', { imageUrl });
    }

    await supabase.from('group_members').insert({
      group_id: newGroup.id,
      user_id: userId,
      role: 'owner',
      status: 'active',
    });

    console.log('[create-community] done', { groupId: newGroup.id, ms: Date.now() - start });
    return jsonResponse({
      message: 'Comunidad creada exitosamente.',
      group: { ...newGroup, image_url: imageUrl ?? newGroup.image_url },
    });
  } catch (error) {
    console.error('[create-community] error', {
      message: (error as Error).message,
      ms: Date.now() - start,
    });
    return errorResponse(error);
  }
});
