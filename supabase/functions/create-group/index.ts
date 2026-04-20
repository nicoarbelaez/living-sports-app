import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';
import { uploadMedia } from '../_shared/cloudinary.ts';

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

    const formData = await req.formData();
    const name = (formData.get('name')?.toString() ?? '').trim();
    const description = (formData.get('description')?.toString() ?? '').trim() || null;
    const emoji = (formData.get('emoji')?.toString() ?? '').trim() || null;
    const isPublic = formData.get('is_public')?.toString() !== 'false';
    const files = formData.getAll('file').filter((v): v is File => v instanceof File);

    if (!name) throw new Error('El nombre del grupo es requerido.');

    const { data: newGroup, error: insertError } = await supabase
      .from('groups')
      .insert({ owner_id: userId, name, description, emoji, is_public: isPublic })
      .select()
      .single();

    if (insertError || !newGroup) {
      throw new Error(insertError?.message ?? 'No se pudo crear el grupo.');
    }

    // Upload cover image after insert (needs group.id for Cloudinary path)
    let imageUrl: string | null = null;
    if (files.length > 0) {
      const [media] = await uploadMedia(files, `groups/${newGroup.id}/cover`, 'avatar');
      imageUrl = media.url;
      await supabase.from('groups').update({ image_url: imageUrl }).eq('id', newGroup.id);
    }

    // Add owner as active member so RLS and members_count trigger fire
    await supabase.from('group_members').insert({
      group_id: newGroup.id,
      user_id: userId,
      role: 'owner',
      status: 'active',
    });

    return jsonResponse({
      message: 'Grupo creado exitosamente.',
      group: { ...newGroup, image_url: imageUrl ?? newGroup.image_url },
    });
  } catch (error) {
    return errorResponse(error);
  }
});
