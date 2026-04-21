import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import Podium from '@/components/competition/Podium';
import RankingRow from '@/components/competition/RankingRow';
import type { RankingEntry } from '@/types/competition';

type RankingFilter = 'total' | 'weekly';

async function fetchRanking(groupId: string, filter: RankingFilter): Promise<RankingEntry[]> {
  let query = supabase
    .from('competition_entries')
    .select(
      'user_id, profiles!competition_entries_user_id_fkey(username, avatar_url), competitions!inner(group_id)'
    )
    .eq('validation_status', 'approved')
    .eq('competitions.group_id', groupId);

  if (filter === 'weekly') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('created_at', weekAgo);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const counts: Record<string, { username: string; avatarUrl: string | null; count: number }> = {};
  for (const row of data as any[]) {
    const uid = row.user_id;
    if (!counts[uid]) {
      counts[uid] = {
        username: row.profiles?.username ?? 'Usuario',
        avatarUrl: row.profiles?.avatar_url ?? null,
        count: 0,
      };
    }
    counts[uid].count += 1;
  }

  return Object.entries(counts)
    .map(([userId, v]) => ({
      userId,
      username: v.username,
      avatarUrl: v.avatarUrl,
      points: v.count,
    }))
    .sort((a, b) => b.points - a.points);
}

export default function RankingTab({ groupId }: { groupId: string }) {
  const { session } = useAuth();
  const [filter, setFilter] = useState<RankingFilter>('total');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchRanking(groupId, filter)
      .then(setRanking)
      .finally(() => setIsLoading(false));
  }, [groupId, filter]);

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);
  const currentUserId = session?.user?.id;

  return (
    <FlatList
      data={rest}
      keyExtractor={(item) => item.userId}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      ListHeaderComponent={
        <View>
          {/* Toggle */}
          <View className="mt-4 mb-2 flex-row self-center rounded-full bg-gray-100 p-1 dark:bg-gray-800">
            {(['total', 'weekly'] as RankingFilter[]).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`rounded-full px-5 py-1.5 ${
                  filter === f ? 'bg-white shadow-sm dark:bg-gray-700' : ''
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    filter === f
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {f === 'total' ? 'Total' : 'Esta semana'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator color="#3b82f6" />
            </View>
          ) : (
            <Podium top3={top3} />
          )}

          {rest.length > 0 && (
            <Text className="mt-2 mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Clasificación completa
            </Text>
          )}
        </View>
      }
      renderItem={({ item, index }) => (
        <RankingRow
          entry={item}
          position={index + 4}
          isCurrentUser={item.userId === currentUserId}
        />
      )}
    />
  );
}
