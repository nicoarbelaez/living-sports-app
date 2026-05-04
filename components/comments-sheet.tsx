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
        text: '¡Gracias Nico!',
        time: '1h',
        likes: 1,
        isLiked: false,
      },
    ],
  },
];

export default function CommentsSheet({ isVisible, onClose }: CommentsSheetProps) {
  const { session } = useAuth();
  const user = session?.user;

  const [comments, setComments] = useState<Comment[]>(DUMMY_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const inputRef = useRef<TextInput>(null);

  // ===============================
  // 🔥 HELPERS
  // ===============================

  const findComment = (
    list: Comment[],
    id: string,
    parentId: string | null = null
  ): { comment: Comment; parentId: string | null } | null => {
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
  // 🔥 LIKE FUNCTION
  // ===============================

  const handleLike = async (id: string) => {
    if (!user) return;

    const found = findComment(comments, id);
    if (!found) return;

    const { comment, parentId } = found;
    const wasLiked = comment.isLiked;

    // ⚡ UI optimista
    const updated = updateTree(comments, id);
    setComments(updated);

    try {
      if (parentId) {
        // 🔥 ES REPLY
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
        // 🔥 ES COMMENT
        if (wasLiked) {
          await supabase.from('comment_likes').delete().eq('comment_id', id).eq('user_id', user.id);
        } else {
          await supabase.from('comment_likes').insert({
            comment_id: id,
            user_id: user.id,
          });
        }
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  // ===============================
  // UI
  // ===============================

  return (
    <Modal transparent visible={isVisible} animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View className="h-[85%] overflow-hidden rounded-t-3xl bg-white">
          {/* HEADER */}
          <View className="flex-row justify-between border-b px-4 py-4">
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
              <CommentItem comment={item} onReply={() => {}} onLike={handleLike} />
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
              <TouchableOpacity>
                <Text className="font-bold text-blue-500">Post</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}
