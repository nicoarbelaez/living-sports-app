import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

interface ProfileData {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}

function getProfileName(profile: ProfileData | null | undefined) {
  if (!profile) return 'Atleta';

  const firstName = profile.first_name?.toString()?.trim() ?? '';
  const lastName = profile.last_name?.toString()?.trim() ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || profile.username || 'Atleta';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('[create-post] Incoming request:', req.method, req.url);

  try {
    console.log('[create-post] Headers:', Object.fromEntries(req.headers.entries()));

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.warn('[create-post] Missing or invalid Authorization header');
      throw new Error('Falta el header Authorization con Bearer token.');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[create-post] Environment variables SUPABASE_URL or SUPABASE_ANON_KEY missing');
      throw new Error('Faltan SUPABASE_URL o SUPABASE_ANON_KEY en las variables de entorno.');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const token = authHeader.replace('Bearer ', '').trim();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      console.error('[create-post] Auth error:', userError);
      throw new Error('Usuario no autenticado.');
    }

    const userId = userData.user.id;
    console.log('[create-post] Authenticated user:', userId);

    console.log('[create-post] Parsing FormData...');
    const formData = await req.formData();
    const bodyText = (formData.get('text')?.toString() ?? '').trim();

    const files = formData.getAll('file').filter((value): value is File => value instanceof File);

    console.log('[create-post] Parsed data - Text:', bodyText, '| Files count:', files.length);

    if (!bodyText && files.length === 0) {
      console.warn('[create-post] Empty post attempt (no text or media)');
      throw new Error('El post debe contener texto o elementos multimedia.');
    }

    const mediaMetadataArray: Array<{
      url: string;
      public_id: string;
      width: number;
      height: number;
      type: 'image' | 'video';
      format: string;
      bytes: number;
    }> = [];

    if (files.length > 0) {
      const cloudinaryCloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
      const cloudinaryUploadPreset = Deno.env.get('CLOUDINARY_UPLOAD_PRESET');

      if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
        throw new Error('Faltan CLOUDINARY_CLOUD_NAME o CLOUDINARY_UPLOAD_PRESET.');
      }

      const folderPath = `living-sports/users/${userId}/posts`;
      const maxSize = 5_000_000; // 5 MB

      const uploadedMedia = await Promise.all(
        files.map(async (file) => {
          if (file.size > maxSize) {
            throw new Error(
              `El archivo ${file.name || 'subido'} excede el límite permitido de 5MB.`
            );
          }

          const mediaType = file.type || '';
          const isVideo = mediaType.includes('video');
          const isImage = mediaType.includes('image');

          if (!isVideo && !isImage) {
            throw new Error(
              `Tipo de archivo inválido: ${mediaType || 'desconocido'}. Solo imágenes y videos permitidos.`
            );
          }

          const uploadType = isVideo ? 'video' : 'image';
          const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/${uploadType}/upload`;

          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          uploadFormData.append('upload_preset', cloudinaryUploadPreset);
          uploadFormData.append('folder', folderPath);

          console.log(`[create-post] Uploading file: ${file.name} (${file.size} bytes) as ${uploadType}`);
          const uploadRes = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadRes.ok) {
            const errorMsg = await uploadRes.text();
            console.error(`[create-post] Cloudinary upload failed for ${file.name}:`, errorMsg);
            throw new Error(`Error en Cloudinary: ${errorMsg}`);
          }

          const uploadData = await uploadRes.json();
          console.log(`[create-post] Cloudinary upload success for ${file.name}:`, uploadData.public_id);

          let optimizedUrl = uploadData.secure_url as string;
          if (uploadType === 'image') {
            optimizedUrl = optimizedUrl.replace('/upload/', '/upload/c_fill,w_1080,h_1350,g_auto/');
          }

          return {
            url: optimizedUrl,
            public_id: uploadData.public_id as string,
            width: uploadType === 'image' ? 1080 : (uploadData.width as number),
            height: uploadType === 'image' ? 1350 : (uploadData.height as number),
            type: uploadType as 'image' | 'video',
            format: uploadData.format as string,
            bytes: uploadData.bytes as number,
          };
        })
      );

      mediaMetadataArray.push(...uploadedMedia);
    }

    const postPayload = {
      user_id: userId,
      body: bodyText || null,
    };

    console.log('[create-post] Inserting post into DB...', postPayload);
    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert(postPayload)
      .select(
        `
          id,
          body,
          created_at,
          profiles:profiles!inner(
            first_name,
            last_name,
            avatar_url,
            username
          )
        `
      )
      .single();

    if (insertError) {
      console.error('[create-post] Post insertion failed:', insertError);
      throw new Error('No se pudo insertar el Post en la base de datos.');
    }

    console.log('[create-post] Post inserted successfully:', newPost.id);

    if (mediaMetadataArray.length > 0) {
      const mediaInserts = mediaMetadataArray.map((media, index) => ({
        post_id: newPost.id,
        media_type: media.type,
        url: media.url,
        sort_order: index,
        width_px: media.width,
        height_px: media.height,
      }));

      console.log('[create-post] Inserting media metadata...', mediaInserts);
      const { error: mediaError } = await supabase.from('post_media').insert(mediaInserts);

      if (mediaError) {
        console.error('[create-post] Media insertion failed:', mediaError);
        throw new Error('Post creado pero ocurrió un error guardando el adjunto.');
      }
      console.log('[create-post] Media inserted successfully');
    }

    type PostWithProfiles = typeof newPost & {
      profiles: ProfileData | ProfileData[] | null;
    };
    const postWithProfiles = newPost as unknown as PostWithProfiles;

    const profile = Array.isArray(postWithProfiles.profiles)
      ? postWithProfiles.profiles[0]
      : postWithProfiles.profiles;

    console.log('[create-post] Success! Post creation complete.');
    return jsonResponse(
      {
        message: 'Post publicado de forma exitosa.',
        post: {
          id: newPost.id,
          text: newPost.body || '',
          media: mediaMetadataArray.map((m) => ({
            url: m.url,
            type: m.type,
          })),
          user: getProfileName(profile),
          avatar: profile?.avatar_url || 'https://avatars.githubusercontent.com/u/111522939?v=4',
          time: 'Ahora',
          createdAt: newPost.created_at,
        },
      },
      200
    );
  } catch (error) {
    console.error('[create-post] CRITICAL ERROR:', error);

    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Error inesperado al crear el post.',
      },
      400
    );
  }
});
