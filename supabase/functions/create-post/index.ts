import { handleCors } from '../_shared/cors.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { createSupabaseClient, extractBearerToken } from '../_shared/supabase-client.ts';
import { uploadMedia } from '../_shared/cloudinary.ts';

interface ProfileData {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}

function getProfileName(profile: ProfileData | null | undefined): string {
  if (!profile) return 'Atleta';
  const full = `${profile.first_name?.trim() ?? ''} ${profile.last_name?.trim() ?? ''}`.trim();
  return full || profile.username || 'Atleta';
}

Deno.serve(async (req) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  console.log('[create-post] Incoming request:', req.method, req.url);

  try {
    const authHeader = req.headers.get('Authorization');
    const token = extractBearerToken(authHeader);

    const supabase = createSupabaseClient(authHeader!);

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      throw new Error('Usuario no autenticado.');
    }
    const userId = userData.user.id;
    console.log('[create-post] Authenticated user:', userId);

    const formData = await req.formData();
    const bodyText = (formData.get('text')?.toString() ?? '').trim();
    const files = formData.getAll('file').filter((v): v is File => v instanceof File);

    console.log('[create-post] Text:', bodyText, '| Files:', files.length);

    if (!bodyText && files.length === 0) {
      throw new Error('El post debe contener texto o elementos multimedia.');
    }

    // Upload all media files to Cloudinary (0 files → empty array, no API call)
    const mediaMetadata = files.length > 0 ? await uploadMedia(files, `users/${userId}/posts`) : [];

    // Insert post
    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert({ user_id: userId, body: bodyText || null })
      .select(
        `id, body, created_at,
         profiles:profiles!inner(first_name, last_name, avatar_url, username)`
      )
      .single();

    if (insertError || !newPost) {
      console.error('[create-post] Post insert failed:', insertError);
      throw new Error('No se pudo insertar el Post en la base de datos.');
    }
    console.log('[create-post] Post inserted:', newPost.id);

    // Insert media metadata rows
    if (mediaMetadata.length > 0) {
      const { error: mediaError } = await supabase.from('post_media').insert(
        mediaMetadata.map((m, index) => ({
          post_id: newPost.id,
          media_type: m.type,
          url: m.url,
          sort_order: index,
          width_px: m.width,
          height_px: m.height,
        }))
      );

      if (mediaError) {
        console.error('[create-post] Media insert failed:', mediaError);
        throw new Error('Post creado pero ocurrió un error guardando el adjunto.');
      }
      console.log('[create-post] Media inserted:', mediaMetadata.length, 'items');
    }

    type PostWithProfiles = typeof newPost & {
      profiles: ProfileData | ProfileData[] | null;
    };
    const p = newPost as unknown as PostWithProfiles;
    const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;

    return jsonResponse({
      message: 'Post publicado de forma exitosa.',
      post: {
        id: newPost.id,
        text: newPost.body ?? '',
        media: mediaMetadata.map((m) => ({ url: m.url, type: m.type })),
        user: getProfileName(profile),
        avatar: profile?.avatar_url ?? 'https://avatars.githubusercontent.com/u/111522939?v=4',
        time: 'Ahora',
        createdAt: newPost.created_at,
      },
    });
  } catch (error) {
    console.error('[create-post] ERROR:', error);
    return errorResponse(error);
  }
});
