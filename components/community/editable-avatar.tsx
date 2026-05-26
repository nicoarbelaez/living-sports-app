import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Pencil } from 'lucide-react-native';
import AvatarWithEmoji from '@/components/ui/avatar-with-emoji';

interface Props {
  imageUri: string | null;
  emoji: string;
  disabled?: boolean;
  onPress: () => void;
}

export default function EditableAvatar({ imageUri, emoji, disabled, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      className="self-center"
    >
      <View className="relative">
        <AvatarWithEmoji imageUrl={imageUri} emoji={emoji || '🏋️'} size="xl" />

        <View className="absolute top-0 left-0 rounded-full border-2 border-slate-950 bg-green-500 p-2">
          <Pencil size={14} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
