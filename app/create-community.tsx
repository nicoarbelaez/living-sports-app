import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, Camera, AlertCircle } from 'lucide-react-native';
import { addMockCommunity } from '@/constants/mockCommunities';

export default function CreateCommunityScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const iconColor = isDark ? '#f4f4f5' : '#18181b';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;

    // Empujar la comunidad "falsa" al estado en la sesión de memoria actual.
    addMockCommunity({
      id: Date.now().toString(),
      name: name.trim(),
      followersCount: 1, // el creador y nadie más
      avatarUrl:
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200',
    });

    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-gray-100 dark:bg-black"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6 pt-16">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-8 h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        >
          <ArrowLeft size={24} color={iconColor} />
        </TouchableOpacity>

        <Text className="mb-2 text-3xl font-black text-black dark:text-white">Crear Comunidad</Text>
        <Text className="mb-8 text-base text-gray-500 dark:text-gray-400">
          Configura un nuevo espacio para convivir sobre tus deportes favoritos.
        </Text>

        {/* Image Picker Placeholder */}
        <TouchableOpacity className="mb-8 h-24 w-24 items-center justify-center self-center rounded-full border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20">
          <Camera size={28} color="#3b82f6" />
          <Text className="mt-1 text-xs font-medium text-blue-500">Subir</Text>
        </TouchableOpacity>

        {/* Form Fields */}
        <View className="gap-6">
          <View>
            <Text className="mb-2 font-bold text-black dark:text-white">
              Nombre de la comunidad
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej. Tenis en la ciudad"
              placeholderTextColor="#9ca3af"
              className="h-14 rounded-xl border border-gray-200 bg-white px-4 font-medium text-black dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </View>

          <View>
            <Text className="mb-2 font-bold text-black dark:text-white">Descripción</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="¿De qué trata tu comunidad?"
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              className="h-32 rounded-xl border border-gray-200 bg-white px-4 py-4 font-medium text-black dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </View>

          {/* Privacy Hint */}
          <View className="mt-2 flex-row items-start gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <AlertCircle size={20} color="#3b82f6" className="mt-0.5" />
            <Text className="flex-1 text-sm leading-relaxed text-blue-700 dark:text-blue-300">
              Tu comunidad será pública. Cualquier persona en la plataforma podrá encontrarla en el
              buscador e unirse.
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="mt-10 h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/30"
          onPress={handleCreate}
          disabled={!name.trim() || !description.trim()}
          style={{ opacity: !name.trim() || !description.trim() ? 0.5 : 1 }}
        >
          <Users size={20} color="#fff" />
          <Text className="text-lg font-bold text-white">Publicar Comunidad</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
