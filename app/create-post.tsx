import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/theme';

export default function CreatePost() {
  const router = useRouter();
  const { session } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const user = session?.user;

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const MAX_CHARS = 200;

  const handlePost = async () => {
    if (!user) return;

    if (!content.trim()) {
      Alert.alert('Error', 'El post no puede estar vacío');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'No se pudo publicar');
    } else {
      Alert.alert('Publicado', 'Tu post fue creado');
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-gray-100 px-5 pt-10 dark:bg-black">
      {/* HEADER */}
      <View className="mb-6 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="rounded-full bg-white p-2 dark:bg-gray-800"
        >
          <ArrowLeft size={22} color={isDark ? '#fff' : '#000'} />
        </Pressable>

        <Text className="text-lg font-bold text-black dark:text-white">Crear post</Text>

        <View className="w-8" />
      </View>

      {/* INPUT */}
      <View className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <TextInput
          value={content}
          onChangeText={(text) => {
            if (text.length <= MAX_CHARS) setContent(text);
          }}
          placeholder="¿Qué estás pensando?"
          placeholderTextColor="#9ca3af"
          multiline
          style={{
            minHeight: 120,
            textAlignVertical: 'top',
            color: isDark ? 'white' : 'black',
          }}
        />

        <Text className="mt-2 text-right text-xs text-gray-400">
          {content.length}/{MAX_CHARS}
        </Text>
      </View>

      {/* BUTTON */}
      <Pressable
        onPress={handlePost}
        disabled={loading || !content.trim()}
        className={`mt-6 rounded-2xl py-4 ${
          loading || !content.trim() ? 'bg-gray-400' : 'bg-blue-500'
        }`}
      >
        <Text className="text-center font-semibold text-white">
          {loading ? 'Publicando...' : 'Publicar'}
        </Text>
      </Pressable>
    </View>
  );
}
