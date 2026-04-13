import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Community } from '@/types/community';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { useRouter } from 'expo-router';

export default function FeaturedCommunity({ community }: { community: Community }) {
  const [isJoined, setIsJoined] = useState(false);
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/community/${community.id}` as any)}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mx-6 mt-4 overflow-hidden rounded-3xl bg-zinc-900 p-5 shadow-2xl"
      >
        <View className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />

        <View className="mb-4 flex-row items-center">
          <View className="mr-auto rounded-full bg-blue-500 px-3 py-1">
            <Text className="text-xs font-bold tracking-wider text-zinc-950 uppercase">
              Destacada
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-4">
          <Image
            source={{ uri: community.avatarUrl }}
            className="h-20 w-20 rounded-full border-2 border-blue-500"
          />
          <View className="flex-1">
            <Text className="mb-1 text-xl font-bold text-zinc-100">{community.name}</Text>
            <Text className="mb-3 text-sm text-zinc-400">
              {(community.followersCount / 1000).toFixed(1)}k seguidores
            </Text>

            <TouchableOpacity onPress={() => setIsJoined(!isJoined)}>
              <MotiView
                animate={{
                  backgroundColor: isJoined ? '#27272a' : '#3b82f6',
                }}
                className="items-center justify-center self-start rounded-full px-6 py-2.5"
              >
                <AnimatePresence exitBeforeEnter>
                  {isJoined ? (
                    <MotiText
                      key="joined"
                      from={{ opacity: 0, translateY: -10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0, translateY: 10 }}
                      className="font-semibold text-zinc-100"
                    >
                      Unido
                    </MotiText>
                  ) : (
                    <MotiText
                      key="join"
                      from={{ opacity: 0, translateY: 10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0, translateY: -10 }}
                      className="font-bold text-zinc-950"
                    >
                      Unirse
                    </MotiText>
                  )}
                </AnimatePresence>
              </MotiView>
            </TouchableOpacity>
          </View>
        </View>
      </MotiView>
    </TouchableOpacity>
  );
}
