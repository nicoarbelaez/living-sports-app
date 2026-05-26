import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ROUTINE_LEVELS, ROUTINE_EQUIPMENT, ROUTINE_DAYS_OPTIONS } from '../../hooks/useAiRoutineWizard';

interface Props {
  level: string;
  daysPerWeek: number;
  selectedEquipment: string[];
  onLevelChange: (level: string) => void;
  onDaysChange: (days: number) => void;
  onEquipmentToggle: (item: string) => void;
}

export function AiRoutineStep2Config({
  level,
  daysPerWeek,
  selectedEquipment,
  onLevelChange,
  onDaysChange,
  onEquipmentToggle,
}: Props) {
  return (
    <View>
      <Text className="mt-4 text-2xl font-bold text-foreground">Configura tu rutina</Text>

      <Text className="mt-6 text-sm font-semibold text-foreground">Nivel de experiencia</Text>
      <View className="mt-3 flex-row gap-3">
        {ROUTINE_LEVELS.map((l) => {
          const active = level === l;
          return (
            <TouchableOpacity
              key={l}
              onPress={() => onLevelChange(l)}
              activeOpacity={0.7}
              className={`flex-1 items-center rounded-xl py-3 ${active ? 'bg-primary' : 'border border-border bg-secondary'}`}
            >
              <Text className={`text-sm font-medium ${active ? 'text-primary-foreground' : 'text-foreground'}`}>
                {l}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text className="mt-6 text-sm font-semibold text-foreground">Días por semana: {daysPerWeek}</Text>
      <View className="mt-3 flex-row gap-2">
        {ROUTINE_DAYS_OPTIONS.map((d) => {
          const active = daysPerWeek === d;
          return (
            <TouchableOpacity
              key={d}
              onPress={() => onDaysChange(d)}
              activeOpacity={0.7}
              className={`flex-1 items-center rounded-xl py-3 ${active ? 'bg-primary' : 'border border-border bg-secondary'}`}
            >
              <Text className={`text-sm font-bold ${active ? 'text-primary-foreground' : 'text-foreground'}`}>
                {d}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text className="mt-6 text-sm font-semibold text-foreground">Equipamiento</Text>
      <View className="mt-3 flex-row flex-wrap gap-3">
        {ROUTINE_EQUIPMENT.map((eq) => {
          const active = selectedEquipment.includes(eq);
          return (
            <TouchableOpacity
              key={eq}
              onPress={() => onEquipmentToggle(eq)}
              activeOpacity={0.7}
              className={`rounded-full px-4 py-2 ${active ? 'bg-primary' : 'border border-border bg-secondary'}`}
            >
              <Text className={`text-sm font-medium ${active ? 'text-primary-foreground' : 'text-foreground'}`}>
                {eq}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
