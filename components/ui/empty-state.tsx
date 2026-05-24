import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './button';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ emoji = '📭', title, subtitle, action }: EmptyStateProps) {
  return (
    <View className="items-center py-16">
      {emoji ? <Text className="text-4xl">{emoji}</Text> : null}
      <Text className="text-muted-foreground mt-3 text-base font-semibold">{title}</Text>
      {subtitle ? <Text className="text-muted-foreground mt-1 text-sm">{subtitle}</Text> : null}
      {action ? (
        <Button variant="outline" onPress={action.onPress} className="mt-4">
          <Text className="text-foreground">{action.label}</Text>
        </Button>
      ) : null}
    </View>
  );
}
