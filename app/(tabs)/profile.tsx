import React, { useState, useCallback } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import { MotiView, MotiText, AnimatePresence } from 'moti';

/* TYPES Y DATA IGUAL (NO TOCADO) */

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

const workoutPlans = [
  {
    id: '1',
    title: 'Push Day Intenso',
    duration: '2H SESIÓN',
    focus: ['PECHO', 'TRÍCEPS', 'HOMBRO'],
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
  },
  {
    id: '2',
    title: 'Pull Power',
    duration: '1H 45MIN',
    focus: ['ESPALDA', 'BÍCEPS'],
    image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e',
  },
  {
    id: '3',
    title: 'Leg Day Beast',
    duration: '2H 30MIN',
    focus: ['PIERNA', 'GLÚTEO'],
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
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

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [started, setStarted] = useState(false);

  const fallbackName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Usuario';

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url, bio')
      .eq('id', user.id)
      .single();

    if (data) {
      setUsername(data.username || '');
      setAvatarUrl(data.avatar_url || '');
      setBio(data.bio || '');
    }
  }, [user]);

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('posts')
      .select('id, content, created_at, image_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data && !error) setPosts(data as unknown as Post[]);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchPosts();
    }, [fetchProfile, fetchPosts])
  );

  const avatar = avatarUrl || 'https://ui-avatars.com/api/?name=User';

  const displayPosts = posts.length > 0 ? posts : mockPosts;

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
            {/* PROFILE CARD */}
            <View className="mt-6 items-center rounded-3xl bg-white p-6 shadow-sm dark:bg-zinc-900">
              <Image
                source={{ uri: avatar }}
                className="h-24 w-24 rounded-full border-4 border-blue-600"
              />

              <Text className="mt-3 text-xl font-bold text-black dark:text-white">
                {username || fallbackName}
              </Text>

              <Text className="text-xs text-blue-600">POWERLIFTER • CALI</Text>

              <Text className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                {bio || 'Sin biografía aún'}
              </Text>
            </View>

            {/* STATS */}
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

            {/* RUTINAS DESTACADAS (NO TOCADO, SOLO DARK MODE) */}
            <Text className="mt-8 text-lg font-bold text-black dark:text-white">
              Rutinas destacadas
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
              {workoutPlans.map((item) => (
                <View
                  key={item.id}
                  className="mr-4 w-72 rounded-3xl bg-white p-4 shadow-sm dark:bg-zinc-900"
                >
                  <Image source={{ uri: item.image }} className="h-40 w-full rounded-2xl" />

                  <Text className="mt-3 text-base font-bold text-black dark:text-white">
                    {item.title}
                  </Text>

                  <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {item.duration}
                  </Text>

                  <View className="mt-3 flex-row flex-wrap gap-2">
                    {item.focus.map((f, i) => (
                      <Text
                        key={i}
                        className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600"
                      >
                        {f}
                      </Text>
                    ))}
                  </View>

                  {/* MotiView anima backgroundColor entre estados — Button no soporta este patrón */}
                  <TouchableOpacity onPress={() => setStarted(!started)}>
                    <MotiView
                      animate={{
                        backgroundColor: started ? '#27272a' : '#3b82f6',
                      }}
                      className="mt-4 items-center justify-center rounded-full py-3"
                    >
                      <AnimatePresence exitBeforeEnter>
                        {started ? (
                          <MotiText className="font-semibold text-white">En progreso</MotiText>
                        ) : (
                          <MotiText className="font-bold text-black">Iniciar rutina</MotiText>
                        )}
                      </AnimatePresence>
                    </MotiView>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* EJERCICIOS DESTACADOS (SOLO DARK FIX) */}
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
                      <Text className="font-bold text-black">Ver ejercicio</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* POSTS TITLE */}
            <Text className="mt-8 mb-4 text-lg font-bold text-black dark:text-white">Posts</Text>
          </View>
        }
      />
    </View>
  );
}
