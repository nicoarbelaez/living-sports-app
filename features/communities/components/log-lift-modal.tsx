import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ChevronDown } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomSheetModalComponent from '@/components/ui/bottom-sheet-modal';
import { EXERCISES, Exercise, Lift } from '@/types/lift';

interface Props {
  visible: boolean;
  communityId: string;
  onClose: () => void;
  onSubmit: (lift: Lift) => void;
}

const MY_AVATAR = 'https://avatars.githubusercontent.com/u/111522939?v=4';

export default function LogLiftModal({
  visible,
  communityId: _communityId,
  onClose,
  onSubmit,
}: Props) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [selectedExercise, setSelectedExercise] = useState<Exercise>(EXERCISES[0]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [reps, setReps] = useState('');

  const canSubmit =
    weightKg.trim() !== '' && reps.trim() !== '' && Number(weightKg) > 0 && Number(reps) > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const lift: Lift = {
      id: Date.now().toString(),
      userId: 'me',
      userName: 'Tú',
      avatarUrl: MY_AVATAR,
      exerciseId: selectedExercise.id,
      weightKg: Number(weightKg),
      reps: Number(reps),
      createdAt: new Date().toISOString(),
    };
    onSubmit(lift);
    setWeightKg('');
    setReps('');
    onClose();
  };

  return (
    <BottomSheetModalComponent
      visible={visible}
      title="Registrar Marca"
      subtitle="Compite con tu comunidad 🏆"
      onClose={onClose}
      config={{ snapPoints: ['70%'], enableOverDrag: false }}
      bottomSheetRef={bottomSheetRef}
    >
      <View className="mb-6">
        <Text className="text-foreground mb-2 font-bold">Ejercicio</Text>
        <TouchableOpacity
          onPress={() => setShowExercisePicker(!showExercisePicker)}
          className="border-border bg-background h-14 flex-row items-center justify-between rounded-2xl border px-4"
        >
          <Text className="text-foreground text-base font-medium">
            {selectedExercise.emoji} {selectedExercise.name}
          </Text>
          <ChevronDown size={20} color="#6b7280" />
        </TouchableOpacity>

        {showExercisePicker && (
          <View className="border-border bg-background mt-2 overflow-hidden rounded-2xl border">
            {EXERCISES.map((ex) => (
              <TouchableOpacity
                key={ex.id}
                onPress={() => {
                  setSelectedExercise(ex);
                  setShowExercisePicker(false);
                }}
                className={`border-border flex-row items-center border-b px-4 py-3.5 ${selectedExercise.id === ex.id ? 'bg-accent' : ''}`}
              >
                <Text className="mr-3 text-lg">{ex.emoji}</Text>
                <Text
                  className={`text-base font-medium ${selectedExercise.id === ex.id ? 'text-primary font-semibold' : 'text-foreground'}`}
                >
                  {ex.name}
                </Text>
                {selectedExercise.id === ex.id && (
                  <Text className="text-primary ml-auto font-bold">✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View className="mb-8 flex-row gap-4">
        <View className="flex-1">
          <Text className="text-foreground mb-2 font-bold">Peso máximo</Text>
          <View className="border-border bg-background h-14 flex-row items-center rounded-2xl border px-4">
            <Input
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="0"
              keyboardType="numeric"
              className="flex-1 border-0 bg-transparent text-xl font-bold"
            />
            <Text className="text-muted-foreground font-semibold">kg</Text>
          </View>
        </View>

        <View className="flex-1">
          <Text className="text-foreground mb-2 font-bold">Repeticiones</Text>
          <View className="border-border bg-background h-14 flex-row items-center rounded-2xl border px-4">
            <Input
              value={reps}
              onChangeText={setReps}
              placeholder="0"
              keyboardType="numeric"
              className="flex-1 border-0 bg-transparent text-xl font-bold"
            />
            <Text className="text-muted-foreground font-semibold">reps</Text>
          </View>
        </View>
      </View>

      <Button
        variant="success"
        onPress={handleSubmit}
        disabled={!canSubmit}
        size="lg"
        className="rounded-2xl"
      >
        <Text className="text-lg font-black text-white">🏆 Publicar Marca</Text>
      </Button>
    </BottomSheetModalComponent>
  );
}
