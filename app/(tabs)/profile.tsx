import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

import { supabase } from '@/lib/supabase';
import PostCard from '@/components/feed/post-card';
import ExerciseModal from '@/components/profile/exercise-modal';
import { formatRelativeTime, getRandomAvatarUrl } from '@/lib/utils';
import { getProfileFullName } from '@/types/post';
import type { Post, PostRow } from '@/types/post';

const PAGE_SIZE = 15;

const POST_SELECT = `
  id,
  body,
  created_at,
  likes_count,
  comments_count,
  profiles (
    username,
    first_name,
    last_name,
    avatar_url
  ),
  post_media (
    url,
    media_type,
    sort_order
  )
` as const;

function rowToPost(row: PostRow): Post {
  const profile = row.profiles;
  const username = getProfileFullName(profile);
  const avatarSeed = profile?.username ?? username;
  const avatar =
    profile?.avatar_url && !profile.avatar_url.includes('avatars.githubusercontent.com')
      ? profile.avatar_url
      : getRandomAvatarUrl(avatarSeed);

  const media = [...(row.post_media ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => ({
      url: m.url,
      type: (m.media_type === 'video' ? 'video' : 'image') as 'image' | 'video',
    }));

  return {
    id: row.id,
    user: username,
    time: formatRelativeTime(row.created_at),
    createdAt: row.created_at,
    avatar,
    media,
    text: row.body ?? '',
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
  };
}

const featuredExercises = [
  {
    id: '1',
    name: 'Press Banca',
    muscle: 'Pecho',
    image:
      'https://www.myprotein.es/images?url=https://blogscdn.thehut.net/app/uploads/sites/450/2016/09/bench-press_1595337964_1595417256.jpg&auto=avif&width=700&fit=crop',
    pr: '135 kg',
    description:
      'Ejercicio compuesto fundamental para desarrollar la fuerza y el tamaño del pecho, hombros y tríceps.',
    type: 'Fuerza / Hipertrofia',
  },
  {
    id: '2',
    name: 'Sentadilla',
    muscle: 'Pierna',
    image: 'https://media.hearstapps.com/loop/coleman-ronnie-1645715649.mp4/poster.jpg',
    pr: '350 kg',
    description:
      'El rey de los ejercicios de tren inferior. Trabaja cuádriceps, glúteos y fortalece toda tu zona central (core).',
    type: 'Fuerza / Hipertrofia',
  },
  {
    id: '3',
    name: 'Curl Bíceps',
    muscle: 'Bíceps',
    image: 'https://intowellness.in/wp-content/uploads/2024/10/Into_Wellness_Biceps_Curl.jpg',
    pr: '60 kg',
    description:
      'Ejercicio de aislamiento perfecto para maximizar el desarrollo de los bíceps y antebrazos.',
    type: 'Aislamiento',
  },
];

export default function ProfileScreen() {
  const { session } = useAuth();
  const user = session?.user;
  const router = useRouter();

  const [posts, setPosts] = React.useState<Post[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedExercise, setSelectedExercise] = React.useState<
    (typeof featuredExercises)[0] | null
  >(null);

  const fetchUserPosts = React.useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = (data ?? []) as PostRow[];
      setPosts(rows.map(rowToPost));
    } catch (err) {
      console.error('[ProfileScreen] Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserPosts();
    }, [fetchUserPosts])
  );

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Usuario';

  const avatar = user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User';

  const renderPost = ({ item }: { item: Post }) => <PostCard post={item} />;

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        onRefresh={fetchUserPosts}
        refreshing={isLoading}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View className="mt-10 items-center py-10">
              <Text className="text-gray-500 dark:text-gray-400">No has publicado nada aún</Text>
            </View>
          ) : null
        }
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
                <Text className="text-lg font-bold text-black dark:text-white">{posts.length}</Text>
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

                  <TouchableOpacity onPress={() => setSelectedExercise(item)}>
                    <View className="mt-4 items-center rounded-full bg-blue-600 py-3">
                      <Text className="font-bold text-white">Ver ejercicio</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View className="mt-8 rounded-3xl bg-blue-600 p-5 shadow-lg">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-2xl font-extrabold text-white">Crea tu rutina con IA</Text>

                  <Text className="mt-2 text-sm text-blue-100">
                    Genera un plan personalizado según tus objetivos en segundos
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/routine/ai-routine')}
                activeOpacity={0.8}
                className="mt-5 items-center rounded-full bg-white py-3"
              >
                <Text className="font-bold text-blue-600">✨ Crear rutina ahora</Text>
              </TouchableOpacity>
            </View>

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
                  day: 'MIE',
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
                  day: 'SAB',
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

      {/* Exercise Details Modal */}
      <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
    </View>
  );
}
