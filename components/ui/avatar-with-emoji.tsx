import React from 'react';
import { Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const avatarSizeVariants = cva('', {
  variants: {
    size: {
      sm: 'size-8',
      md: 'size-12',
      lg: 'size-16',
      xl: 'size-20',
    },
  },
  defaultVariants: { size: 'lg' },
});

const emojiFontVariants = cva('', {
  variants: {
    size: {
      sm: 'text-lg',
      md: 'text-2xl',
      lg: 'text-4xl',
      xl: 'text-5xl',
    },
  },
  defaultVariants: { size: 'lg' },
});

export interface AvatarWithEmojiProps extends VariantProps<typeof avatarSizeVariants> {
  imageUrl?: string | null;
  emoji?: string;
  fallback?: string;
}

export default function AvatarWithEmoji({
  imageUrl,
  emoji = '🏋️',
  fallback = 'A',
  size,
}: AvatarWithEmojiProps) {
  return (
    <Avatar className={avatarSizeVariants({ size })} alt={fallback}>
      {imageUrl ? <AvatarImage source={{ uri: imageUrl }} /> : null}
      <AvatarFallback className="bg-slate-200 dark:bg-slate-700">
        {emoji ? (
          <Text className={emojiFontVariants({ size })}>{emoji}</Text>
        ) : (
          <Text className="text-sm font-medium text-gray-900 dark:text-white">{fallback}</Text>
        )}
      </AvatarFallback>
    </Avatar>
  );
}
