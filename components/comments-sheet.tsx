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

export default function CommentsSheet({
  isVisible,
  onClose,
  postUser,
  postAvatar,
  postImage,
  postCaption,
}: CommentsSheetProps) {
  const [comments, setComments] = useState<Comment[]>(DUMMY_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ user: string; id: string } | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Load comments from persistence
  React.useEffect(() => {
    const loadComments = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setComments(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load comments', e);
      }
    };
    if (isVisible) {
      loadComments();
    }
  }, [isVisible]);

  // Save comments to persistence
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
    // Give a small delay for the keyboard to potentially shift
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSend = () => {
    if (!newComment.trim()) return;

    if (replyTo) {
      // Add as a reply
      const updatedComments = comments.map((c) => {
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
              },
            ],
          };
        }
        return c;
      });
      setComments(updatedComments);
      saveComments(updatedComments);
    } else {
      // Add as top-level comment
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        user: CURRENT_USER.user,
        avatar: CURRENT_USER.avatar,
        text: newComment,
        time: 'now',
        likes: 0,
      };
      const updatedComments = [newCommentObj, ...comments];
      setComments(updatedComments);
      saveComments(updatedComments);
    }

    setNewComment('');
    setReplyTo(null);
  };

  const handleLike = (commentId: string) => {
    const updatedComments = comments.map((c) => {
      if (c.id === commentId) {
        const newIsLiked = !c.isLiked;
        return { ...c, likes: c.likes + (newIsLiked ? 1 : -1), isLiked: newIsLiked };
      }
      if (c.replies) {
        return {
          ...c,
          replies: c.replies.map((r) => {
            if (r.id === commentId) {
              const newIsLiked = !r.isLiked;
              return { ...r, likes: r.likes + (newIsLiked ? 1 : -1), isLiked: newIsLiked };
            }
            return r;
          }),
        };
      }
      return c;
    });
    setComments(updatedComments);
    saveComments(updatedComments);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="h-[85%] overflow-hidden rounded-t-3xl bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4">
            <View className="w-6" />
            <Text className="text-base font-bold text-gray-900">Comments</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Post Preview estilo Instagram */}
          {(postImage || postCaption) && (
            <View className="border-b border-gray-100">
              {postImage && (
                <Image source={{ uri: postImage }} className="h-48 w-full" resizeMode="cover" />
              )}
              {(postUser || postCaption) && (
                <View className="flex-row items-start px-4 py-2">
                  {postAvatar && (
                    <Image source={{ uri: postAvatar }} className="mr-2 h-7 w-7 rounded-full" />
                  )}
                  <Text className="flex-1 text-sm">
                    <Text className="font-bold text-gray-900">{postUser} </Text>
                    <Text className="text-gray-700">{postCaption}</Text>
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Comments List */}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CommentItem comment={item} onReply={handleReply} onLike={handleLike} />
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          {/* Input Area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          >
            <View className="flex-row items-center border-t border-gray-100 bg-white px-4 py-3 pb-6">
              <Image source={{ uri: CURRENT_USER.avatar }} className="h-10 w-10 rounded-full" />
              <TextInput
                ref={inputRef}
                className="mx-3 flex-1 rounded-xl bg-gray-50 px-1 py-2 text-sm text-gray-900"
                placeholder={replyTo ? `Replying to ${replyTo.user}...` : 'Add a comment...'}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                style={{ maxHeight: 100 }}
              />
              <TouchableOpacity onPress={handleSend} disabled={!newComment.trim()}>
                <Text
                  className={`font-bold ${newComment.trim() ? 'text-blue-500' : 'text-blue-300'}`}
                >
                  Post
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}
