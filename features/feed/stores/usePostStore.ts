import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime, getRandomAvatarUrl } from '@/lib/utils';
import { getProfileFullName } from '@/types/post';
import type { Post, PostRow } from '@/types/post';

const PAGE_SIZE = 15;

const POST_SELECT = `
  id,
  body,
  created_at,
  likes_count,
  comments_count,
  profiles (
    username,
    first_name,
    last_name,
    avatar_url
  ),
  post_media (
    url,
    media_type,
    sort_order
  )
` as const;

function rowToPost(row: PostRow): Post {
  const profile = row.profiles;
  const username = getProfileFullName(profile);
  const avatarSeed = profile?.username ?? username;
  const avatar =
    profile?.avatar_url && !profile.avatar_url.includes('avatars.githubusercontent.com')
      ? profile.avatar_url
      : getRandomAvatarUrl(avatarSeed);

  const media = [...(row.post_media ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => ({
      url: m.url,
      type: (m.media_type === 'video' ? 'video' : 'image') as 'image' | 'video',
    }));

  return {
    id: row.id,
    user: username,
    time: formatRelativeTime(row.created_at),
    createdAt: row.created_at,
    avatar,
    media,
    text: row.body ?? '',
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
  };
}

interface PostState {
  posts: Post[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  cursor: string | null;
  error: string | null;
}

interface PostActions {
  fetchPosts: () => Promise<void>;
  fetchMorePosts: () => Promise<void>;
  prependPost: (post: Post) => void;
  reset: () => void;
}

const initialState: PostState = {
  posts: [],
  isLoading: false,
  isFetchingMore: false,
  hasMore: true,
  cursor: null,
  error: null,
};

export const usePostStore = create<PostState & PostActions>()((set, get) => ({
  ...initialState,

  fetchPosts: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw new Error(error.message);

      const rows = (data ?? []) as PostRow[];
      const posts = rows.map(rowToPost);

      set({
        posts,
        hasMore: rows.length === PAGE_SIZE,
        cursor: rows.at(-1)?.created_at ?? null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[PostStore] fetchPosts:', message);
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMorePosts: async () => {
    const { isFetchingMore, hasMore, cursor } = get();
    if (isFetchingMore || !hasMore || !cursor) return;

    set({ isFetchingMore: true, error: null });

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .lt('created_at', cursor)
        .limit(PAGE_SIZE);

      if (error) throw new Error(error.message);

      const rows = (data ?? []) as PostRow[];
      const newPosts = rows.map(rowToPost);

      set((state) => ({
        posts: [...state.posts, ...newPosts],
        hasMore: rows.length === PAGE_SIZE,
        cursor: rows.at(-1)?.created_at ?? state.cursor,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[PostStore] fetchMorePosts:', message);
      set({ error: message });
    } finally {
      set({ isFetchingMore: false });
    }
  },

  prependPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),

  reset: () => set(initialState),
}));
