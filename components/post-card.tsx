import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import MediaCarousel from './media-carousel';
import { Image } from 'expo-image';
import CommentsSheet from './comments-sheet';
import { Post, Media } from '@/types/post';
import { getRandomAvatarUrl } from '@/lib/utils';

interface PostCardProps {
  user: string;
  time: string;
  avatar: string;
  media: Media[];
  text: string;
}

export default function PostCard({ user, time, avatar, media, text }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  const finalAvatar =
    !avatar || avatar.includes('avatars.githubusercontent.com') ? getRandomAvatarUrl(user) : avatar;

  return (
    <View className="mx-4 mt-3 overflow-hidden rounded-2xl bg-white shadow">
      <View className="flex-row items-center px-4 py-3">
        <Image
          source={{ uri: finalAvatar }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
          contentFit="cover"
        />

        <View className="ml-3">
          <Text className="font-semibold text-gray-900">{user}</Text>
          <Text className="text-xs text-gray-500">{time}</Text>
        </View>
      </View>

      <MediaCarousel media={media} />

      <View className="px-4 py-3">
        <Text className="text-gray-700">{text}</Text>
      </View>

      <View className="flex-row items-center gap-6 px-4 pb-4">
        <View className="flex-row items-center gap-1">
          <Heart size={18} color="#ef4444" />
          <Text>34</Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center gap-1"
          onPress={() => setShowComments(true)}
        >
          <MessageCircle size={18} color="#6b7280" />
          <Text>2</Text>
        </TouchableOpacity>
      </View>

      <CommentsSheet
        isVisible={showComments}
        onClose={() => setShowComments(false)}
        postUser={user || ''}
        postAvatar={avatar || ''}
        postImage={media?.[0]?.url || ''}
        postCaption={text || ''}
      />
    </View>
  );
}
