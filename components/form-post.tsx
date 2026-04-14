import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image as ImageIcon, Send, X, Video as VideoIcon } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { withTimeout } from '@/lib/async/withTimeout';
import { Post } from '@/types/post';
import { Image } from 'expo-image';
import { getRandomAvatarUrl } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

export interface FormPostProps {
  onPostCreated: (post: Post) => void;
}

export default function FormPost({ onPostCreated }: FormPostProps) {
  const { session } = useAuth();
  const [text, setText] = useState('');
  const [medias, setMedias] = useState<
    {
      uri: string;
      type: 'image' | 'video';
    }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Se requiere permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 1,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const processedMedias = await Promise.all(
        result.assets.map(async (asset) => {
          const isVideo = asset.type === 'video';
          let finalUri: string = asset.uri;

          if (!isVideo) {
            const manipResult = await ImageManipulator.manipulateAsync(
              asset.uri,
              [{ resize: { width: 1080 } }],
              { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: false }
            );
            finalUri = manipResult.uri;
          }

          return { uri: finalUri, type: isVideo ? 'video' : 'image' } as const;
        })
      );

      setMedias((prev) => [...prev, ...processedMedias]);
    }
  };

  const removeMedia = (indexToRemove: number) => {
    setMedias((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const TIMEOUT_MS = 30_000;

  const handleSubmit = async () => {
    const trimmedText = text.trim();
    if (!trimmedText && (medias?.length || 0) === 0) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('text', trimmedText);

      if ((medias?.length || 0) > 0) {
        medias.forEach((mediaItem) => {
          const extension = mediaItem.type === 'video' ? 'mp4' : 'jpg';
          const mimeType = mediaItem.type === 'video' ? 'video/mp4' : 'image/jpeg';

          formData.append('file', {
            uri: mediaItem.uri,
            name: `upload_${Date.now()}.${extension}`,
            type: mimeType,
          } as unknown as Blob);
        });
      }

      console.log('[FormPost] Submitting to Edge Function...');
      const { data, error } = await withTimeout(
        supabase.functions.invoke('create-post', {
          body: formData,
        }),
        TIMEOUT_MS
      );

      if (error) {
        throw new Error(error.message || 'Error en la función');
      }

      if (!data?.post) {
        throw new Error('Respuesta del servidor no contiene la publicación.');
      }

      onPostCreated(data.post);

      setText('');
      setMedias([]);
    } catch (error: unknown) {
      console.error('Error creating post:', error);

      Alert.alert(
        'Error al publicar',
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al subir a Cloudinary/Supabase.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="mx-4 mt-3 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#111827]">
      <View className="flex-row items-start px-4 py-3">
        <Image
          source={{
            uri: getRandomAvatarUrl(session?.user.email || 'atleta'),
          }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
          contentFit="cover"
        />
        <View className="ml-3 flex-1">
          <TextInput
            multiline
            placeholder="¿Qué tienes en mente, atleta?"
            placeholderTextColor="#9ca3af"
            value={text}
            onChangeText={setText}
            className="mb-2 max-h-32 min-h-[40px] p-0 text-base text-gray-800 dark:text-gray-200"
          />

          {(medias?.length || 0) > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 mb-2">
              {medias.map((mediaItem, index) => (
                <View
                  key={index}
                  className="relative mr-3 h-40 w-32 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
                >
                  {mediaItem.type === 'image' ? (
                    <Image
                      source={{ uri: mediaItem.uri }}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="relative h-full w-full items-center justify-center rounded-xl border border-gray-600 bg-gray-900">
                      <Image
                        source={{ uri: mediaItem.uri }}
                        style={{
                          width: '100%',
                          height: '100%',
                          opacity: 0.5,
                        }}
                        contentFit="cover"
                      />
                      <VideoIcon color="white" size={32} className="absolute" />
                    </View>
                  )}
                  <TouchableOpacity
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1"
                    onPress={() => removeMedia(index)}
                  >
                    <X color="white" size={16} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      <View className="flex-row items-center justify-between border-t border-gray-100 px-4 pt-3 pb-3 dark:border-[#374151]">
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={handlePickMedia}
            className="flex-row items-center gap-1"
            disabled={isSubmitting}
          >
            <ImageIcon color="#10b981" size={20} />
            <Text className="font-medium text-gray-600 dark:text-gray-400">
              Adjuntar Multimedia
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting || (!text.trim() && (medias?.length || 0) === 0)}
          className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${
            (text.trim() || (medias?.length || 0) > 0) && !isSubmitting
              ? 'bg-[#10b981]'
              : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text
                className={
                  text.trim() || (medias?.length || 0) > 0
                    ? 'font-semibold text-white'
                    : 'font-semibold text-gray-400 dark:text-gray-500'
                }
              >
                Publicar
              </Text>
              <Send
                color={text.trim() || (medias?.length || 0) > 0 ? 'white' : '#9ca3af'}
                size={16}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
