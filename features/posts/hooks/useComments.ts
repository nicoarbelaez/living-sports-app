import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Comment } from '@/components/shared/comment-item';

export interface ProfileRow {
  id: string;
  avatar_url: string | null;
  username?: string;
  first_name: string;
  last_name: string;
}

export function getFullName(profile: Omit<ProfileRow, 'id'> | null | undefined): string | null {
  if (!profile) return null;
  const f = (profile.first_name || '').trim();
  const l = (profile.last_name || '').trim();
  return f || l ? `${f} ${l}`.trim() : null;
}

function updateTree(list: Comment[], id: string): Comment[] {
  return list.map((c) => {
    if (c.id === id) {
      const newLiked = !c.isLiked;
      return { ...c, isLiked: newLiked, likes: c.likes + (newLiked ? 1 : -1) };
    }
    if (c.replies) return { ...c, replies: updateTree(c.replies, id) };
    return c;
  });
}

function findComment(
  list: Comment[],
  id: string,
  parentId: string | null = null
): { comment: Comment; parentId: string | null } | null {
  for (const c of list) {
    if (c.id === id) return { comment: c, parentId };
    if (c.replies) {
      const found = findComment(c.replies, id, c.id);
      if (found) return found;
    }
  }
  return null;
}

export function useComments(postId: string, isVisible: boolean, userId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; user: string } | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('profiles')
      .select('id, avatar_url, first_name, last_name')
      .eq('id', userId)
      .single()
      .then(({ data }) => setProfile(data));
  }, [userId]);

  useEffect(() => {
    if (!isVisible || !userId) return;

    const fetchComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select(
          `id, body, created_at, likes_count,
           profiles ( avatar_url, first_name, last_name ),
           comment_replies (
             id, body, created_at, likes_count,
             profiles ( avatar_url, first_name, last_name )
           )`
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (!data) return;

      const { data: likedComments } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', userId);
      const likedCommentIds = new Set(likedComments?.map((l) => l.comment_id));

      const { data: likedReplies } = await supabase
        .from('comment_reply_likes')
        .select('reply_id')
        .eq('user_id', userId);
      const likedReplyIds = new Set(likedReplies?.map((l) => l.reply_id));

      const mapped: Comment[] = data.map((c: any) => ({
        id: c.id,
        user: getFullName(c.profiles) || 'Usuario',
        avatar: c.profiles?.avatar_url,
        text: c.body,
        time: c.created_at,
        likes: c.likes_count || 0,
        isLiked: likedCommentIds.has(c.id),
        replies: c.comment_replies?.map((r: any) => ({
          id: r.id,
          user: getFullName(r.profiles) || 'Usuario',
          avatar: r.profiles?.avatar_url,
          text: r.body,
          time: r.created_at,
          likes: r.likes_count || 0,
          isLiked: likedReplyIds.has(r.id),
        })),
      }));

      setComments(mapped);
    };

    fetchComments();
  }, [isVisible, postId, userId]);

  const handleLike = async (id: string) => {
    if (!userId) return;
    const found = findComment(comments, id);
    if (!found) return;
    const { comment, parentId } = found;
    const wasLiked = comment.isLiked;
    setComments(updateTree(comments, id));

    if (parentId) {
      if (wasLiked) {
        await supabase
          .from('comment_reply_likes')
          .delete()
          .eq('reply_id', id)
          .eq('user_id', userId);
      } else {
        await supabase.from('comment_reply_likes').insert({ reply_id: id, user_id: userId });
      }
    } else {
      if (wasLiked) {
        await supabase.from('comment_likes').delete().eq('comment_id', id).eq('user_id', userId);
      } else {
        await supabase.from('comment_likes').insert({ comment_id: id, user_id: userId });
      }
    }
  };

  const handleSend = async (text: string): Promise<boolean> => {
    if (!text.trim() || !userId || !profile) return false;

    if (replyTo) {
      const { data } = await supabase
        .from('comment_replies')
        .insert({ body: text, user_id: userId, comment_id: replyTo.id })
        .select()
        .single();

      setComments((prev) =>
        prev.map((c) =>
          c.id === replyTo.id
            ? {
                ...c,
                replies: [
                  ...(c.replies || []),
                  {
                    id: data?.id || Date.now().toString(),
                    user: getFullName(profile) || 'Usuario',
                    avatar: profile.avatar_url ?? '',
                    text,
                    time: new Date().toISOString(),
                    likes: 0,
                    isLiked: false,
                  },
                ],
              }
            : c
        )
      );
      setReplyTo(null);
      return true;
    }

    const { data } = await supabase
      .from('comments')
      .insert({ body: text, user_id: userId, post_id: postId })
      .select()
      .single();

    setComments((prev) => [
      {
        id: data?.id || Date.now().toString(),
        user: getFullName(profile) || 'Usuario',
        avatar: profile.avatar_url ?? '',
        text,
        time: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      },
      ...prev,
    ]);
    return true;
  };

  return { comments, profile, replyTo, setReplyTo, handleLike, handleSend };
}
