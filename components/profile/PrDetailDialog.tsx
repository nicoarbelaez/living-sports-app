import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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

interface PrDetailDialogProps {
  pr: PersonalRecord | null;
  onClose: () => void;
}

export default function PrDetailDialog({ pr, onClose }: PrDetailDialogProps) {
  const unit = pr ? getUnit(pr.exercise.name) : 'kg';

  return (
    <Dialog open={!!pr} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {pr && (
          <View className="p-4">
            {pr.mediaUrl && (
              <Image
                source={{ uri: pr.mediaUrl }}
                style={{ width: '100%', height: 200 }}
                contentFit="cover"
                className="rounded-xl"
              />
            )}
            <Text className="text-foreground mt-3 text-xl font-bold">
              {pr.exercise.emoji ? `${pr.exercise.emoji} ` : ''}
              {pr.exercise.name}
            </Text>
            <Text className="text-muted-foreground text-lg">
              {pr.value} {unit}
            </Text>
            {pr.description && <Text className="text-foreground mt-2">{pr.description}</Text>}
          </View>
        )}
      </DialogContent>
    </Dialog>
  );
}
