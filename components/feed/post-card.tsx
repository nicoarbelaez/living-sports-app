import React, { useState, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import MediaCarousel from './media-carousel';
import { Image } from 'expo-image';
import CommentsSheet from '@/components/shared/comments-sheet';
import type { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <View className="mx-4 mt-3 overflow-hidden rounded-2xl bg-white shadow dark:bg-[#111827]">
      <View className="flex-row items-center px-4 py-3">
        <Image
          source={{ uri: post.avatar }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
          contentFit="cover"
        />
        <View className="ml-3">
          <Text className="font-semibold text-gray-900 dark:text-white">{post.user}</Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">{post.time}</Text>
        </View>
      </View>

      <MediaCarousel media={post.media} />

      <View className="px-4 py-3">
        <Text className="text-gray-700 dark:text-gray-300">{post.text}</Text>
      </View>

      <View className="flex-row items-center gap-6 px-4 pb-4">
        <View className="flex-row items-center gap-1">
          <Heart size={18} color="#ef4444" />
          <Text className="text-gray-700 dark:text-gray-300">{post.likesCount}</Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center gap-1"
          onPress={() => setShowComments(true)}
        >
          <MessageCircle size={18} color="#6b7280" />
          <Text className="text-gray-700 dark:text-gray-300">{post.commentsCount}</Text>
        </TouchableOpacity>
      </View>

      <CommentsSheet
        isVisible={showComments}
        onClose={() => setShowComments(false)}
        postUser={post.user}
        postAvatar={post.avatar}
        postImage={post.media[0]?.url ?? ''}
        postCaption={post.text}
      />
    </View>
  );
}

export default memo(PostCard);
