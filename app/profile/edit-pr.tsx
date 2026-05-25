import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Camera } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useUpsertPr } from '@/features/profile/hooks/useProfileMutations';

interface ExerciseCatalog {
  id: string;
  name: string;
  emoji: string;
}

function getUnit(exerciseName: string): string {
  const lower = exerciseName.toLowerCase();
  if (
    lower.includes('barra') ||
    lower.includes('mancuerna') ||
    lower.includes('banca') ||
    lower.includes('sentadilla') ||
    lower.includes('muerto') ||
    lower.includes('remo')
  ) {
    return 'kg';
  }
  if (lower.includes('dominadas') || lower.includes('curl')) {
    return 'reps';
  }
  return 'kg';
}

export default function EditPrScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id ?? '';

  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ['exercises-catalog'],
    queryFn: async (): Promise<ExerciseCatalog[]> => {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, emoji')
        .order('name');
      if (error) throw error;
      return (data ?? []) as unknown as ExerciseCatalog[];
    },
  });

  const { mutate: upsertPr, isPending } = useUpsertPr(userId);

  const [selectedExercise, setSelectedExercise] = useState<ExerciseCatalog | null>(null);
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const unit = selectedExercise ? getUnit(selectedExercise.name) : 'kg';

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!selectedExercise) {
      Alert.alert('Selecciona un ejercicio');
      return;
    }
    if (!value || isNaN(Number(value))) {
      Alert.alert('Ingresa un valor válido');
      return;
    }

    upsertPr(
      {
        exercise_id: selectedExercise.id,
        value: Number(value),
        description: description || null,
        is_featured: isFeatured,
        media_url: imageUri,
        media_type: imageUri ? 'image' : null,
        achieved_on: new Date().toISOString().split('T')[0],
        source: 'self',
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: (err) => {
          Alert.alert('Error', (err as Error).message);
        },
      }
    );
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeft size={24} color="#868685" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Agregar Record Personal</Text>
      </View>

      {/* Exercise picker */}
      <View className="px-4">
        <Text className="mb-3 text-sm font-semibold text-foreground">Ejercicio</Text>
        {exercisesLoading ? (
          <Text className="text-muted-foreground">Cargando ejercicios...</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {(exercises ?? []).map((ex) => (
              <TouchableOpacity
                key={ex.id}
                onPress={() => setSelectedExercise(ex)}
                activeOpacity={0.7}
                className={`rounded-full px-4 py-2 ${
                  selectedExercise?.id === ex.id
                    ? 'bg-primary'
                    : 'border border-border bg-secondary'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedExercise?.id === ex.id
                      ? 'text-primary-foreground'
                      : 'text-foreground'
                  }`}
                >
                  {ex.emoji} {ex.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Value input */}
      <View className="mt-6 px-4">
        <Text className="mb-2 text-sm font-semibold text-foreground">
          Valor{unit ? ` (${unit})` : ''}
        </Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
          placeholder={`Ej: 100`}
          placeholderTextColor="#868685"
          className="rounded-xl border border-border bg-secondary px-4 py-3 text-foreground"
        />
      </View>

      {/* Image picker */}
      <View className="mt-6 px-4">
        <Text className="mb-2 text-sm font-semibold text-foreground">Foto (opcional)</Text>
        <TouchableOpacity
          onPress={pickImage}
          activeOpacity={0.8}
          className="overflow-hidden rounded-xl border border-border bg-secondary"
          style={{ height: 160 }}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center gap-2">
              <Camera size={32} color="#868685" />
              <Text className="text-sm text-muted-foreground">Toca para agregar foto</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View className="mt-6 px-4">
        <Text className="mb-2 text-sm font-semibold text-foreground">Descripción (opcional)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          placeholder="Cuéntanos sobre este logro..."
          placeholderTextColor="#868685"
          className="rounded-xl border border-border bg-secondary px-4 py-3 text-foreground"
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
      </View>

      {/* Featured toggle */}
      <View className="mt-6 flex-row items-center justify-between px-4">
        <View>
          <Text className="text-sm font-semibold text-foreground">Destacar en perfil</Text>
          <Text className="text-xs text-muted-foreground">Aparece en la sección principal</Text>
        </View>
        <Switch
          value={isFeatured}
          onValueChange={setIsFeatured}
          trackColor={{ false: '#252720', true: '#9fe870' }}
          thumbColor="#ffffff"
        />
      </View>

      {/* Submit */}
      <View className="mt-8 px-4">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isPending}
          activeOpacity={0.85}
          className="items-center rounded-full bg-primary py-4"
        >
          {isPending ? (
            <ActivityIndicator color="#0e0f0c" />
          ) : (
            <Text className="font-bold text-primary-foreground">Guardar Record</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
