import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Image as ImageIcon } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useMediaPicker } from '@/hooks/useMediaPicker';
import ActionSheet from '@/components/ui/action-sheet';
import BottomSheetComponent from '@/components/ui/bottom-sheet';

const GYM_EMOJIS = [
  '🏋️',
  '💪',
  '🤸',
  '🏃',
  '🚴',
  '⚽',
  '🏀',
  '🎯',
  '🏊',
  '🥊',
  '🏆',
  '⚡',
  '🔥',
  '🎽',
  '🏅',
];

export interface GroupImagePickerProps {
  imageUri: string | null;
  emoji: string;
  onImageChange: (uri: string | null) => void;
  onEmojiChange: (emoji: string) => void;
  disabled?: boolean;
}

export default function GroupImagePicker({
  imageUri,
  emoji,
  onImageChange,
  onEmojiChange,
  disabled = false,
}: GroupImagePickerProps) {
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { handlePickFromGallery, handlePickFromCamera } = useMediaPicker({
    multiple: false,
    allowVideo: false,
    resizeWidth: 400,
    compressQuality: 0.8,
  });

  const handleChooseFromGallery = async () => {
    const items = await handlePickFromGallery();
    if (items.length > 0) {
      onImageChange(items[0].uri);
      onEmojiChange('');
    }
  };

  const handleChooseFromCamera = async () => {
    const item = await handlePickFromCamera();
    if (item) {
      onImageChange(item.uri);
      onEmojiChange('');
    }
  };

  const handleChooseEmoji = (selected: string) => {
    onImageChange(null);
    onEmojiChange(selected);
    setShowEmojiPicker(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowActionSheet(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View className="mb-4 h-32 w-32 self-center overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-4xl">{emoji || '🏋️'}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View className="flex-row items-center justify-center gap-2">
        <TouchableOpacity
          onPress={() => setShowActionSheet(true)}
          disabled={disabled}
          className="flex-row items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-700"
        >
          <ImageIcon size={16} color="#64748b" />
          <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">Cambiar</Text>
        </TouchableOpacity>
      </View>

      {/* Action Sheet for image/emoji selection */}
      <ActionSheet
        visible={showActionSheet}
        title="Cambiar imagen del grupo"
        onClose={() => setShowActionSheet(false)}
        actions={[
          { label: '📷 Galería', onPress: handleChooseFromGallery },
          { label: '📸 Cámara', onPress: handleChooseFromCamera },
          { label: '😀 Emoji', onPress: () => setShowEmojiPicker(true) },
        ]}
      />

      {/* Emoji Picker Bottom Sheet */}
      <BottomSheetComponent
        visible={showEmojiPicker}
        title="Selecciona emoji"
        onClose={() => setShowEmojiPicker(false)}
        config={{ snapPoints: ['50%', '90%'] }}
      >
        <FlatList
          data={GYM_EMOJIS}
          keyExtractor={(item) => item}
          numColumns={5}
          scrollEnabled
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleChooseEmoji(item)}
              className="flex-1 items-center justify-center py-3"
            >
              <Text className="text-5xl">{item}</Text>
            </TouchableOpacity>
          )}
        />
      </BottomSheetComponent>
    </>
  );
}
