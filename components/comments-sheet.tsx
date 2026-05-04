import React, { useState, useRef } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommentItem, { Comment } from './comment-item';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

const STORAGE_KEY = 'post_comments';

const CURRENT_USER = {
  user: 'Nico Arbelaez',
  avatar: 'https://avatars.githubusercontent.com/u/111522939?v=4',
};

interface CommentsSheetProps {
  isVisible: boolean;
  onClose: () => void;
  postUser?: string;
  postAvatar?: string;
  postImage?: string;
  postCaption?: string;
}

const DUMMY_COMMENTS: Comment[] = [
  {
    id: '1',
    user: 'nicoarbelaez',
    avatar: 'https://i.pravatar.cc/150?u=nico',
    text: '¡Qué buena foto! 🔥',
    time: '2h',
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: '1-1',
        user: 'living.sports',
        avatar: 'https://i.pravatar.cc/150?u=sports',
        text: '¡Gracias Nico! Nos vemos pronto.',
        time: '1h',
        likes: 1,
        isLiked: false,
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
    isLiked: false,
  },
];

export default function CommentsSheet({
  isVisible,
  onClose,
  postUser,
  postAvatar,
  postImage,
  postCaption,
}: CommentsSheetProps) {
  const { session } = useAuth();
  const user = session?.user;

  const [comments, setComments] = useState<Comment[]>(DUMMY_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ user: string; id: string } | null>(null);
  const inputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    const loadComments = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setComments(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load comments', e);
      }
    };
    if (isVisible) loadComments();
  }, [isVisible]);

  const saveComments = async (updatedComments: Comment[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedComments));
    } catch (e) {
      console.error('Failed to save comments', e);
    }
  };

  const handleReply = (user: string, id: string) => {
    setReplyTo({ user, id });
    setNewComment(`@${user} `);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = () => {
    if (!newComment.trim()) return;

    if (replyTo) {
      const updated = comments.map((c) => {
        if (c.id === replyTo.id) {
          return {
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
                isLiked: false,
              },
            ],
          };
        }
        return c;
      });

      setComments(updated);
      saveComments(updated);
    } else {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        user: CURRENT_USER.user,
        avatar: CURRENT_USER.avatar,
        text: newComment,
        time: 'now',
        likes: 0,
        isLiked: false,
      };

      const updated = [newCommentObj, ...comments];
      setComments(updated);
      saveComments(updated);
    }

    setNewComment('');
    setReplyTo(null);
  };

  // 🔥 FUNCIONES CLAVE

  const updateCommentTree = (list: Comment[], id: string): Comment[] => {
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
          replies: updateCommentTree(c.replies, id),
        };
      }

      return c;
    });
  };

  const findComment = (list: Comment[], id: string): Comment | null => {
    for (const c of list) {
      if (c.id === id) return c;
      if (c.replies) {
        const found = findComment(c.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleLike = async (commentId: string) => {
    if (!user) return;

    const comment = findComment(comments, commentId);
    if (!comment) return;

    const wasLiked = comment.isLiked;

    // ⚡ UI inmediata
    const updated = updateCommentTree(comments, commentId);
    setComments(updated);
    saveComments(updated);

    try {
      if (wasLiked) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        await supabase.from('comment_likes').insert({
          comment_id: commentId,
          user_id: user.id,
        });
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="h-[85%] overflow-hidden rounded-t-3xl bg-white">
          {/* HEADER */}
          <View className="flex-row items-center justify-between border-b px-4 py-4">
            <View className="w-6" />
            <Text className="font-bold">Comments</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} />
            </TouchableOpacity>
          </View>

          {/* LIST */}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CommentItem comment={item} onReply={handleReply} onLike={handleLike} />
            )}
          />

          {/* INPUT */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className="flex-row items-center border-t px-4 py-3">
              <Image source={{ uri: CURRENT_USER.avatar }} className="h-10 w-10 rounded-full" />
              <TextInput
                ref={inputRef}
                className="mx-3 flex-1"
                placeholder="Add comment..."
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
