import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { supabase } from '@/lib/supabase';

interface RankingRow {
  userId: string;
  username: string;
  avatarUrl: string | null;
  points: number;
  movement?: 'up' | 'down' | 'none';
}

type RankingTab = 'competition' | 'weekly' | 'total';

interface RankingListProps {
  groupId: string;
  competitionId?: string;
}

async function fetchRanking(
  groupId: string,
  tab: RankingTab,
  competitionId?: string
): Promise<RankingRow[]> {
  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/competition-ranking?group_id=${encodeURIComponent(groupId)}&type=${encodeURIComponent(tab)}${competitionId ? `&competition_id=${encodeURIComponent(competitionId)}` : ''}`;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.ranking ?? json;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function MovementIndicator({ movement }: { movement?: 'up' | 'down' | 'none' }) {
  if (movement === 'up') return <Text className="text-xs font-bold text-green-500">▲</Text>;
  if (movement === 'down') return <Text className="text-xs font-bold text-red-500">▼</Text>;
  return <Text className="text-xs text-gray-400">▬</Text>;
}

export default function RankingList({ groupId, competitionId }: RankingListProps) {
  const [activeTab, setActiveTab] = useState<RankingTab>(competitionId ? 'competition' : 'weekly');
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchRanking(groupId, activeTab, competitionId)
      .then(setRanking)
      .finally(() => setLoading(false));
  }, [groupId, activeTab, competitionId]);

  const tabs: { key: RankingTab; label: string }[] = [
    ...(competitionId ? [{ key: 'competition' as RankingTab, label: 'Competencia' }] : []),
    { key: 'weekly', label: 'Semanal' },
    { key: 'total', label: 'Total' },
  ];

  return (
    <View className="flex-1">
      {/* Tab bar */}
      <View className="flex-row border-b border-border px-4 pt-4">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`mr-4 pb-2 ${
              activeTab === tab.key ? 'border-b-2 border-primary' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === tab.key ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlashList
          data={ranking}
          keyExtractor={(item) => item.userId}
          estimatedItemSize={64}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-muted-foreground text-sm">Sin datos de ranking aún.</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const position = index + 1;
            const isTop3 = position <= 3;
            const medalEmoji = position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉';

            return (
              <View className="mb-2 flex-row items-center gap-3 rounded-2xl bg-secondary/50 px-4 py-3">
                {/* Position */}
                <View className="w-8 items-center">
                  {isTop3 ? (
                    <Text className="text-lg">{medalEmoji}</Text>
                  ) : (
                    <Text className="text-sm font-bold text-muted-foreground">{position}</Text>
                  )}
                </View>

                {/* Avatar */}
                {item.avatarUrl ? (
                  <Image
                    source={{ uri: item.avatarUrl }}
                    className="h-9 w-9 rounded-full"
                  />
                ) : (
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <Text className="text-sm font-bold text-muted-foreground">
                      {item.username?.[0]?.toUpperCase() ?? '?'}
                    </Text>
                  </View>
                )}

                {/* Username */}
                <Text className="flex-1 text-sm font-medium text-foreground">
                  @{item.username}
                </Text>

                {/* Movement */}
                <MovementIndicator movement={item.movement} />

                {/* Points */}
                <View className="min-w-12 items-end">
                  <Text className="text-sm font-bold text-foreground">{item.points}</Text>
                  <Text className="text-xs text-muted-foreground">pts</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
