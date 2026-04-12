import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';
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

  const fallbackName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Usuario';

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url, bio')
      .eq('id', user.id)
      .single();

    if (data) {
      if (data.username) setUsername(data.username);
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
      if (data.bio) setBio(data.bio);
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

  const avatar =
    avatarUrl ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    'https://ui-avatars.com/api/?name=User';

  const fadeOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderItem = ({ item }: { item: Post }) => (
    <View className="mb-3 rounded-2xl bg-white p-4 dark:bg-gray-800">
      {item.content ? (
        <Text className="text-base text-gray-800 dark:text-gray-200">{item.content}</Text>
      ) : null}

      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          className="mt-3 h-60 w-full rounded-xl"
          resizeMode="cover"
        />
      ) : null}

      <Text className="mt-2 text-xs text-gray-400">
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      {/* LISTA */}
      <Animated.FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 280,
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-gray-400">Aún no has publicado nada</Text>
        }
      />

      {/* HEADER */}
      <View className="absolute top-0 right-0 left-0 items-center pt-10">
        <View className="w-full max-w-md items-center px-6">
          {/* AVATAR */}
          <Animated.Image
            source={{ uri: avatar }}
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              opacity: fadeOpacity,
            }}
          />

          {/* INFO */}
          <Animated.View style={{ opacity: fadeOpacity, width: '100%' }}>
            <View className="mt-2 items-center">
              <Text className="text-center text-xl font-bold text-black dark:text-white">
                {username || fallbackName}
              </Text>

              {bio ? (
                <Text className="mt-1 px-4 text-center text-gray-500 dark:text-gray-400">
                  {bio}
                </Text>
              ) : null}
            </View>

            {/* STATS */}
            <View className="mt-6 w-full flex-row justify-between px-6">
              <View className="flex-1 items-center">
                <Text className="text-lg font-bold text-black dark:text-white">{posts.length}</Text>
                <Text className="text-xs text-gray-500">Posts</Text>
              </View>

              <View className="flex-1 items-center">
                <Text className="text-lg font-bold text-black dark:text-white">0</Text>
                <Text className="text-xs text-gray-500">Seguidores</Text>
              </View>

              <View className="flex-1 items-center">
                <Text className="text-lg font-bold text-black dark:text-white">0</Text>
                <Text className="text-xs text-gray-500">Siguiendo</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
