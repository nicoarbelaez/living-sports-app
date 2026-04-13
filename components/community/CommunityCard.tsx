import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Community } from '@/types/community';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { useRouter } from 'expo-router';

export default function CommunityCard({ community }: { community: Community }) {
  const [isJoined, setIsJoined] = useState(false);
  const router = useRouter();

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
        <Image
          source={{ uri: community.avatarUrl }}
          className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-800"
        />
        <View className="flex-1">
          <Text className="mb-0.5 text-lg font-bold text-black dark:text-white">
            {community.name}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {(community.followersCount / 1000).toFixed(1)}k seguidores
          </Text>
        </View>

        <TouchableOpacity onPress={() => setIsJoined(!isJoined)} activeOpacity={0.7}>
          <MotiView
            animate={{
              backgroundColor: isJoined ? '#3f3f46' : '#3b82f6',
              width: isJoined ? 85 : 80,
            }}
            transition={{ type: 'spring', damping: 15 }}
            className="h-10 items-center justify-center overflow-hidden rounded-full"
          >
            <AnimatePresence exitBeforeEnter>
              {isJoined ? (
                <MotiText
                  key="joined"
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-sm font-semibold text-white"
                >
                  Unido
                </MotiText>
              ) : (
                <MotiText
                  key="join"
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-sm font-bold text-zinc-950"
                >
                  Unirse
                </MotiText>
              )}
            </AnimatePresence>
          </MotiView>
        </TouchableOpacity>
      </MotiView>
    </TouchableOpacity>
  );
}
