import React, { useState, useCallback } from 'react';
import { View, Text, Image, FlatList } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';

type Post = {
  id: string;
  content: string;
  created_at: string;
};

export default function ProfileScreen() {
  const { session } = useAuth();
  const user = session?.user;

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);

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
      .select('id, content, created_at')
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

  const renderItem = ({ item }: { item: Post }) => (
    <View className="mb-3 rounded-2xl bg-white p-4 dark:bg-gray-800">
      <Text className="text-base text-gray-800 dark:text-gray-200">{item.content}</Text>

      <Text className="mt-2 text-xs text-gray-400">
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100 px-4 pt-10 dark:bg-black">
      {/* HEADER PERFIL */}
      <View className="mb-6 items-center">
        <Image source={{ uri: avatar }} className="mb-3 h-28 w-28 rounded-full" />

        <Text className="text-xl font-bold text-black dark:text-white">
          {username || fallbackName}
        </Text>

        {bio ? (
          <Text className="mt-2 text-center text-gray-500 dark:text-gray-400">{bio}</Text>
        ) : null}
      </View>

      {/* STATS */}
      <View className="mb-6 flex-row justify-around">
        <View className="items-center">
          <Text className="text-lg font-bold text-black dark:text-white">{posts.length}</Text>
          <Text className="text-xs text-gray-500">Posts</Text>
        </View>

        <View className="items-center">
          <Text className="text-lg font-bold text-black dark:text-white">0</Text>
          <Text className="text-xs text-gray-500">Seguidores</Text>
        </View>

        <View className="items-center">
          <Text className="text-lg font-bold text-black dark:text-white">0</Text>
          <Text className="text-xs text-gray-500">Siguiendo</Text>
        </View>
      </View>

      {/* POSTS */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-gray-400">Aún no has publicado nada</Text>
        }
      />
    </View>
  );
}
