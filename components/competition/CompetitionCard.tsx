import React from 'react';
import { View, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Dumbbell } from 'lucide-react-native';
import type { Competition } from '@/types/competition';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  active: 'default',
  draft: 'secondary',
  finished: 'outline',
  cancelled: 'destructive',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  draft: 'Borrador',
  finished: 'Finalizada',
  cancelled: 'Cancelada',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function CompetitionCard({ competition }: { competition: Competition }) {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const iconColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/competition/${competition.id}` as any)}
      className="m-1 flex-1"
    >
      <Card className="rounded-2xl">
        <CardHeader>
          <Badge variant={STATUS_VARIANT[competition.status] ?? 'secondary'} className="self-start">
            {STATUS_LABELS[competition.status] ?? 'Borrador'}
          </Badge>
          <CardTitle className="text-sm leading-tight" numberOfLines={2}>
            {competition.title}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <View className="flex-row items-center gap-1">
            <Dumbbell size={12} color={iconColor} />
            <Text className="text-muted-foreground self-end text-xs" numberOfLines={1}>
              {competition.exerciseName}
            </Text>
          </View>
        </CardContent>

        <CardFooter className="flex-row items-center gap-1">
          <Calendar size={12} color={iconColor} />
          <Text className="text-muted-foreground text-xs">
            {formatDate(competition.startDate)} – {formatDate(competition.endDate)}
          </Text>
        </CardFooter>
      </Card>
    </TouchableOpacity>
  );
}
