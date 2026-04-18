import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Image, Animated, FlatList, Pressable, ScrollView } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';

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

const workoutsByDay = [
  { day: 'Lun', focus: ['Pecho', 'Tríceps'] },
  { day: 'Mar', focus: ['Espalda', 'Bíceps'] },
  { day: 'Mié', focus: ['Pierna'] },
  { day: 'Jue', focus: ['Hombro'] },
  { day: 'Vie', focus: ['Full Body'] },
  { day: 'Sáb', focus: ['Cardio'] },
  { day: 'Dom', focus: ['Descanso'] },
];

export default function ProfileScreen() {
  const { session } = useAuth();
  const user = session?.user;

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);

  const fallbackName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Usuario';

  const fetchProfile = async () => {
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
  };

  const fetchPosts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('posts')
      .select('id, content, created_at, image_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setPosts(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchPosts();
    }, [user])
  );

  const avatar = avatarUrl || 'https://ui-avatars.com/api/?name=User';

  const renderPost = ({ item }: { item: Post }) => (
    <View className="mb-6 rounded-3xl bg-white p-4 shadow-sm">
      {item.image_url && (
        <Image source={{ uri: item.image_url }} className="h-52 w-full rounded-2xl" />
      )}

      <Text className="mt-3 text-sm text-gray-700">{item.content}</Text>

      <View className="mt-3 flex-row justify-between">
        <Text className="text-xs text-gray-400">❤️ 34</Text>
        <Text className="text-xs text-gray-400">💬 2</Text>
      </View>
    </View>
  );

  const displayPosts = posts.length > 0 ? posts : mockPosts;

  return (
    <View className="flex-1 bg-gray-100">
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
            {/* PROFILE */}
            <View className="mt-6 items-center rounded-3xl bg-white p-6 shadow-sm">
              <Image
                source={{ uri: avatar }}
                className="h-24 w-24 rounded-full border-4 border-pink-500"
              />

              <Text className="mt-3 text-xl font-bold">{username || fallbackName}</Text>

              <Text className="text-xs text-pink-500">POWERLIFTER • CALI</Text>

              <Text className="mt-3 text-center text-sm text-gray-600">
                {bio || 'Sin biografía aún'}
              </Text>
            </View>

            {/* STATS */}
            <View className="mt-6 flex-row justify-between gap-3">
              <View className="flex-1 items-center rounded-2xl bg-white p-4">
                <Text className="text-lg font-bold">{displayPosts.length}</Text>
                <Text className="text-xs text-gray-500">POSTS</Text>
              </View>

              <View className="flex-1 items-center rounded-2xl bg-white p-4">
                <Text className="text-lg font-bold">10.923</Text>
                <Text className="text-xs text-gray-500">SEGUIDORES</Text>
              </View>

              <View className="flex-1 items-center rounded-2xl bg-white p-4">
                <Text className="text-lg font-bold">312</Text>
                <Text className="text-xs text-gray-500">SIGUIENDO</Text>
              </View>
            </View>

            {/* WORKOUTS HORIZONTAL */}
            <Text className="mt-8 text-lg font-bold">Workouts por día</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
              {workoutsByDay.map((item, i) => (
                <View key={i} className="mr-3 w-28 rounded-2xl bg-white p-4">
                  <Text className="text-center font-bold">{item.day}</Text>

                  {item.focus.map((f, idx) => (
                    <Text key={idx} className="mt-1 text-center text-xs text-gray-500">
                      {f}
                    </Text>
                  ))}
                </View>
              ))}
            </ScrollView>

            {/* RUTINA */}
            <Text className="mt-8 text-lg font-bold">Rutina destacada</Text>

            <View className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
                }}
                className="h-40 w-full rounded-2xl"
              />

              <Text className="mt-3 font-bold">2H SESIÓN</Text>

              <View className="mt-2 flex-row gap-2">
                <Text className="rounded-full bg-pink-100 px-2 py-1 text-xs text-pink-600">
                  PECHO
                </Text>
                <Text className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-600">
                  TRÍCEPS
                </Text>
                <Text className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600">
                  CARDIO
                </Text>
              </View>

              <Pressable className="mt-4 items-center rounded-full bg-black py-3">
                <Text className="font-semibold text-white">INICIAR RUTINA</Text>
              </Pressable>
            </View>

            {/* POSTS */}
            <Text className="mt-8 text-lg font-bold">Posts</Text>

            {posts.length === 0 && (
              <Text className="mt-2 text-sm text-gray-400">Mostrando ejemplo de publicaciones</Text>
            )}
          </View>
        }
      />
    </View>
  );
}
