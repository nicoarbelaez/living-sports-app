import React, { useState } from 'react';
import { MotiText, MotiView } from 'moti';
import { Button, type ButtonProps } from './ui/button';
import { LucideIcon } from '@/types/icons';
import { cn } from '@/lib/utils';

export type AuthButtonProps = ButtonProps & {
  icon: LucideIcon;
  text: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  textClassName?: string;
};

export default function AuthButton({
  icon,
  text,
  onPress,
  loading = false,
  disabled = false,
  textClassName,
  ...props
}: AuthButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <MotiView
      animate={{
        scale: isPressed ? 0.96 : 1,
        opacity: disabled || loading ? 0.6 : 1,
      }}
    >
      <Button
        size="lg"
        onPress={onPress}
        disabled={disabled}
        loading={loading}
        onPressIn={() => {
          if (!loading && !disabled) setIsPressed(true);
        }}
        onPressOut={() => setIsPressed(false)}
        icon={icon}
        {...props}
      >
        <MotiText className={cn('text-base font-semibold tracking-wide', textClassName)}>
          {loading ? 'Cargando...' : text}
        </MotiText>
      </Button>
    </MotiView>
  );
}
