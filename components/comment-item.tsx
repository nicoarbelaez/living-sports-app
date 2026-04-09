import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  level?: number;
  onReply: (user: string, id: string) => void;
  onLike: (id: string) => void;
}

export default function CommentItem({ comment, level = 0, onReply, onLike }: CommentItemProps) {
  const isReply = level > 0;

  return (
    <View className={`mt-4 ${isReply ? 'ml-10' : 'px-4'}`}>
      <View className="flex-row">
        <Image
          source={{ uri: comment.avatar }}
          className={`${isReply ? 'h-6 w-6' : 'h-8 w-8'} rounded-full`}
        />

        <View className="ml-3 flex-1">
          <View className="flex-row justify-between">
            {/* Texto y detalles ocupan máximo espacio disponible menos el margen del corazón */}
            <View className="flex-1 pr-3">
              <Text className="text-sm">
                <Text className="font-bold text-gray-900">{comment.user}</Text>
                {'  '}
                <Text className="text-gray-800">{comment.text}</Text>
              </Text>

              <View className="mt-1 flex-row items-center gap-4">
                <Text className="text-xs text-gray-500">{comment.time}</Text>
                {comment.likes > 0 && (
                  <Text className="text-xs font-semibold text-gray-500">
                    {comment.likes} {comment.likes === 1 ? 'like' : 'likes'}
                  </Text>
                )}
                <TouchableOpacity onPress={() => onReply(comment.user, comment.id)}>
                  <Text className="text-xs font-semibold text-gray-500">Reply</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Columna dedicada exclusivamente al corazón anclada a la derecha */}
            <TouchableOpacity className="mt-1 items-center pl-2" onPress={() => onLike(comment.id)}>
              <Heart
                size={14}
                color={comment.isLiked ? '#ef4444' : '#6b7280'}
                fill={comment.isLiked ? '#ef4444' : 'transparent'}
              />
            </TouchableOpacity>
          </View>

          {/* Render Replies Recursively */}
          {comment.replies && comment.replies.length > 0 && (
            <View>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  level={level + 1}
                  onReply={onReply}
                  onLike={onLike} // Pasa la función exacta para que los hijos envíen su propio ID
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
