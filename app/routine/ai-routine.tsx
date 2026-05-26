import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useAiRoutineWizard } from '@/features/profile/hooks/useAiRoutineWizard';
import { AiRoutineStep1Goals } from '@/features/profile/components/routine/AiRoutineStep1Goals';
import { AiRoutineStep2Config } from '@/features/profile/components/routine/AiRoutineStep2Config';
import { AiRoutineStep3Prompt } from '@/features/profile/components/routine/AiRoutineStep3Prompt';

export default function AiRoutineScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';

  const {
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
  } = useAiRoutineWizard(userId);

  return (
    <View className="bg-background flex-1">
      <View className="border-border flex-row items-center gap-3 border-b px-4 pt-14 pb-4">
        <TouchableOpacity onPress={prevStep} activeOpacity={0.7} disabled={isGenerating}>
          <ChevronLeft size={24} color="#868685" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-foreground text-xl font-bold">Rutina con IA</Text>
          <Text className="text-muted-foreground text-xs">Paso {step} de 3</Text>
        </View>
      </View>

      <View className="flex-row gap-2 px-4 pt-4">
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && <AiRoutineStep1Goals selectedGoals={selectedGoals} onToggle={toggleGoal} />}
        {step === 2 && (
          <AiRoutineStep2Config
            level={level}
            daysPerWeek={daysPerWeek}
            selectedEquipment={selectedEquipment}
            onLevelChange={setLevel}
            onDaysChange={setDaysPerWeek}
            onEquipmentToggle={toggleEquipment}
          />
        )}
        {step === 3 && <AiRoutineStep3Prompt value={prompt} onChange={setPrompt} />}
      </ScrollView>

      <View className="border-border border-t px-4 pt-2 pb-8">
        <TouchableOpacity
          onPress={nextStep}
          disabled={!canGoNext() || isGenerating}
          activeOpacity={0.85}
          className={`flex-row items-center justify-center gap-2 rounded-full py-4 ${
            canGoNext() && !isGenerating ? 'bg-primary' : 'bg-muted opacity-50'
          }`}
        >
          {isGenerating ? (
            <ActivityIndicator color="#0e0f0c" />
          ) : (
            <>
              <Text className="text-primary-foreground font-bold">
                {step === 3 ? 'Generar rutina ✨' : 'Siguiente'}
              </Text>
              {step < 3 && <ChevronRight size={18} color="#0e0f0c" />}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
