import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface Props {
  value: string;
  onChange: (text: string) => void;
}

export function AiRoutineStep3Prompt({ value, onChange }: Props) {
  return (
    <View>
      <Text className="mt-4 text-2xl font-bold text-foreground">¿Algo más que quieras agregar?</Text>
      <Text className="mt-2 text-sm text-muted-foreground">Opcional — sé específico</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline
        numberOfLines={5}
        placeholder="Ej: Tengo una lesión de rodilla, evitar sentadillas..."
        placeholderTextColor="#868685"
        className="mt-6 rounded-xl border border-border bg-secondary px-4 py-3 text-foreground"
        style={{ minHeight: 120, textAlignVertical: 'top' }}
      />
    </View>
  );
}
