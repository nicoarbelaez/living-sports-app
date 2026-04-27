import React, { useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheetModalComponent from '@/components/ui/bottom-sheet-modal';

export interface ActionSheetAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

export interface ActionSheetProps {
  visible: boolean;
  title?: string;
  actions: ActionSheetAction[];
  onClose: () => void;
}

export default function ActionSheet({ visible, title, actions, onClose }: ActionSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  return (
    <BottomSheetModalComponent
      visible={visible}
      title={title}
      onClose={onClose}
      config={{ snapPoints: [Math.min(80 + actions.length * 50, 300)] }}
      bottomSheetRef={bottomSheetRef}
    >
      {/* Actions */}
      <View className="gap-2">
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              action.onPress();
              onClose();
            }}
            className="rounded-xl px-4 py-3 active:bg-gray-100 dark:active:bg-slate-800"
          >
            <Text
              className={`text-base font-medium ${
                action.destructive
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheetModalComponent>
  );
}
