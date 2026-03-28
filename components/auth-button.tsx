import React, { useState, ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { cn } from '@/lib/utils';

export interface AuthButtonProps {
  icon: ReactNode;
  text: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /**
   * Additional Tailwind classes for the button container.
   */
  containerClassName?: string;
  /**
   * Additional Tailwind classes for the text.
   */
  textClassName?: string;
}

export default function AuthButton({
  icon,
  text,
  onPress,
  loading = false,
  disabled = false,
  containerClassName = 'bg-secondary',
  textClassName = 'text-secondary-foreground',
}: AuthButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <MotiView
      animate={{ scale: isPressed ? 0.95 : 1 }}
      transition={{
        type: 'spring',
        damping: 10,
        mass: 0.5,
      }}
    >
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onPress}
        disabled={loading || disabled}
      >
        <View
          className={cn(
            'h-14 w-full flex-row items-center justify-center rounded-2xl transition-opacity',
            containerClassName,
            loading || disabled ? 'opacity-50' : 'opacity-100'
          )}
        >
          <View className="mr-3">{icon}</View>
          <MotiText className={cn('text-base font-semibold', textClassName)}>
            {loading ? 'Cargando...' : text}
          </MotiText>
        </View>
      </Pressable>
    </MotiView>
  );
}
