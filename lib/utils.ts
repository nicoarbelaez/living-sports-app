import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

export function getRandomAvatarUrl(seed: string) {
  const nickname = seed.trim() || 'atleta';
  return `https://api.dicebear.com/9.x/toon-head/svg?backgroundType=gradientLinear,solid&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&seed=${encodeURIComponent(nickname)}`;
}
