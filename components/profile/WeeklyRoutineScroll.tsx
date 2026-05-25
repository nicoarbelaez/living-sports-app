import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { DAY_NAMES, type RoutineDay } from '@/features/profile/types';

interface WeeklyRoutineScrollProps {
  routine: Record<number, RoutineDay>;
  onDayPress: (dayOfWeek: number) => void;
}

export default function WeeklyRoutineScroll({ routine, onDayPress }: WeeklyRoutineScrollProps) {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = width - 64; // leave some peeking space

  return (
    <ScrollView
      horizontal
      pagingEnabled={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + 12}
      snapToAlignment="start"
    >
      {DAY_NAMES.map((_, index) => {
        const day = routine[index];
        const isRest = !day || day.isRest;
        const exercises = day?.exercises ?? [];

        const formatDuration = (sec: number | null | undefined): string => {
          if (!sec) return '';
          const mins = Math.floor(sec / 60);
          return `${mins} min`;
        };

        return (
          <TouchableOpacity
            key={index}
            activeOpacity={0.85}
            onPress={() => onDayPress(index)}
            style={{ width: CARD_WIDTH }}
            className={`rounded-3xl p-5 ${isRest ? 'bg-muted' : 'bg-secondary'}`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-muted-foreground text-xs">{DAY_NAMES[index]}</Text>
                <Text className="text-foreground text-lg font-bold">
                  {isRest ? 'Descanso' : (day?.title ?? 'Entrenamiento')}
                </Text>
              </View>

              <View
                className={`rounded-full px-3 py-1 ${isRest ? 'bg-muted-foreground/30' : 'bg-primary'}`}
              >
                <Text
                  className={`text-xs font-semibold ${isRest ? 'text-muted-foreground' : 'text-primary-foreground'}`}
                >
                  {isRest ? 'REST' : 'WORK'}
                </Text>
              </View>
            </View>

            {!isRest && exercises.length > 0 && (
              <View className="mt-4">
                {exercises.slice(0, 4).map((ex, i) => (
                  <Text
                    key={ex.id}
                    className="text-muted-foreground mt-1 text-sm"
                    numberOfLines={1}
                  >
                    {i + 1}. {ex.exercise.emoji ? `${ex.exercise.emoji} ` : ''}
                    {ex.exercise.name}
                  </Text>
                ))}
                {exercises.length > 4 && (
                  <Text className="text-muted-foreground mt-1 text-xs">
                    +{exercises.length - 4} más
                  </Text>
                )}
              </View>
            )}

            {!isRest && day?.durationSec && (
              <View className="mt-3 flex-row items-center gap-1">
                <Text className="text-muted-foreground text-xs">
                  {formatDuration(day.durationSec)}
                </Text>
              </View>
            )}

            {isRest && (
              <Text className="text-muted-foreground mt-4 text-sm">Recuperación total</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
