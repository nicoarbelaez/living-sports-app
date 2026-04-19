import React from 'react';
import { Text, View } from 'react-native';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export interface AvatarWithEmojiProps {
  imageUrl?: string | null;
  emoji?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'size-8',
  md: 'size-12',
  lg: 'size-16',
  xl: 'size-20',
};

const emojiFontSizes = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
};

export default function AvatarWithEmoji({
  imageUrl,
  emoji = '🏋️',
  fallback = 'A',
  size = 'lg',
}: AvatarWithEmojiProps) {
  return (
    <Avatar className={sizeClasses[size]} alt={fallback}>
      {imageUrl ? <AvatarImage source={{ uri: imageUrl }} /> : null}
      <AvatarFallback className="bg-slate-200 dark:bg-slate-700">
        {emoji ? (
          <Text className={emojiFontSizes[size]}>{emoji}</Text>
        ) : (
          <Text className="text-sm font-medium text-gray-900 dark:text-white">{fallback}</Text>
        )}
      </AvatarFallback>
    </Avatar>
  );
}
