import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ROUTINE_GOALS } from '../../hooks/useAiRoutineWizard';

interface Props {
  selectedGoals: string[];
  onToggle: (goal: string) => void;
}

export function AiRoutineStep1Goals({ selectedGoals, onToggle }: Props) {
  return (
    <View>
      <Text className="mt-4 text-2xl font-bold text-foreground">¿Cuál es tu objetivo?</Text>
      <Text className="mt-2 text-sm text-muted-foreground">Puedes seleccionar varios</Text>
      <View className="mt-6 flex-row flex-wrap gap-3">
        {ROUTINE_GOALS.map((goal) => {
          const active = selectedGoals.includes(goal);
          return (
            <TouchableOpacity
              key={goal}
              onPress={() => onToggle(goal)}
              activeOpacity={0.7}
              className={`rounded-full px-5 py-3 ${active ? 'bg-primary' : 'border border-border bg-secondary'}`}
            >
              <Text className={`font-medium ${active ? 'text-primary-foreground' : 'text-foreground'}`}>
                {goal}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
