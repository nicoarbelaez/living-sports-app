import React, { useCallback } from 'react';
import { FlatList, View, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCompetitionsStore } from '@/stores/useCompetitionsStore';
import CompetitionCard from '@/components/competition/CompetitionCard';
import CreateCompetitionCard from '@/components/competition/CreateCompetitionCard';
import type { Competition } from '@/types/competition';

const EMPTY_LIST: Competition[] = [];

type ListItem = Competition | { __type: 'create' };

export default function CompetitionsTab({ groupId }: { groupId: string }) {
  const competitions = useCompetitionsStore((s) => s.competitions[groupId] ?? EMPTY_LIST);
  const isLoading = useCompetitionsStore((s) => s.isLoading);
  const fetch = useCompetitionsStore((s) => s.fetchGroupCompetitions);

  useFocusEffect(
    useCallback(() => {
      fetch(groupId);
    }, [groupId])
  );

  const data: ListItem[] = [...competitions, { __type: 'create' as const }];
  const numColumns = competitions.length === 0 ? 1 : 2;

  if (isLoading && competitions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  return (
    <FlatList<ListItem>
      key={numColumns}
      data={data}
      numColumns={numColumns}
      keyExtractor={(item, i) => ('id' in item ? item.id : `create-${i}`)}
      contentContainerStyle={{ padding: 8, paddingBottom: 100 }}
      renderItem={({ item }) => {
        if ('__type' in item) return <CreateCompetitionCard groupId={groupId} />;
        return <CompetitionCard competition={item} />;
      }}
    />
  );
}
