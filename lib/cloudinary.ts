/**
 * Derives a still-frame thumbnail URL from a Cloudinary video URL.
 * Works by injecting `so_0` (seek-offset 0s) into the transformation segment
 * and swapping the extension to .jpg.
 *
 * Input:  https://res.cloudinary.com/{cloud}/video/upload/v1/{path}.mp4
 * Output: https://res.cloudinary.com/{cloud}/video/upload/so_0/v1/{path}.jpg
 */
export function getVideoThumbnail(videoUrl: string): string {
  return videoUrl
    .replace('/video/upload/', '/video/upload/so_0/')
    .replace(/\.(mp4|mov|webm|avi)$/i, '.jpg');
}
