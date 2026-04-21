import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, Users } from 'lucide-react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from '@/providers/theme';
import CompetitionsTab from '@/components/community/tabs/CompetitionsTab';
import RankingTab from '@/components/community/tabs/RankingTab';
import {
  fetchCommunityDetail,
  type GroupDetail,
} from '@/features/communities/services/fetchCommunityDetail';

const Tab = createMaterialTopTabNavigator();

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      setLoading(true);
      fetchCommunityDetail(id).then((data) => {
        setGroup(data);
        setLoading(false);
      });
    }, [id])
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-black">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!group) {
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

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      {/* Hero Header */}
      <View className="bg-white pb-4 shadow-sm dark:bg-gray-900">
        <View className="relative h-32 bg-blue-100 dark:bg-blue-900/30">
          {group.image_url && (
            <Image
              source={{ uri: group.image_url }}
              className="absolute inset-0 h-full w-full opacity-40"
              blurRadius={10}
            />
          )}
          <View className="absolute inset-0 bg-black/30" />
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-4 h-10 w-10 items-center justify-center rounded-full bg-black/40"
          >
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="-mt-10 items-center px-6">
          {group.image_url ? (
            <Image
              source={{ uri: group.image_url }}
              className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-900"
            />
          ) : (
            <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gray-200 dark:border-gray-900 dark:bg-gray-700">
              <Text style={{ fontSize: 36 }}>{group.emoji ?? '🏋️'}</Text>
            </View>
          )}

          <Text className="mt-2 text-2xl font-black text-black dark:text-white">{group.name}</Text>

          <View className="mt-1 flex-row items-center gap-1">
            <Users size={14} color="#6b7280" />
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {group.members_count} miembros
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
          tabBarIndicatorStyle: { backgroundColor: '#3b82f6', height: 2 },
          tabBarStyle: {
            backgroundColor: isDark ? '#111827' : '#ffffff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#1f2937' : '#f3f4f6',
          },
          tabBarLabelStyle: { fontWeight: '700', fontSize: 16, textTransform: 'none' },
        }}
      >
        <Tab.Screen name="Competiciones">{() => <CompetitionsTab groupId={group.id} />}</Tab.Screen>
        <Tab.Screen name="Ranking">{() => <RankingTab groupId={group.id} />}</Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}
