import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useGenerateRoutine } from './useProfileMutations';

export const ROUTINE_GOALS = ['Fuerza', 'Resistencia', 'Perder peso', 'Masa muscular'];
export const ROUTINE_LEVELS = ['Principiante', 'Intermedio', 'Avanzado'];
export const ROUTINE_EQUIPMENT = ['Pesas libres', 'Máquinas', 'Sin equipamiento', 'Bandas'];
export const ROUTINE_DAYS_OPTIONS = [2, 3, 4, 5, 6];

export type AiRoutineStep = 1 | 2 | 3;

export function useAiRoutineWizard(userId: string) {
  const router = useRouter();
  const { mutate: generateRoutine, isPending: isGenerating } = useGenerateRoutine(userId);

  const [step, setStep] = useState<AiRoutineStep>(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [level, setLevel] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');

  const toggleGoal = (goal: string) =>
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );

  const toggleEquipment = (item: string) =>
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );

  const handleGenerate = () => {
    console.log('[AI-ROUTINE] Iniciando generación:', {
      goals: selectedGoals,
      level,
      daysPerWeek,
      equipment: selectedEquipment,
      hasPrompt: !!prompt,
    });

    generateRoutine(
      { goals: selectedGoals, level, daysPerWeek, equipment: selectedEquipment, prompt: prompt || undefined },
      {
        onSuccess: () => {
          console.log('[AI-ROUTINE] Rutina generada y guardada');
          router.back();
        },
        onError: (err) => {
          console.error('[AI-ROUTINE] Error en generación:', err);
          Alert.alert('Error al generar rutina', (err as Error).message);
        },
      }
    );
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
      setStep((s) => (s + 1) as AiRoutineStep);
    }
  };

  const prevStep = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep((s) => (s - 1) as AiRoutineStep);
    }
  };

  return {
    step,
    selectedGoals,
    level,
    daysPerWeek,
    selectedEquipment,
    prompt,
    isGenerating,
    toggleGoal,
    toggleEquipment,
    setLevel,
    setDaysPerWeek,
    setPrompt,
    canGoNext,
    nextStep,
    prevStep,
  };
}
