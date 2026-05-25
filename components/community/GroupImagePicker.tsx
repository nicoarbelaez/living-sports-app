import React, { useRef } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useMediaPicker } from '@/hooks/useMediaPicker';
import ActionSheet from '@/components/ui/action-sheet';
import BottomSheetModalComponent from '@/components/ui/bottom-sheet-modal';
import EditableAvatar from './editable-avatar';

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
  disabled,
}: GroupImagePickerProps) {
  const actionSheetRef = useRef<BottomSheetModal>(null);

  const emojiSheetRef = useRef<BottomSheetModal>(null);

  const { handlePickFromGallery, handlePickFromCamera } = useMediaPicker({
    multiple: false,
    allowVideo: false,
    resizeWidth: 400,
    compressQuality: 0.8,
  });

  const openActions = () => {
    actionSheetRef.current?.present();
  };

  const openEmojiPicker = () => {
    actionSheetRef.current?.dismiss();

    requestAnimationFrame(() => {
      emojiSheetRef.current?.present();
    });
  };

  const handleGallery = async () => {
    const items = await handlePickFromGallery();

    if (items.length > 0) {
      onImageChange(items[0].uri);
      onEmojiChange('');
    }
  };

  const handleCamera = async () => {
    const item = await handlePickFromCamera();

    if (item) {
      onImageChange(item.uri);
      onEmojiChange('');
    }
  };

  const handleEmoji = (selected: string) => {
    onImageChange(null);

    onEmojiChange(selected);

    emojiSheetRef.current?.dismiss();
  };

  return (
    <>
      <EditableAvatar imageUri={imageUri} emoji={emoji} disabled={disabled} onPress={openActions} />

      <ActionSheet
        ref={actionSheetRef}
        title="Imagen del grupo"
        actions={[
          {
            label: '📷 Galería',
            onPress: handleGallery,
          },
          {
            label: '📸 Cámara',
            onPress: handleCamera,
          },
          {
            label: '😀 Emoji',
            onPress: openEmojiPicker,
          },
        ]}
      />

      <BottomSheetModalComponent
        ref={emojiSheetRef}
        title="Selecciona emoji"
        config={{
          snapPoints: ['55%'],
        }}
      >
        <BottomSheetFlatList
          data={GYM_EMOJIS}
          numColumns={5}
          keyExtractor={(item) => item}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-1 items-center justify-center py-5"
              onPress={() => handleEmoji(item)}
            >
              <Text className="text-5xl">{item}</Text>
            </TouchableOpacity>
          )}
        />
      </BottomSheetModalComponent>
    </>
  );
}
