import React from 'react';
import { View, Text } from 'react-native';
import AvatarWithEmoji from '@/components/ui/avatar-with-emoji';
import type { RankingEntry } from '@/types/competition';

const PODIUM = [
  { pos: 1, color: '#FFD700', bg: 'bg-yellow-100 dark:bg-yellow-900/30', height: 100, label: '🥇' },
  { pos: 2, color: '#C0C0C0', bg: 'bg-gray-100 dark:bg-gray-800', height: 72, label: '🥈' },
  { pos: 3, color: '#CD7F32', bg: 'bg-orange-100 dark:bg-orange-900/30', height: 56, label: '🥉' },
];

// Render order: 2nd left, 1st center, 3rd right
const RENDER_ORDER = [1, 0, 2];

export default function Podium({ top3 }: { top3: RankingEntry[] }) {
  if (top3.length === 0) {
    return (
      <View className="items-center py-10">
        <Text className="text-3xl">🏆</Text>
        <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sin clasificados aún</Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-end justify-center gap-3 px-4 pt-6 pb-4">
      {RENDER_ORDER.map((podiumIdx) => {
        const config = PODIUM[podiumIdx];
        const entry = top3[podiumIdx];
        if (!entry) return <View key={config.pos} className="flex-1" />;

        return (
          <View key={config.pos} className="flex-1 items-center">
            <AvatarWithEmoji
              imageUrl={entry.avatarUrl}
              fallback={entry.username[0]?.toUpperCase() ?? '?'}
              size="md"
            />
            <Text
              className="mt-1 w-full text-center text-xs font-semibold text-black dark:text-white"
              numberOfLines={1}
            >
              {entry.username}
            </Text>
            <Text className="mb-1 text-xs text-gray-500 dark:text-gray-400">
              {entry.points} pts
            </Text>
            <View
              className={`w-full items-center justify-center rounded-t-xl ${config.bg}`}
              style={{ height: config.height }}
            >
              <Text style={{ fontSize: 24 }}>{config.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
