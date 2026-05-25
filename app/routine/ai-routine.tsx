import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import {
  useGenerateRoutine,
  useApplyRoutineDraft,
} from '@/features/profile/hooks/useProfileMutations';
import WeeklyRoutineScroll from '@/components/profile/WeeklyRoutineScroll';
import type { RoutineDay } from '@/features/profile/types';

const GOALS = ['Fuerza', 'Resistencia', 'Perder peso', 'Masa muscular'];
const LEVELS = ['Principiante', 'Intermedio', 'Avanzado'];
const EQUIPMENT = ['Pesas libres', 'Máquinas', 'Sin equipamiento', 'Bandas'];
const DAYS_OPTIONS = [2, 3, 4, 5, 6];

type Step = 1 | 2 | 3 | 4;

export default function AiRoutineScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id ?? '';

  const { mutate: generateRoutine, isPending: isGenerating } = useGenerateRoutine();
  const { mutate: applyDraft, isPending: isApplying } = useApplyRoutineDraft(userId);

  const [step, setStep] = useState<Step>(1);

  // Step 1: goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  // Step 2: level, days, equipment
  const [level, setLevel] = useState<string>('');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  // Step 3: optional prompt
  const [prompt, setPrompt] = useState('');
  // Step 4: result
  const [draftRoutine, setDraftRoutine] = useState<Record<number, RoutineDay> | null>(null);
  const [rawDraft, setRawDraft] = useState<object | null>(null);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const handleGenerate = () => {
    if (selectedGoals.length === 0) {
      Alert.alert('Selecciona al menos un objetivo');
      return;
    }
    if (!level) {
      Alert.alert('Selecciona tu nivel');
      return;
    }

    generateRoutine(
      {
        goals: selectedGoals,
        level,
        days_per_week: daysPerWeek,
        equipment: selectedEquipment,
        prompt: prompt || undefined,
      },
      {
        onSuccess: (result) => {
          const data = result.data as {
            days?: {
              day_of_week: number;
              title: string;
              is_rest: boolean;
              description: string | null;
              duration_sec: number | null;
              exercises: {
                exercise_id: string;
                name: string;
                emoji: string;
                sets: number;
                reps: number;
                rest_seconds: number;
              }[];
            }[];
          } | null;

          if (!data?.days) {
            Alert.alert('Error', 'No se pudo generar la rutina');
            return;
          }

          const map: Record<number, RoutineDay> = {};
          for (const d of data.days) {
            map[d.day_of_week] = {
              id: String(d.day_of_week),
              dayOfWeek: d.day_of_week,
              title: d.title,
              isRest: d.is_rest,
              description: d.description,
              durationSec: d.duration_sec,
              exercises: (d.exercises ?? []).map((ex, idx) => ({
                id: `${d.day_of_week}-${idx}`,
                exerciseId: ex.exercise_id,
                exercise: { id: ex.exercise_id, name: ex.name, emoji: ex.emoji },
                sets: ex.sets,
                reps: ex.reps,
                restSeconds: ex.rest_seconds,
                sortOrder: idx,
              })),
            };
          }

          setDraftRoutine(map);
          setRawDraft(data);
          setStep(4);
        },
        onError: (err) => {
          Alert.alert('Error al generar rutina', (err as Error).message);
        },
      }
    );
  };

  const handleApply = () => {
    if (!rawDraft) return;
    applyDraft(rawDraft, {
      onSuccess: () => {
        router.back();
      },
      onError: (err) => {
        Alert.alert('Error al guardar rutina', (err as Error).message);
      },
    });
  };

  const handleEditFirst = () => {
    router.push('/profile/edit-routine');
  };

  const canGoNext = () => {
    if (step === 1) return selectedGoals.length > 0;
    if (step === 2) return !!level;
    return true;
  };

  const nextStep = () => {
    if (step === 3) {
      handleGenerate();
    } else {
      setStep((s) => (s + 1) as Step);
    }
  };

  const prevStep = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep((s) => (s - 1) as Step);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pt-14 pb-4 border-b border-border">
        <TouchableOpacity onPress={prevStep} activeOpacity={0.7}>
          <ChevronLeft size={24} color="#868685" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-foreground">Rutina con IA</Text>
          {step < 4 && (
            <Text className="text-xs text-muted-foreground">Paso {step} de 3</Text>
          )}
        </View>
      </View>

      {/* Step indicator */}
      {step < 4 && (
        <View className="flex-row gap-2 px-4 pt-4">
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              className={`h-1 flex-1 rounded-full ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Step 1: Goals ── */}
        {step === 1 && (
          <View>
            <Text className="mt-4 text-2xl font-bold text-foreground">¿Cuál es tu objetivo?</Text>
            <Text className="mt-2 text-sm text-muted-foreground">
              Puedes seleccionar varios
            </Text>
            <View className="mt-6 flex-row flex-wrap gap-3">
              {GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  onPress={() => toggleGoal(goal)}
                  activeOpacity={0.7}
                  className={`rounded-full px-5 py-3 ${
                    selectedGoals.includes(goal)
                      ? 'bg-primary'
                      : 'border border-border bg-secondary'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      selectedGoals.includes(goal)
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Step 2: Level, Days, Equipment ── */}
        {step === 2 && (
          <View>
            <Text className="mt-4 text-2xl font-bold text-foreground">Configura tu rutina</Text>

            <Text className="mt-6 text-sm font-semibold text-foreground">Nivel de experiencia</Text>
            <View className="mt-3 flex-row gap-3">
              {LEVELS.map((l) => (
                <TouchableOpacity
                  key={l}
                  onPress={() => setLevel(l)}
                  activeOpacity={0.7}
                  className={`flex-1 items-center rounded-xl py-3 ${
                    level === l ? 'bg-primary' : 'border border-border bg-secondary'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      level === l ? 'text-primary-foreground' : 'text-foreground'
                    }`}
                  >
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="mt-6 text-sm font-semibold text-foreground">
              Días por semana: {daysPerWeek}
            </Text>
            <View className="mt-3 flex-row gap-2">
              {DAYS_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDaysPerWeek(d)}
                  activeOpacity={0.7}
                  className={`flex-1 items-center rounded-xl py-3 ${
                    daysPerWeek === d ? 'bg-primary' : 'border border-border bg-secondary'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      daysPerWeek === d ? 'text-primary-foreground' : 'text-foreground'
                    }`}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="mt-6 text-sm font-semibold text-foreground">Equipamiento</Text>
            <View className="mt-3 flex-row flex-wrap gap-3">
              {EQUIPMENT.map((eq) => (
                <TouchableOpacity
                  key={eq}
                  onPress={() => toggleEquipment(eq)}
                  activeOpacity={0.7}
                  className={`rounded-full px-4 py-2 ${
                    selectedEquipment.includes(eq)
                      ? 'bg-primary'
                      : 'border border-border bg-secondary'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedEquipment.includes(eq)
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {eq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Step 3: Optional prompt ── */}
        {step === 3 && (
          <View>
            <Text className="mt-4 text-2xl font-bold text-foreground">
              ¿Algo más que quieras agregar?
            </Text>
            <Text className="mt-2 text-sm text-muted-foreground">Opcional — sé específico</Text>
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={5}
              placeholder="Ej: Tengo una lesión de rodilla, evitar sentadillas..."
              placeholderTextColor="#868685"
              className="mt-6 rounded-xl border border-border bg-secondary px-4 py-3 text-foreground"
              style={{ minHeight: 120, textAlignVertical: 'top' }}
            />
          </View>
        )}

        {/* ── Step 4: Generated Routine ── */}
        {step === 4 && (
          <View>
            {isGenerating ? (
              <View className="items-center py-20">
                <ActivityIndicator size="large" color="#9fe870" />
                <Text className="mt-4 text-lg font-semibold text-foreground">
                  Generando tu rutina...
                </Text>
                <Text className="mt-2 text-sm text-muted-foreground">Esto puede tomar unos segundos</Text>
              </View>
            ) : draftRoutine ? (
              <View>
                <Text className="mt-2 text-2xl font-bold text-foreground">Tu rutina generada</Text>
                <Text className="mt-1 text-sm text-muted-foreground mb-4">
                  Revísala y confirma para guardar
                </Text>

                <WeeklyRoutineScroll
                  routine={draftRoutine}
                  onDayPress={() => {}}
                />

                <TouchableOpacity
                  onPress={handleApply}
                  disabled={isApplying}
                  activeOpacity={0.85}
                  className="mt-6 items-center rounded-full bg-primary py-4"
                >
                  {isApplying ? (
                    <ActivityIndicator color="#0e0f0c" />
                  ) : (
                    <Text className="font-bold text-primary-foreground">
                      Confirmar y guardar
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleEditFirst}
                  activeOpacity={0.8}
                  className="mt-3 items-center rounded-full border border-border py-4"
                >
                  <Text className="font-semibold text-foreground">Editar primero</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Navigation footer */}
      {step < 4 && !isGenerating && (
        <View className="px-4 pb-8 pt-2 border-t border-border">
          <TouchableOpacity
            onPress={nextStep}
            disabled={!canGoNext() || isGenerating}
            activeOpacity={0.85}
            className={`flex-row items-center justify-center gap-2 rounded-full py-4 ${
              canGoNext() ? 'bg-primary' : 'bg-muted opacity-50'
            }`}
          >
            {isGenerating ? (
              <ActivityIndicator color="#0e0f0c" />
            ) : (
              <>
                <Text className="font-bold text-primary-foreground">
                  {step === 3 ? 'Generar rutina ✨' : 'Siguiente'}
                </Text>
                {step < 3 && <ChevronRight size={18} color="#0e0f0c" />}
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
