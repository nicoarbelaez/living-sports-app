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

const MAX_IMAGE_SIZE = 10_000_000;
const MAX_VIDEO_SIZE = 500_000_000;

const IMAGE_TRANSFORMS: Record<UploadSize, { transform: string; width: number; height: number }> = {
  post: {
    transform: 'c_fill,w_1080,h_1350,g_auto',
    width: 1080,
    height: 1350,
  },
  avatar: {
    transform: 'c_fill,w_400,h_400,g_face',
    width: 400,
    height: 400,
  },
};

/**
 * Runtime guard (CRÍTICO)
 */
function assertUploadSize(size: string): asserts size is UploadSize {
  const normalized = size?.trim();

  if (normalized !== 'post' && normalized !== 'avatar') {
    throw new Error(`[Cloudinary] Invalid upload size: "${size}". Expected "post" | "avatar"`);
  }
}

/**
 * Upload multiple files
 */
export async function uploadMedia(
  files: File[],
  subPath: string,
  size: UploadSize = 'post'
): Promise<MediaMetadata[]> {
  const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
  const uploadPreset = Deno.env.get('CLOUDINARY_UPLOAD_PRESET');

  if (!cloudName || !uploadPreset) {
    throw new Error('Missing Cloudinary env vars');
  }

  const folder = `living-sports/${subPath}`;

  const validFiles = files.filter((f): f is File => f instanceof File);

  if (!validFiles.length) {
    throw new Error('No valid files provided');
  }

  return Promise.all(
    validFiles.map((file) => uploadSingleFile(file, cloudName, uploadPreset, folder, size))
  );
}

async function uploadSingleFile(
  file: File,
  cloudName: string,
  uploadPreset: string,
  folder: string,
  size: UploadSize
): Promise<MediaMetadata> {
  const mimeType = file.type ?? '';
  const isVideo = mimeType.includes('video');
  const isImage = mimeType.includes('image');

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  if (file.size > maxSize) {
    throw new Error(`File too large: ${file.name}`);
  }

  if (!isVideo && !isImage) {
    throw new Error(`Invalid file type: ${mimeType}`);
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
    throw new Error(`[Cloudinary] Upload failed: ${msg}`);
  }

  const data = await res.json();

  // ✅ SAFE TRANSFORM ACCESS
  assertUploadSize(size);

  const config = IMAGE_TRANSFORMS[size];

  let secureUrl = data.secure_url;

  if (resourceType === 'image') {
    secureUrl = secureUrl.replace('/upload/', `/upload/${config.transform}/`);
  }

  return {
    url: secureUrl,
    public_id: data.public_id,
    width: resourceType === 'image' ? config.width : data.width,
    height: resourceType === 'image' ? config.height : data.height,
    type: resourceType,
    format: data.format,
    bytes: data.bytes,
  };
}
