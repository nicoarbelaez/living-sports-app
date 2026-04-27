import React from 'react';
import { View, Text } from 'react-native';
import AvatarWithEmoji from '@/components/ui/avatar-with-emoji';
import type { RankingEntry } from '@/types/competition';

export default function RankingRow({
  entry,
  position,
  isCurrentUser,
}: {
  entry: RankingEntry;
  position: number;
  isCurrentUser: boolean;
}) {
  return (
    <View
      className={`mb-2 flex-row items-center gap-3 rounded-2xl px-4 py-3 ${
        isCurrentUser ? 'bg-blue-50 dark:bg-blue-950/40' : 'bg-white dark:bg-gray-900'
      }`}
    >
      <Text className="w-7 text-center text-sm font-bold text-gray-500 dark:text-gray-400">
        #{position}
      </Text>

      <AvatarWithEmoji
        imageUrl={entry.avatarUrl}
        fallback={entry.username[0]?.toUpperCase() ?? '?'}
        size="sm"
      />

      <Text className="flex-1 text-sm font-semibold text-black dark:text-white" numberOfLines={1}>
        {entry.username}
        {isCurrentUser && <Text className="font-normal text-blue-500"> (tú)</Text>}
      </Text>

      <Text className="text-sm font-bold text-blue-600 dark:text-blue-400">{entry.points} pts</Text>
    </View>
  );
}
