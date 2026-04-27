import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react-native';
import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useMediaPicker } from '@/hooks/useMediaPicker';
import ActionSheet from '@/components/ui/action-sheet';
import BottomSheetModalComponent from '@/components/ui/bottom-sheet-modal';
import AvatarWithEmoji from '@/components/ui/avatar-with-emoji';

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
  const emojiPickerRef = useRef<BottomSheetModal>(null);
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
        className="mb-4 self-center"
      >
        <AvatarWithEmoji imageUrl={imageUri} emoji={emoji || '🏋️'} size="xl" />
      </TouchableOpacity>

      <View className="flex-row items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<ImageIcon size={16} color="#64748b" />}
          onPress={() => setShowActionSheet(true)}
          disabled={disabled}
          className="rounded-lg"
        >
          <Text className="text-secondary-foreground text-xs font-medium">Cambiar</Text>
        </Button>
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

      {/* Emoji Picker Bottom Sheet Modal */}
      <BottomSheetModalComponent
        visible={showEmojiPicker}
        title="Selecciona emoji"
        onClose={() => setShowEmojiPicker(false)}
        config={{ snapPoints: ['50%', '90%'] }}
        bottomSheetRef={emojiPickerRef}
      >
        <BottomSheetFlatList
          data={GYM_EMOJIS}
          keyExtractor={(item) => item}
          numColumns={5}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleChooseEmoji(item)}
              className="flex-1 items-center justify-center py-3"
            >
              <Text className="text-5xl">{item}</Text>
            </TouchableOpacity>
          )}
        />
      </BottomSheetModalComponent>
    </>
  );
}
