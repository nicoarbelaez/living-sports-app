import React, { useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { useRouter } from 'expo-router';

type Post = {
  id: string;
  content: string;
  created_at: string;
  image_url?: string | null;
};

const mockPosts: Post[] = [
  {
    id: '1',
    content: 'Hoy fue un día brutal de pierna 🔥',
    created_at: '2026-04-18',
    image_url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e',
  },
  {
    id: '2',
    content: 'Subiendo pesos en banca 💪',
    created_at: '2026-04-17',
    image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
  },
];

const featuredExercises = [
  {
    id: '1',
    name: 'Press Banca',
    muscle: 'Pecho',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
    pr: '80 kg',
  },
  {
    id: '2',
    name: 'Sentadilla',
    muscle: 'Pierna',
    image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e',
    pr: '120 kg',
  },
  {
    id: '3',
    name: 'Curl Bíceps',
    muscle: 'Bíceps',
    image: 'https://images.unsplash.com/photo-1598971639058-9993f6f5e6d1',
    pr: '25 kg',
  },
];

export default function ProfileScreen() {
  const { session } = useAuth();
  const user = session?.user;
  const router = useRouter();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Usuario';

  const avatar = user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User';

  const displayPosts = mockPosts;

  const renderPost = ({ item }: { item: Post }) => (
    <View className="mb-6 rounded-3xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      {item.image_url && (
        <Image source={{ uri: item.image_url }} className="h-52 w-full rounded-2xl" />
      )}

      <Text className="mt-3 text-sm text-gray-700 dark:text-gray-300">{item.content}</Text>

      <View className="mt-3 flex-row justify-between">
        <Text className="text-xs text-gray-400">❤️ 34</Text>
        <Text className="text-xs text-gray-400">💬 2</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <FlatList
        data={displayPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        ListHeaderComponent={
          <View>
            <View className="mt-6 items-center rounded-3xl bg-white p-6 shadow-sm dark:bg-zinc-900">
              <Image
                source={{ uri: avatar }}
                className="h-24 w-24 rounded-full border-4 border-blue-600"
              />

              <Text className="mt-3 text-xl font-bold text-black dark:text-white">
                {displayName}
              </Text>

              <Text className="text-xs text-blue-600">POWERLIFTER • CALI</Text>

              <Text className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                Sin biografía aún
              </Text>
            </View>

            <View className="mt-6 flex-row justify-between gap-3">
              <View className="flex-1 items-center rounded-2xl bg-white p-4 dark:bg-zinc-900">
                <Text className="text-lg font-bold text-black dark:text-white">
                  {displayPosts.length}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">POSTS</Text>
              </View>

              <View className="flex-1 items-center rounded-2xl bg-white p-4 dark:bg-zinc-900">
                <Text className="text-lg font-bold text-black dark:text-white">10.923</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">SEGUIDORES</Text>
              </View>

              <View className="flex-1 items-center rounded-2xl bg-white p-4 dark:bg-zinc-900">
                <Text className="text-lg font-bold text-black dark:text-white">312</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">SIGUIENDO</Text>
              </View>
            </View>

            <Text className="mt-8 text-lg font-bold text-black dark:text-white">
              Ejercicios destacados
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
              {featuredExercises.map((item) => (
                <View
                  key={item.id}
                  className="mr-4 w-64 rounded-3xl bg-white p-4 shadow-sm dark:bg-zinc-900"
                >
                  <Image source={{ uri: item.image }} className="h-40 w-full rounded-2xl" />

                  <Text className="mt-3 text-base font-bold text-black dark:text-white">
                    {item.name}
                  </Text>

                  <Text className="text-xs text-gray-500 dark:text-gray-400">{item.muscle}</Text>

                  <View className="mt-3 flex-row justify-between">
                    <Text className="text-xs text-gray-400">PR personal</Text>
                    <Text className="text-sm font-bold text-blue-600">{item.pr}</Text>
                  </View>

                  <TouchableOpacity>
                    <View className="mt-4 items-center rounded-full bg-blue-600 py-3">
                      <Text className="font-bold text-white">Ver ejercicio</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <Text className="mt-8 text-lg font-bold text-black dark:text-white">
              Rutina semanal
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5">
              {[
                {
                  day: 'LUN',
                  full: 'Lunes',
                  routine: 'Push Day',
                  desc: 'Pecho • Tríceps • Hombro',
                  rest: false,
                },
                {
                  day: 'MAR',
                  full: 'Martes',
                  routine: 'Pull Day',
                  desc: 'Espalda • Bíceps',
                  rest: false,
                },
                {
                  day: 'MIÉ',
                  full: 'Miércoles',
                  routine: 'Leg Day',
                  desc: 'Pierna • Glúteo',
                  rest: false,
                },
                {
                  day: 'JUE',
                  full: 'Jueves',
                  routine: 'Push Ligero',
                  desc: 'Técnica • Volumen',
                  rest: false,
                },
                {
                  day: 'VIE',
                  full: 'Viernes',
                  routine: 'Pull Intenso',
                  desc: 'Fuerza • Espalda',
                  rest: false,
                },
                {
                  day: 'SÁB',
                  full: 'Sábado',
                  routine: 'Pierna Pro',
                  desc: 'Cuádriceps • Femoral',
                  rest: false,
                },
                {
                  day: 'DOM',
                  full: 'Domingo',
                  routine: 'Descanso',
                  desc: 'Recuperación total',
                  rest: true,
                },
              ].map((item, index) => (
                <View
                  key={index}
                  className={`mr-4 w-72 rounded-3xl p-5 ${
                    item.rest ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-white dark:bg-zinc-900'
                  } shadow-sm`}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-xs text-gray-400">{item.full}</Text>
                      <Text className="text-lg font-bold text-black dark:text-white">
                        {item.day}
                      </Text>
                    </View>

                    <View
                      className={`rounded-full px-3 py-1 ${
                        item.rest ? 'bg-gray-400' : 'bg-blue-600'
                      }`}
                    >
                      <Text className="text-xs font-semibold text-white">
                        {item.rest ? 'REST' : 'WORK'}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-6">
                    <Text
                      className={`text-xl font-bold ${
                        item.rest ? 'text-gray-500' : 'text-black dark:text-white'
                      }`}
                    >
                      {item.routine}
                    </Text>

                    <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {item.desc}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      if (!item.rest) {
                        router.push({
                          pathname: '/routine/[day]',
                          params: { day: item.day },
                        });
                      }
                    }}
                    className={`mt-8 items-center rounded-full py-3 ${
                      item.rest ? 'bg-gray-300 dark:bg-gray-700' : 'bg-blue-600'
                    }`}
                  >
                    <Text className={`font-semibold ${item.rest ? 'text-gray-600' : 'text-white'}`}>
                      {item.rest ? 'Descansar' : 'Ver rutina'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <Text className="mt-8 mb-4 text-lg font-bold text-black dark:text-white">Posts</Text>
          </View>
        }
      />
    </View>
  );
}
