import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import type { PersonalRecord } from '@/features/profile/types';

function getUnit(exerciseName: string): string {
  const lower = exerciseName.toLowerCase();
  if (
    lower.includes('barra') ||
    lower.includes('mancuerna') ||
    lower.includes('banca') ||
    lower.includes('sentadilla') ||
    lower.includes('muerto') ||
    lower.includes('remo')
  ) {
    return 'kg';
  }
  if (lower.includes('dominadas') || lower.includes('curl')) {
    return 'reps';
  }
  return 'kg';
}

interface PrCardProps {
  pr: PersonalRecord;
  onPress: () => void;
  style?: object;
}

function PrCard({ pr, onPress, style }: PrCardProps) {
  const unit = getUnit(pr.exercise.name);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={style}
      className="bg-secondary overflow-hidden rounded-2xl"
    >
      {pr.mediaUrl && pr.mediaType === 'image' ? (
        <Image
          source={{ uri: pr.mediaUrl }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
        />
      ) : null}
      <View className="bg-foreground/40 absolute inset-0 rounded-2xl" />
      <View className="flex-1 justify-end p-3">
        {pr.exercise.emoji ? <Text className="text-lg">{pr.exercise.emoji}</Text> : null}
        <Text className="text-primary-foreground text-xs font-semibold" numberOfLines={1}>
          {pr.exercise.name}
        </Text>
        <Text className="text-primary-foreground text-base font-bold">
          {pr.value} {unit}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface AddPrCardProps {
  onPress: () => void;
  style?: object;
}

function AddPrCard({ onPress, style }: AddPrCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={style}
      className="border-border bg-muted items-center justify-center rounded-2xl border-2 border-dashed"
    >
      <Plus size={24} color="#868685" />
      <Text className="text-muted-foreground mt-1 text-xs">Agregar PR</Text>
    </TouchableOpacity>
  );
}

interface PrBentoGridProps {
  prs: PersonalRecord[];
  isOwner: boolean;
  onAddPr: () => void;
  onPressPr: (pr: PersonalRecord) => void;
}

export default function PrBentoGrid({ prs, isOwner, onAddPr, onPressPr }: PrBentoGridProps) {
  const { width } = useWindowDimensions();
  const containerWidth = width - 32; // px-4 each side
  const colWidth = (containerWidth - 8) / 2; // 8px gap
  const totalHeight = 248;
  const rowHeight = (totalHeight - 8) / 2; // 8px gap between rows

  const pr0 = prs[0] ?? null;
  const pr1 = prs[1] ?? null;
  const pr2 = prs[2] ?? null;

  const canAdd = isOwner && prs.length < 3;

  return (
    <View style={{ height: totalHeight, flexDirection: 'row', gap: 8 }}>
      {/* Left column — big card (double height) */}
      <View style={{ width: colWidth }}>
        {pr0 ? (
          <PrCard
            pr={pr0}
            onPress={() => onPressPr(pr0)}
            style={{ height: totalHeight, borderRadius: 16 }}
          />
        ) : canAdd ? (
          <AddPrCard onPress={onAddPr} style={{ height: totalHeight, borderRadius: 16 }} />
        ) : (
          <View
            style={{ height: totalHeight, borderRadius: 16 }}
            className="bg-muted rounded-2xl"
          />
        )}
      </View>

      {/* Right column — two small cards */}
      <View style={{ width: colWidth, gap: 8 }}>
        {/* Top right */}
        {pr1 ? (
          <PrCard
            pr={pr1}
            onPress={() => onPressPr(pr1)}
            style={{ height: rowHeight, borderRadius: 16 }}
          />
        ) : canAdd ? (
          <AddPrCard onPress={onAddPr} style={{ height: rowHeight, borderRadius: 16 }} />
        ) : (
          <View style={{ height: rowHeight, borderRadius: 16 }} className="bg-muted rounded-2xl" />
        )}

        {/* Bottom right */}
        {pr2 ? (
          <PrCard
            pr={pr2}
            onPress={() => onPressPr(pr2)}
            style={{ height: rowHeight, borderRadius: 16 }}
          />
        ) : canAdd && prs.length >= 1 ? (
          <AddPrCard onPress={onAddPr} style={{ height: rowHeight, borderRadius: 16 }} />
        ) : (
          <View style={{ height: rowHeight, borderRadius: 16 }} className="bg-muted rounded-2xl" />
        )}
      </View>
    </View>
  );
}
