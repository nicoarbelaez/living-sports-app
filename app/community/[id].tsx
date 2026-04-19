import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, Trophy, Plus, Medal } from 'lucide-react-native';
import { mockCommunities } from '@/constants/mockCommunities';
import { liftsPerCommunity, addLift } from '@/constants/mockLifts';
import { EXERCISES, Exercise, Lift } from '@/types/lift';
import LeaderboardCard from '@/components/community/LeaderboardCard';
import LogLiftModal from '@/components/community/LogLiftModal';

const MY_USER_ID = 'me';

export default function CommunityDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const community = mockCommunities.find((c) => c.id === id);
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(EXERCISES[0]);
  const [lifts, setLifts] = useState<Lift[]>(liftsPerCommunity[id ?? ''] ?? []);
  const [modalVisible, setModalVisible] = useState(false);

  // Refresh lifts when we come back here (e.g. after submitting)
  useFocusEffect(
    useCallback(() => {
      setLifts([...(liftsPerCommunity[id ?? ''] ?? [])]);
    }, [id])
  );

  if (!community) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-black">
        <Text className="mb-4 text-black dark:text-white">Comunidad no encontrada.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-full bg-blue-500 px-6 py-2"
        >
          <Text className="font-bold text-white">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Filter and sort leaderboard for the selected exercise (best lift per user)
  const leaderboard = Object.values(
    lifts
      .filter((l) => l.exerciseId === selectedExercise.id)
      .reduce<Record<string, Lift>>((acc, lift) => {
        const existing = acc[lift.userId];
        if (!existing || lift.weightKg > existing.weightKg) {
          acc[lift.userId] = lift;
        }
        return acc;
      }, {})
  ).sort((a, b) => b.weightKg - a.weightKg);

  const handleAddLift = (lift: Lift) => {
    addLift(id ?? '', lift);
    setLifts([...(liftsPerCommunity[id ?? ''] ?? [])]);
  };

  const renderHeader = () => (
    <>
      {/* Hero Header */}
      <View className="mb-4 bg-white pb-6 shadow-sm dark:bg-gray-900">
        <View className="relative h-36 bg-blue-100 dark:bg-blue-900/30">
          {community.avatarUrl && (
            <Image
              source={{ uri: community.avatarUrl }}
              className="absolute inset-0 h-full w-full opacity-40"
              blurRadius={10}
            />
          )}
          <View className="absolute inset-0 bg-black/40" />
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-4 h-10 w-10 items-center justify-center rounded-full bg-black/40"
          >
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="-mt-10 items-center px-6">
          {community.avatarUrl ? (
            <Image
              source={{ uri: community.avatarUrl }}
              className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-900"
            />
          ) : (
            <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gray-200 dark:border-gray-900 dark:bg-gray-700">
              <Text className="text-4xl">{community.emoji || '🏋️'}</Text>
            </View>
          )}
          <Text className="mt-2 text-2xl font-black text-black dark:text-white">
            {community.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <Trophy size={14} color="#3b82f6" />
            <Text className="text-sm font-semibold text-blue-500">
              {(community.followersCount / 1000).toFixed(1)}k competidores
            </Text>
          </View>
        </View>
      </View>

      {/* Exercise Filter Tabs */}
      <View className="mb-4">
        <Text className="mb-3 px-4 text-xs font-semibold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          Ejercicio
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {EXERCISES.map((ex) => {
            const isActive = ex.id === selectedExercise.id;
            return (
              <TouchableOpacity
                key={ex.id}
                onPress={() => setSelectedExercise(ex)}
                className={`flex-row items-center gap-2 rounded-full border px-4 py-2.5 ${
                  isActive
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                }`}
              >
                <Text style={{ fontSize: 16 }}>{ex.emoji}</Text>
                <Text
                  className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-black dark:text-white'}`}
                >
                  {ex.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Leaderboard title */}
      <View className="mb-3 flex-row items-center gap-2 px-4">
        <Medal size={18} color="#3b82f6" />
        <Text className="text-lg font-bold text-black dark:text-white">Leaderboard</Text>
        <Text className="ml-auto text-sm text-gray-400">{leaderboard.length} atletas</Text>
      </View>
    </>
  );

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.userId}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <LeaderboardCard
            lift={item}
            position={index + 1}
            isCurrentUser={item.userId === MY_USER_ID}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="mb-3 text-4xl">🏋️</Text>
            <Text className="text-base font-semibold text-gray-500 dark:text-gray-400">
              Nadie ha registrado {selectedExercise.name} aún.
            </Text>
            <Text className="mt-1 text-sm text-gray-400">¡Sé el primero!</Text>
          </View>
        }
      />

      {/* Floating Register Button */}
      <View className="absolute bottom-8 self-center">
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-row items-center gap-3 rounded-full bg-blue-500 px-8 py-4 shadow-xl"
          style={{
            shadowColor: '#3b82f6',
            shadowOpacity: 0.5,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
          }}
        >
          <Plus size={22} color="#fff" />
          <Text className="text-base font-black text-white">Registrar mi marca</Text>
        </TouchableOpacity>
      </View>

      <LogLiftModal
        visible={modalVisible}
        communityId={id ?? ''}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddLift}
      />
    </View>
  );
}
