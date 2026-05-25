import { View, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavbarScroll } from '@/hooks/use-navbar-scroll';
import { useState, useCallback, useEffect } from 'react';
import { MotiView } from 'moti';
import { useFocusEffect } from 'expo-router';
import FeaturedCommunity from '@/components/community/FeaturedCommunity';
import CommunityCard from '@/components/community/CommunityCard';
import CreateCommunityButton from '@/components/community/CreateCommunityButton';
import { useGroupsStore } from '@/features/communities/stores/useGroupsStore';
import { useProfileStore } from '@/features/profile/stores/useProfileStore';
import { useAuth } from '@/providers/AuthProvider';
import { mapGroupToCommunity } from '@/features/communities/mappers';
import type { Community } from '@/types/community';

export default function Comunidades() {
  const { onScroll } = useNavbarScroll();
  const profile = useProfileStore((s) => s.profile);
  const { session } = useAuth();
  const currentUserId = session?.user?.id;

  const myGroups = useGroupsStore((s) => s.myGroups);
  const publicGroups = useGroupsStore((s) => s.publicGroups);
  const fetchMyGroups = useGroupsStore((s) => s.fetchMyGroups);
  const fetchPublicGroups = useGroupsStore((s) => s.fetchPublicGroups);

  const [searchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch on initial mount and when profile changes
  useEffect(() => {
    if (profile?.id) {
      setIsLoading(true);
      Promise.all([fetchMyGroups(profile.id), fetchPublicGroups()]).finally(() =>
        setIsLoading(false)
      );
    }
  }, [profile?.id, fetchMyGroups, fetchPublicGroups]);

  // Refetch on screen focus
  useFocusEffect(
    useCallback(() => {
      if (profile?.id) {
        fetchMyGroups(profile.id);
        fetchPublicGroups();
      }
    }, [profile?.id, fetchMyGroups, fetchPublicGroups])
  );

  // Convert groups to communities
  const myCommunities = myGroups.map(mapGroupToCommunity);
  const allPublicCommunities = publicGroups.map(mapGroupToCommunity);

  // Check if current user owns a community
  const ownedGroup = myGroups.find((g) => g.ownerId === currentUserId);
  const ownedCommunity: Community | null = ownedGroup ? mapGroupToCommunity(ownedGroup) : null;

  // Featured community: first public with most members
  const featuredCommunity =
    allPublicCommunities.length > 0 ? { ...allPublicCommunities[0], isFeatured: true } : null;

  const regularCommunities = allPublicCommunities.slice(1);

  const filteredCommunities = regularCommunities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSkeleton = () => (
    <View className="flex-1 px-6">
      <View className="mb-6">
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.7 }}
          transition={{ type: 'timing', duration: 1000, loop: true }}
          className="bg-muted mb-2 h-8 w-48 rounded-lg"
        />
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.7 }}
          transition={{ type: 'timing', duration: 1000, loop: true }}
          className="bg-muted mb-6 h-16 w-full rounded-lg"
        />
      </View>

      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 0.7 }}
        transition={{ type: 'timing', duration: 1000, loop: true }}
        className="bg-muted mb-8 h-36 rounded-3xl"
      />

      {[1, 2, 3].map((key) => (
        <MotiView
          key={key}
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.7 }}
          transition={{ type: 'timing', duration: 1000, loop: true, delay: key * 150 }}
          className="bg-muted mb-4 h-24 rounded-3xl"
        />
      ))}
    </View>
  );

  const renderEmpty = () => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="flex-1 items-center justify-center pt-12"
    >
      <Text className="text-muted-foreground text-lg font-medium">
        No se encontraron comunidades.
      </Text>
    </MotiView>
  );

  return (
    <View className="bg-background flex-1 pt-4">
      {isLoading && myGroups.length === 0 && publicGroups.length === 0 ? (
        renderSkeleton()
      ) : (
        <FlashList
          data={filteredCommunities}
          keyExtractor={(item) => item.id}
          estimatedItemSize={96}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, paddingTop: 16 }}
          ListHeaderComponent={
            <View className="mb-6">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-foreground text-4xl font-extrabold tracking-tight">
                  Comunidades
                </Text>
              </View>
              <Text className="text-muted-foreground mb-6 text-base leading-relaxed">
                Únete a una comunidad para estar atento a los temas que te interesan.
              </Text>

              {/* Create or "Mi comunidad" section */}
              <View className="mb-6">
                {ownedCommunity ? (
                  <MotiView
                    from={{ opacity: 0, translateY: 8 }}
                    animate={{ opacity: 1, translateY: 0 }}
                  >
                    <Text className="text-foreground mb-2 text-sm font-semibold">
                      Mi comunidad
                    </Text>
                    <CommunityCard community={ownedCommunity} />
                  </MotiView>
                ) : (
                  <CreateCommunityButton />
                )}
              </View>

              {/* Mis Comunidades Section */}
              {myCommunities.length > 0 && (
                <View className="mb-6">
                  <Text className="text-foreground mb-3 text-lg font-bold">Mis Comunidades</Text>
                  <FlashList
                    data={myCommunities}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    estimatedItemSize={320}
                    contentContainerStyle={{ paddingRight: 12 }}
                    renderItem={({ item }) => (
                      <View className="mr-3 w-80">
                        <CommunityCard community={item} />
                      </View>
                    )}
                  />
                </View>
              )}

              {/* Featured Community */}
              {featuredCommunity && !searchQuery && (
                <View className="-mx-6 mb-4">
                  <FeaturedCommunity community={featuredCommunity} />
                </View>
              )}

              {/* Explorar Comunidades Header */}
              {regularCommunities.length > 0 && (
                <Text className="text-foreground mb-3 text-lg font-bold">
                  Explorar Comunidades
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={renderEmpty}
          renderItem={({ item }) => <CommunityCard community={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
