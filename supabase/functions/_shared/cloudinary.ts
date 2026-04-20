export interface MediaMetadata {
  url: string;
  public_id: string;
  width: number;
  height: number;
  type: 'image' | 'video';
  format: string;
  bytes: number;
}

export type UploadSize = 'post' | 'avatar';

const MAX_FILE_SIZE = 5_000_000; // 5 MB

const IMAGE_TRANSFORMS: Record<UploadSize, { transform: string; width: number; height: number }> =
  {
    post: { transform: 'c_fill,w_1080,h_1350,g_auto', width: 1080, height: 1350 },
    avatar: { transform: 'c_fill,w_400,h_400,g_face', width: 400, height: 400 },
  };

/**
 * Uploads one or more File objects to Cloudinary.
 *
 * @param files   Files to upload.
 * @param subPath Path **relative to** `living-sports/` — e.g. `users/abc/posts` or `groups/xyz/cover`.
 * @param size    Transform preset: `'post'` (1080×1350 portrait) or `'avatar'` (400×400 square).
 *                Defaults to `'post'`.
 */
export async function uploadMedia(
  files: File[],
  subPath: string,
  size: UploadSize = 'post'
): Promise<MediaMetadata[]> {
  const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
  const uploadPreset = Deno.env.get('CLOUDINARY_UPLOAD_PRESET');

  if (!cloudName || !uploadPreset) {
    throw new Error('Faltan CLOUDINARY_CLOUD_NAME o CLOUDINARY_UPLOAD_PRESET.');
  }

  const folder = `living-sports/${subPath}`;

  return Promise.all(
    files.map((file) => uploadSingleFile(file, cloudName, uploadPreset, folder, size))
  );
}

async function uploadSingleFile(
  file: File,
  cloudName: string,
  uploadPreset: string,
  folder: string,
  size: UploadSize
): Promise<MediaMetadata> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`El archivo "${file.name || 'subido'}" excede el límite de 5 MB.`);
  }

  const mimeType = file.type ?? '';
  const isVideo = mimeType.includes('video');
  const isImage = mimeType.includes('image');

  if (!isVideo && !isImage) {
    throw new Error(
      `Tipo de archivo inválido: "${mimeType || 'desconocido'}". Solo imágenes y videos.`
    );
  }

  const resourceType = isVideo ? 'video' : 'image';
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);
  form.append('folder', folder);

  const res = await fetch(endpoint, { method: 'POST', body: form });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Error en Cloudinary al subir "${file.name}": ${msg}`);
  }

  const data = await res.json();

  const { transform, width, height } = IMAGE_TRANSFORMS[size];
  let secureUrl: string = data.secure_url;
  if (resourceType === 'image') {
    secureUrl = secureUrl.replace('/upload/', `/upload/${transform}/`);
  }

  return {
    url: secureUrl,
    public_id: data.public_id,
    width: resourceType === 'image' ? width : (data.width as number),
    height: resourceType === 'image' ? height : (data.height as number),
    type: resourceType,
    format: data.format as string,
    bytes: data.bytes as number,
  };
}
