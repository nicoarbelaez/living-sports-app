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
    const updates: Record<string, unknown> = {};

    const bio = formData.get('bio')?.toString();
    if (bio !== undefined) updates.bio = bio.trim() || null;

    const occupation = formData.get('occupation')?.toString();
    if (occupation !== undefined) updates.occupation = occupation.trim() || null;

    const firstName = formData.get('first_name')?.toString();
    if (firstName !== undefined) updates.first_name = firstName.trim() || null;

    const lastName = formData.get('last_name')?.toString();
    if (lastName !== undefined) updates.last_name = lastName.trim() || null;

    const files = formData.getAll('file').filter((v): v is File => v instanceof File);
    if (files.length > 0) {
      const [media] = await uploadMedia(files, `profiles/${userId}/avatar`, 'avatar');
      updates.avatar_url = media.url;
    }

    if (Object.keys(updates).length === 0) throw new Error('No hay campos para actualizar.');

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (updateError || !profile) {
      throw new Error(updateError?.message ?? 'No se pudo actualizar el perfil.');
    }

    return jsonResponse({ profile });
  } catch (error) {
    return errorResponse(error);
  }
});
