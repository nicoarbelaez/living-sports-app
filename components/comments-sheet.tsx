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

const CURRENT_USER = {
  user: 'Nico Arbelaez',
  avatar: 'https://avatars.githubusercontent.com/u/111522939?v=4',
};

interface CommentsSheetProps {
  isVisible: boolean;
  onClose: () => void;
  postId: string; // 🔥 IMPORTANTE
}

export default function CommentsSheet({ isVisible, onClose, postId }: CommentsSheetProps) {
  const { session } = useAuth();
  const user = session?.user;

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; user: string } | null>(null);

  const inputRef = useRef<TextInput>(null);

  // ===============================
  // 🚀 FETCH COMMENTS REAL
  // ===============================

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(
          `
          id,
          body,
          likes_count,
          created_at,
          profiles ( username, avatar_url ),
          comment_replies (
            id,
            body,
            likes_count,
            created_at,
            profiles ( username, avatar_url )
          )
        `
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      const mapped: Comment[] = data.map((c: any) => ({
        id: c.id,
        user: c.profiles?.username || 'User',
        avatar: c.profiles?.avatar_url,
        text: c.body,
        time: 'now',
        likes: c.likes_count || 0,
        isLiked: false,
        replies: c.comment_replies?.map((r: any) => ({
          id: r.id,
          user: r.profiles?.username || 'User',
          avatar: r.profiles?.avatar_url,
          text: r.body,
          time: 'now',
          likes: r.likes_count || 0,
          isLiked: false,
        })),
      }));

      setComments(mapped);
    };

    if (isVisible) fetchComments();
  }, [isVisible]);

  // ===============================
  // 🔥 HELPERS
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

  const updateTree = (list: Comment[], id: string): Comment[] => {
    return list.map((c) => {
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
  };

  // ===============================
  // ❤️ LIKE (REAL)
  // ===============================

  const handleLike = async (id: string) => {
    if (!user) return;

    const found = findComment(comments, id);
    if (!found) return;

    const { comment, parentId } = found;
    const wasLiked = comment.isLiked;

    setComments(updateTree(comments, id));

    try {
      if (parentId) {
        // reply
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
        // comment
        if (wasLiked) {
          await supabase.from('comment_likes').delete().eq('comment_id', id).eq('user_id', user.id);
        } else {
          await supabase.from('comment_likes').insert({
            comment_id: id,
            user_id: user.id,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ===============================
  // 💬 CREATE COMMENT / REPLY
  // ===============================

  const handleSend = async () => {
    if (!newComment.trim() || !user) return;

    if (replyTo) {
      // 🔥 REPLY
      const { data, error } = await supabase
        .from('comment_replies')
        .insert({
          body: newComment,
          user_id: user.id,
          comment_id: replyTo.id,
        })
        .select()
        .single();

      if (error) return console.error(error);

      setComments((prev) =>
        prev.map((c) =>
          c.id === replyTo.id
            ? {
                ...c,
                replies: [
                  ...(c.replies || []),
                  {
                    id: data.id,
                    user: CURRENT_USER.user,
                    avatar: CURRENT_USER.avatar,
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

    // 🔥 COMMENT
    const { data, error } = await supabase
      .from('comments')
      .insert({
        body: newComment,
        user_id: user.id,
        post_id: postId,
      })
      .select()
      .single();

    if (error) return console.error(error);

    setComments((prev) => [
      {
        id: data.id,
        user: CURRENT_USER.user,
        avatar: CURRENT_USER.avatar,
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
          {/* HEADER */}
          <View className="flex-row justify-between border-b px-4 py-4">
            <Text className="text-lg font-bold">Comments</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} />
            </TouchableOpacity>
          </View>

          {/* LIST */}
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

          {/* INPUT */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className="flex-row items-center border-t px-4 py-3">
              <Image source={{ uri: CURRENT_USER.avatar }} className="h-10 w-10 rounded-full" />

              <TextInput
                ref={inputRef}
                className="mx-3 flex-1"
                placeholder={replyTo ? `Replying to ${replyTo.user}` : 'Add comment...'}
                value={newComment}
                onChangeText={setNewComment}
              />

              <TouchableOpacity onPress={handleSend}>
                <Text className="font-bold text-blue-500">Post</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}
