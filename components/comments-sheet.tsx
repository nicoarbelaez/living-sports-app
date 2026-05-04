import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { X } from 'lucide-react-native';
import CommentItem, { Comment } from './comment-item';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

interface CommentsSheetProps {
  isVisible: boolean;
  onClose: () => void;
  postId: string;
}

export default function CommentsSheet({ isVisible, onClose, postId }: CommentsSheetProps) {
  const { session } = useAuth();
  const user = session?.user;

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; user: string } | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const inputRef = useRef<TextInput>(null);

  // ===============================
  // 👤 PROFILE
  // ===============================
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      setProfile(data);
    };

    fetchProfile();
  }, [user]);

  // ===============================
  // 💬 FETCH COMMENTS + LIKES
  // ===============================
  useEffect(() => {
    if (!isVisible || !user) return;

    const fetchComments = async () => {
      // 🔥 comments + replies
      const { data } = await supabase
        .from('comments')
        .select(
          `
          id,
          body,
          likes_count,
          profiles ( username, avatar_url ),
          comment_replies (
            id,
            body,
            likes_count,
            profiles ( username, avatar_url )
          )
        `
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (!data) return;

      // 🔥 likes comments
      const { data: likedComments } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id);

      const likedCommentIds = new Set(likedComments?.map((l) => l.comment_id));

      // 🔥 likes replies
      const { data: likedReplies } = await supabase
        .from('comment_reply_likes')
        .select('reply_id')
        .eq('user_id', user.id);

      const likedReplyIds = new Set(likedReplies?.map((l) => l.reply_id));

      // 🔥 MAP REAL
      const mapped: Comment[] = data.map((c: any) => ({
        id: c.id,
        user: c.profiles?.username || 'Usuario',
        avatar: c.profiles?.avatar_url,
        text: c.body,
        time: 'now',
        likes: c.likes_count || 0,
        isLiked: likedCommentIds.has(c.id),
        replies: c.comment_replies?.map((r: any) => ({
          id: r.id,
          user: r.profiles?.username || 'Usuario',
          avatar: r.profiles?.avatar_url,
          text: r.body,
          time: 'now',
          likes: r.likes_count || 0,
          isLiked: likedReplyIds.has(r.id),
        })),
      }));

      setComments(mapped);
    };

    fetchComments();
  }, [isVisible, postId, user]);

  // ===============================
  // ❤️ HELPERS
  // ===============================
  const findComment = (list: Comment[], id: string, parentId: string | null = null): any => {
    for (const c of list) {
      if (c.id === id) return { comment: c, parentId };

      if (c.replies) {
        const found = findComment(c.replies, id, c.id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateTree = (list: Comment[], id: string): Comment[] =>
    list.map((c) => {
      if (c.id === id) {
        const newLiked = !c.isLiked;
        return {
          ...c,
          isLiked: newLiked,
          likes: c.likes + (newLiked ? 1 : -1),
        };
      }

      if (c.replies) {
        return {
          ...c,
          replies: updateTree(c.replies, id),
        };
      }

      return c;
    });

  // ===============================
  // ❤️ LIKE
  // ===============================
  const handleLike = async (id: string) => {
    if (!user) return;

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
          .eq('user_id', user.id);
      } else {
        await supabase.from('comment_reply_likes').insert({
          reply_id: id,
          user_id: user.id,
        });
      }
    } else {
      if (wasLiked) {
        await supabase.from('comment_likes').delete().eq('comment_id', id).eq('user_id', user.id);
      } else {
        await supabase.from('comment_likes').insert({
          comment_id: id,
          user_id: user.id,
        });
      }
    }
  };

  // ===============================
  // ✍️ CREATE
  // ===============================
  const handleSend = async () => {
    if (!newComment.trim() || !user || !profile) return;

    if (replyTo) {
      const { data } = await supabase
        .from('comment_replies')
        .insert({
          body: newComment,
          user_id: user.id,
          comment_id: replyTo.id,
        })
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
                    user: profile.username,
                    avatar: profile.avatar_url,
                    text: newComment,
                    time: 'now',
                    likes: 0,
                    isLiked: false,
                  },
                ],
              }
            : c
        )
      );

      setReplyTo(null);
      setNewComment('');
      return;
    }

    const { data } = await supabase
      .from('comments')
      .insert({
        body: newComment,
        user_id: user.id,
        post_id: postId,
      })
      .select()
      .single();

    setComments((prev) => [
      {
        id: data?.id || Date.now().toString(),
        user: profile.username,
        avatar: profile.avatar_url,
        text: newComment,
        time: 'now',
        likes: 0,
        isLiked: false,
      },
      ...prev,
    ]);

    setNewComment('');
  };

  // ===============================
  // UI
  // ===============================
  return (
    <Modal transparent visible={isVisible} animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View className="h-[85%] rounded-t-3xl bg-white">
          <View className="flex-row justify-between border-b px-4 py-4">
            <Text className="text-lg font-bold">Comentarios</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                onReply={(user, id) => {
                  setReplyTo({ user, id });
                  setNewComment(`@${user} `);
                  setTimeout(() => inputRef.current?.focus(), 100);
                }}
                onLike={handleLike}
              />
            )}
          />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className="flex-row items-center border-t px-4 py-3">
              <Image source={{ uri: profile?.avatar_url }} className="h-10 w-10 rounded-full" />

              <TextInput
                ref={inputRef}
                className="mx-3 flex-1"
                placeholder="Añadir comentario..."
                value={newComment}
                onChangeText={setNewComment}
              />

              <TouchableOpacity onPress={handleSend}>
                <Text className="font-bold text-blue-500">Publicar</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}
