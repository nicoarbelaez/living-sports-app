import { Tables } from '@/types/database.types';

export type Media = {
  url: string;
  type: 'image' | 'video';
};

/** UI model — flat, display-ready. */
export interface Post {
  id: string;
  user: string;
  time: string; // Relative (e.g. "hace 2 min")
  createdAt: string; // ISO timestamp
  avatar: string;
  media: Media[];
  text: string;
  likesCount: number;
  commentsCount: number;
}

/**
 * Raw Supabase join result from the feed query.
 * post_media comes as an array (one-to-many).
 * profiles comes as a single object (many-to-one).
 */
export type PostRow = Tables<'posts'> & {
  profiles: Pick<Tables<'profiles'>, 'username' | 'first_name' | 'last_name' | 'avatar_url'> | null;
  post_media: Array<Pick<Tables<'post_media'>, 'url' | 'media_type' | 'sort_order'>>;
};

// Helper to convert DB Profile to UI Name
export function getProfileFullName(profile: Partial<Tables<'profiles'>> | null) {
  if (!profile) return 'Atleta';
  const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  return name || profile.username || 'Atleta';
}
