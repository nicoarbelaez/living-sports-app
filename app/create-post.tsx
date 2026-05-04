import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useMediaPicker } from '@/hooks/useMediaPicker';
import * as FileSystem from 'expo-file-system/legacy';

export default function CreatePost() {
  const router = useRouter();
  const { session } = useAuth();
  const user = session?.user;

  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { handlePickFromGallery } = useMediaPicker({
    multiple: false,
    allowVideo: false,
    resizeWidth: 1080,
    compressQuality: 0.8,
  });

  const pickImage = async () => {
    const items = await handlePickFromGallery();
    if (items.length > 0) {
      setImage(items[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!user) return;

    if (!content.trim() && !image) {
      Alert.alert('Error', 'Agrega texto o imagen');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      if (image) {
        const fileName = `${user.id}-${Date.now()}.jpg`;

        // Obtener el blob de la imagen local
        const response = await fetch(image);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage.from('post').upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

        if (uploadError) {
          Alert.alert('Error', 'No se pudo subir la imagen');
          return;
        }

        const { data } = supabase.storage.from('post').getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      // 1. Insertar el post principal
      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          body: content,
        })
        .select()
        .single();

      if (postError || !newPost) {
        console.error('Error insertando post:', postError);
        Alert.alert('Error', 'No se pudo crear el post');
        return;
      }

      // 2. Si hay imagen, insertarla en post_media
      if (imageUrl) {
        const { error: mediaError } = await supabase.from('post_media').insert({
          post_id: newPost.id,
          url: imageUrl,
          media_type: 'image',
          sort_order: 1,
        });

        if (mediaError) {
          console.error('Error insertando media:', mediaError);
          // Opcional: no bloqueamos si falla la imagen, o podemos mostrar alerta
        }
      }

      router.back();
    } catch {
      Alert.alert('Error', 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 dark:bg-black">
      <View className="mb-6 flex-row items-center justify-between px-6 pt-10">
        <Pressable
          onPress={() => router.back()}
          className="rounded-full bg-white p-2 dark:bg-gray-800"
        >
          <ArrowLeft size={22} color="#000" />
        </Pressable>

        <Text className="text-lg font-bold text-black dark:text-white">Crear post</Text>

        <View className="w-8" />
      </View>

      <View className="px-6">
        <View className="mb-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="¿Qué estás pensando?"
            placeholderTextColor="#9ca3af"
            multiline
            className="text-black dark:text-white"
            style={{
              minHeight: 120,
              textAlignVertical: 'top',
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
            }}
          />
        </View>

        {image && (
          <View className="mb-4">
            <Image
              source={{ uri: image }}
              style={{
                height: 208,
                width: '100%',
                borderRadius: 16,
              }}
              contentFit="cover"
            />
          </View>
        )}

        <Pressable
          onPress={pickImage}
          className="mb-4 flex-row items-center justify-center rounded-2xl bg-gray-200 px-4 py-4 dark:bg-gray-800"
        >
          <ImageIcon size={20} color="#374151" />
          <Text className="ml-2 text-gray-700 dark:text-gray-300">Agregar imagen</Text>
        </Pressable>

        <Pressable
          onPress={handleCreatePost}
          disabled={loading}
          className={`rounded-2xl py-4 ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
        >
          <Text className="text-center text-base font-semibold text-white">
            {loading ? 'Publicando...' : 'Publicar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
