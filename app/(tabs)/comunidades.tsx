import { View, Text, FlatList } from 'react-native';
import { useNavbarScroll } from '@/hooks/use-navbar-scroll';
import { useState, useEffect, useCallback } from 'react';
import { MotiView } from 'moti';
import FeaturedCommunity from '@/components/community/FeaturedCommunity';
import CommunityCard from '@/components/community/CommunityCard';
import CreateCommunityButton from '@/components/community/CreateCommunityButton';
import { mockCommunities } from '@/constants/mockCommunities';
import { useFocusEffect } from 'expo-router';
import { Community } from '@/types/community';

export default function Comunidades() {
  const { onScroll } = useNavbarScroll();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [localCommunities, setLocalCommunities] = useState<Community[]>(mockCommunities);

  useFocusEffect(
    useCallback(() => {
      setLocalCommunities([...mockCommunities]);
    }, [])
  );

  // Loading skeleton simulation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const featuredCommunity = localCommunities.find((c) => c.isFeatured);
  const regularCommunities = localCommunities.filter((c) => !c.isFeatured);

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
          className="mb-2 h-8 w-48 rounded-lg bg-gray-300 dark:bg-gray-800"
        />
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.7 }}
          transition={{ type: 'timing', duration: 1000, loop: true }}
          className="mb-6 h-16 w-full rounded-lg bg-gray-300 dark:bg-gray-800"
        />
      </View>

      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 0.7 }}
        transition={{ type: 'timing', duration: 1000, loop: true }}
        className="mb-8 h-36 rounded-3xl bg-gray-300 dark:bg-gray-800"
      />

      {[1, 2, 3].map((key) => (
        <MotiView
          key={key}
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.7 }}
          transition={{ type: 'timing', duration: 1000, loop: true, delay: key * 150 }}
          className="mb-4 h-24 rounded-3xl bg-gray-300 dark:bg-gray-800"
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
      <Text className="text-lg font-medium text-gray-500 dark:text-gray-400">
        No se encontraron comunidades.
      </Text>
    </MotiView>
  );

  return (
    <View className="flex-1 bg-gray-100 pt-4 dark:bg-black">
      {isLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={filteredCommunities}
          keyExtractor={(item) => item.id}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, paddingTop: 16 }}
          ListHeaderComponent={
            <View className="mb-6">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-4xl font-extrabold tracking-tight text-black dark:text-white">
                  Comunidades
                </Text>
              </View>
              <Text className="mb-6 text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Únete a una comunidad para estar atento a los temas que te interesan y comenzar a
                interactuar.
              </Text>

              <View className="mb-6">
                <CreateCommunityButton />
              </View>

              {featuredCommunity && !searchQuery && (
                <View className="-mx-6 mb-4">
                  <FeaturedCommunity community={featuredCommunity} />
                </View>
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
