import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Image, Animated, FlatList, Pressable } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';

type Post = {
  id: string;
  content: string;
  created_at: string;
  image_url?: string | null;
};

export default function ProfileScreen() {
  const { session } = useAuth();
  const user = session?.user;

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);

  const scrollY = useRef(new Animated.Value(0)).current;

  const fallbackName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Nicolas A';

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

      <View className="mt-3 flex-row gap-4">
        <Text className="text-xs text-gray-400">❤️ 34</Text>
        <Text className="text-xs text-gray-400">💬 2</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        ListHeaderComponent={
          <View>
            {/* HEADER */}
            <View className="items-center pt-10">
              <Image
                source={{ uri: avatar }}
                className="h-24 w-24 rounded-full border-4 border-white"
              />

              <Text className="mt-3 text-xl font-bold text-black">{username || fallbackName}</Text>

              <Text className="text-xs text-pink-500">POWERLIFTER - CALI</Text>
            </View>

            {/* STATS */}
            <View className="mt-6 flex-row justify-between px-6">
              <View className="flex-1 items-center rounded-2xl bg-white p-4">
                <Text className="text-lg font-bold">{posts.length}</Text>
                <Text className="text-xs text-gray-500">POSTS</Text>
              </View>

              <View className="mx-2 flex-1 items-center rounded-2xl bg-white p-4">
                <Text className="text-lg font-bold">10.923</Text>
                <Text className="text-xs text-gray-500">SEGUIDORES</Text>
              </View>
            </View>

            {/* WORKOUTS */}
            <View className="mt-8 flex-row items-center justify-between px-4">
              <Text className="text-lg font-bold">Workouts Grid</Text>
              <Text className="text-sm text-blue-500">Ver todos</Text>
            </View>

            <View className="mt-4 flex-row justify-between px-4">
              {['Banca', 'Curl', 'Smith'].map((item, i) => (
                <View
                  key={i}
                  className="h-24 w-[30%] items-center justify-center rounded-2xl bg-gray-200"
                >
                  <Text className="text-xs font-bold">{item}</Text>
                </View>
              ))}
            </View>

            {/* RUTINA */}
            <Text className="mt-8 px-4 text-lg font-bold">Rutina - Lunes</Text>

            <View className="mx-4 mt-4 rounded-3xl bg-white p-4">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61' }}
                className="h-40 w-full rounded-2xl"
              />

              <Text className="mt-3 font-bold">2H SESIÓN</Text>

              <View className="mt-2 flex-row gap-2">
                <Text className="rounded-full bg-pink-100 px-2 py-1 text-xs text-pink-600">
                  PECHO
                </Text>
                <Text className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-600">
                  TRICEPS
                </Text>
                <Text className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600">
                  CARDIO
                </Text>
              </View>

              <Pressable className="mt-4 items-center rounded-full bg-black py-3">
                <Text className="text-white">INICIAR RUTINA</Text>
              </Pressable>
            </View>

            {/* POSTS TITLE */}
            <Text className="mt-8 px-4 text-lg font-bold">Posts</Text>
          </View>
        }
      />
    </View>
  );
}
