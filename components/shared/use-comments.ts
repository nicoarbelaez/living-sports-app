import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Comment } from './comment-item';

const STORAGE_KEY = 'post_comments';

export const CURRENT_USER = {
  user: 'Nico Arbelaez',
  avatar: 'https://avatars.githubusercontent.com/u/111522939?v=4',
};

const DUMMY_COMMENTS: Comment[] = [
  {
    id: '1',
    user: 'nicoarbelaez',
    avatar: 'https://i.pravatar.cc/150?u=nico',
    text: '¡Qué buena foto! 🔥',
    time: '2h',
    likes: 5,
    replies: [
      {
        id: '1-1',
        user: 'living.sports',
        avatar: 'https://i.pravatar.cc/150?u=sports',
        text: '¡Gracias Nico! Nos vemos pronto.',
        time: '1h',
        likes: 1,
      },
    ],
  },
  {
    id: '2',
    user: 'aleja_fitness',
    avatar: 'https://i.pravatar.cc/150?u=aleja',
    text: 'Increíble el ambiente de hoy ⚽️',
    time: '45m',
    likes: 12,
  },
];

async function saveComments(updated: Comment[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // silent
  }
}

export function useComments(isVisible: boolean) {
  const [comments, setComments] = useState<Comment[]>(DUMMY_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ user: string; id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setComments(JSON.parse(saved));
      } catch {
        // keep dummy comments on error
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isVisible]);

  const handleReply = useCallback((user: string, id: string) => {
    setReplyTo({ user, id });
    setNewComment(`@${user} `);
  }, []);

  const handleSend = useCallback(() => {
    if (!newComment.trim()) return;
    setComments((prev) => {
      let updated: Comment[];
      if (replyTo) {
        updated = prev.map((c) =>
          c.id === replyTo.id
            ? {
                ...c,
                replies: [
                  ...(c.replies || []),
                  {
                    id: Date.now().toString(),
                    user: CURRENT_USER.user,
                    avatar: CURRENT_USER.avatar,
                    text: newComment.replace(`@${replyTo.user}`, '').trim(),
                    time: 'now',
                    likes: 0,
                  },
                ],
              }
            : c
        );
      } else {
        updated = [
          {
            id: Date.now().toString(),
            user: CURRENT_USER.user,
            avatar: CURRENT_USER.avatar,
            text: newComment,
            time: 'now',
            likes: 0,
          },
          ...prev,
        ];
      }
      saveComments(updated);
      return updated;
    });
    setNewComment('');
    setReplyTo(null);
  }, [newComment, replyTo]);

  const handleLike = useCallback((commentId: string) => {
    setComments((prev) => {
      const updated = prev.map((c) => {
        if (c.id === commentId) {
          const liked = !c.isLiked;
          return { ...c, likes: c.likes + (liked ? 1 : -1), isLiked: liked };
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) => {
              if (r.id === commentId) {
                const liked = !r.isLiked;
                return { ...r, likes: r.likes + (liked ? 1 : -1), isLiked: liked };
              }
              return r;
            }),
          };
        }
        return c;
      });
      saveComments(updated);
      return updated;
    });
  }, []);

  return {
    comments,
    isLoading,
    newComment,
    setNewComment,
    replyTo,
    handleReply,
    handleSend,
    handleLike,
  };
}
