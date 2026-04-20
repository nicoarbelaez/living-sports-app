import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Community } from '@/types/community';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import AvatarWithEmoji from '@/components/ui/avatar-with-emoji';

export default function CommunityCard({
  community,
  emoji,
}: {
  community: Community;
  emoji?: string;
}) {
  const router = useRouter();
  const displayEmoji = emoji || community.emoji || '🏋️';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/community/${community.id}` as any)}
    >
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="mb-4 flex-row items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <AvatarWithEmoji imageUrl={community.avatarUrl} emoji={displayEmoji} size="lg" />

        <View className="flex-1">
          <Text className="mb-0.5 text-lg font-bold text-black dark:text-white">
            {community.name}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {(community.followersCount / 1000).toFixed(1)}k seguidores
          </Text>
        </View>
      </MotiView>
    </TouchableOpacity>
  );
}
