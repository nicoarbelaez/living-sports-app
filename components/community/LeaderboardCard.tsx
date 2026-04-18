import React from 'react';
import { View, Text, Image } from 'react-native';
import { Lift } from '@/types/lift';

interface Props {
  lift: Lift;
  position: number;
  isCurrentUser?: boolean;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const MEDAL_BG = [
  'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
  'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700',
];

export default function LeaderboardCard({ lift, position, isCurrentUser = false }: Props) {
  const isPodium = position <= 3;
  const medal = MEDALS[position - 1];
  const medalColor = MEDAL_COLORS[position - 1];
  const medalBg = MEDAL_BG[position - 1];

  return (
    <View
      className={`mb-3 flex-row items-center rounded-2xl border px-4 py-3 ${
        isCurrentUser
          ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
          : isPodium
            ? `${medalBg}`
            : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'
      }`}
    >
      {/* Posición */}
      <View className="w-10 items-center">
        {isPodium ? (
          <Text style={{ fontSize: 22 }}>{medal}</Text>
        ) : (
          <Text
            className="text-base font-bold text-gray-400 dark:text-gray-500"
            style={{ color: isCurrentUser ? '#3b82f6' : undefined }}
          >
            {position}
          </Text>
        )}
      </View>

      {/* Avatar */}
      <Image
        source={{ uri: lift.avatarUrl }}
        className="mr-3 h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800"
      />

      {/* Nombre y reps */}
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            className={`text-base font-bold ${isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-black dark:text-white'}`}
          >
            {lift.userName}
          </Text>
          {isCurrentUser && (
            <View className="rounded-full bg-blue-500 px-2 py-0.5">
              <Text className="text-xs font-semibold text-white">Tú</Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-gray-500 dark:text-gray-400">{lift.reps} reps</Text>
      </View>

      {/* Peso */}
      <View className="items-end">
        <Text
          className="text-2xl font-black"
          style={{ color: isPodium ? medalColor : isCurrentUser ? '#3b82f6' : '#6b7280' }}
        >
          {lift.weightKg}
        </Text>
        <Text className="text-xs font-medium text-gray-400">kg</Text>
      </View>
    </View>
  );
}
