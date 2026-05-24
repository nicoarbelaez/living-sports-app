import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Camera, Smile } from 'lucide-react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useMediaPicker } from '@/hooks/useMediaPicker';
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
  const [showOptions, setShowOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { handlePickFromGallery, handlePickFromCamera } = useMediaPicker({
    multiple: false,
    allowVideo: false,
    resizeWidth: 400,
    compressQuality: 0.8,
  });

  const handleChooseFromGallery = async () => {
    setShowOptions(false);
    const items = await handlePickFromGallery();
    if (items.length > 0) {
      onImageChange(items[0].uri);
      onEmojiChange('');
    }
  };

  const handleChooseFromCamera = async () => {
    setShowOptions(false);
    const item = await handlePickFromCamera();
    if (item) {
      onImageChange(item.uri);
      onEmojiChange('');
    }
  };

  const handleEmojiPress = () => {
    setShowOptions(false);
    setTimeout(() => setShowEmojiPicker(true), 200);
  };

  const handleChooseEmoji = (selected: string) => {
    onImageChange(null);
    onEmojiChange(selected);
    setShowEmojiPicker(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowOptions(true)}
        disabled={disabled}
        className="mb-4 self-center"
      >
        <AvatarWithEmoji imageUrl={imageUri} emoji={emoji || '🏋️'} size="xl" />
      </TouchableOpacity>

      {/* Options picker */}
      <BottomSheetModalComponent
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        config={{ snapPoints: ['25%'] }}
      >
        <View className="flex-row gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<ImageIcon size={16} color="#64748b" />}
            onPress={handleChooseFromGallery}
            className="flex-1 rounded-xl"
          >
            <Text className="text-secondary-foreground text-xs font-medium">Galería</Text>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Camera size={16} color="#64748b" />}
            onPress={handleChooseFromCamera}
            className="flex-1 rounded-xl"
          >
            <Text className="text-secondary-foreground text-xs font-medium">Cámara</Text>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Smile size={16} color="#64748b" />}
            onPress={handleEmojiPress}
            className="flex-1 rounded-xl"
          >
            <Text className="text-secondary-foreground text-xs font-medium">Emoji</Text>
          </Button>
        </View>
      </BottomSheetModalComponent>

      {/* Emoji picker */}
      <BottomSheetModalComponent
        visible={showEmojiPicker}
        title="Selecciona emoji"
        onClose={() => setShowEmojiPicker(false)}
        config={{ snapPoints: ['60%'] }}
        contentClassName="px-0 py-0"
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
