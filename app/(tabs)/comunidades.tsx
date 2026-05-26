import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavbarScroll } from '@/hooks/use-navbar-scroll';
import { MotiView } from 'moti';
import { Search } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import CommunityCard from '@/components/community/CommunityCard';
import CreateCommunityButton from '@/components/community/CreateCommunityButton';
import { useProfileStore } from '@/features/profile/stores/useProfileStore';
import {
  usePublicCommunities,
  useMyMemberships,
  useMyOwnedCommunity,
} from '@/features/communities/hooks/useCommunityQueries';
import { useJoinCommunity } from '@/features/communities/hooks/useCommunityActions';
import CommunityListContext from '@/features/communities/contexts/CommunityListContext';

export default function Comunidades() {
  const { onScroll } = useNavbarScroll();
  const profile = useProfileStore((s) => s.profile);
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const qc = useQueryClient();

  const {
    data: communities = [],
    isLoading,
    isRefetching,
    refetch: refetchPublic,
  } = usePublicCommunities(profile?.id ?? undefined);

  const { data: joinedIdsData = [], refetch: refetchMemberships } = useMyMemberships(
    profile?.id ?? undefined
  );
  const joinedIds = useMemo(
    () => new Set<string>(Array.isArray(joinedIdsData) ? joinedIdsData : []),
    [joinedIdsData]
  );
  const { data: ownedCommunity, refetch: refetchOwned } = useMyOwnedCommunity(
    profile?.id ?? undefined
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchPublic(), refetchOwned(), refetchMemberships()]);
    setRefreshing(false);
  }, [refetchPublic, refetchOwned, refetchMemberships]);

  const joinMutation = useJoinCommunity();

  const filtered = searchQuery.trim()
    ? communities.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : communities;

  const handleJoin = async (groupId: string) => {
    setJoiningId(groupId);
    try {
      await joinMutation.mutateAsync(groupId);
      qc.invalidateQueries({ queryKey: ['communities', 'memberships', profile?.id] });
    } catch {
      // silenced — mutation handles error state
    } finally {
      setJoiningId(null);
    }
  };

  const renderSkeletons = () => (
    <View className="flex-1 px-6 pt-6">
      {[1, 2, 3, 4, 5].map((key) => (
        <MotiView
          key={key}
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.7 }}
          transition={{ type: 'timing', duration: 900, loop: true, delay: key * 80 }}
          className="bg-canvas mb-3 h-[72px] rounded-2xl"
        />
      ))}
    </View>
  );

  return (
    <CommunityListContext.Provider
      value={{ joinedIds, onJoin: handleJoin, joiningId, ownedGroupId: ownedCommunity?.id }}
    >
      <View className="bg-background flex-1">
        {isLoading ? (
          renderSkeletons()
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, paddingTop: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#9fe870"
                colors={['#9fe870']}
              />
            }
            ListHeaderComponent={
              <View className="mb-2">
                <Text className="text-foreground mb-1 text-4xl font-black tracking-tight">
                  Comunidades
                </Text>
                <Text className="text-muted-foreground mb-5 text-base leading-relaxed">
                  Únete a una comunidad y mantente al tanto de lo que te interesa.
                </Text>

                {/* Mi comunidad — solo si ya creé una */}
                {ownedCommunity ? (
                  <View className="mb-4">
                    <Text className="text-muted-foreground mb-2 text-xs font-semibold tracking-widest uppercase">
                      Mi comunidad
                    </Text>
                    <CommunityCard group={ownedCommunity} />
                  </View>
                ) : (
                  <CreateCommunityButton />
                )}

                {/* Search */}
                <View className="border-border bg-canvas mt-4 flex-row items-center gap-2 rounded-2xl border px-4 py-3">
                  <Search size={17} color="#868685" />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar comunidades..."
                    placeholderTextColor="#868685"
                    className="text-foreground flex-1 text-sm"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {isRefetching && <ActivityIndicator size="small" color="#868685" />}
                </View>

                {filtered.length > 0 && (
                  <Text className="text-muted-foreground mt-5 mb-2 text-xs font-semibold tracking-widest uppercase">
                    Explorar · {filtered.length}{' '}
                    {filtered.length === 1 ? 'comunidad' : 'comunidades'}
                  </Text>
                )}
              </View>
            }
            ListEmptyComponent={
              <MotiView
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                className="items-center pt-16"
              >
                <Text className="text-muted-foreground text-base">
                  {searchQuery.trim()
                    ? 'No se encontraron comunidades.'
                    : 'No hay otras comunidades disponibles.'}
                </Text>
              </MotiView>
            }
            renderItem={({ item }) => <CommunityCard group={item} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </CommunityListContext.Provider>
  );
}
