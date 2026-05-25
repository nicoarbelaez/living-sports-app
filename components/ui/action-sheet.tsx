import React, { forwardRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheetModalComponent from './bottom-sheet-modal';

export interface ActionSheetAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface Props {
  title?: string;
  actions: ActionSheetAction[];
}

const ActionSheet = forwardRef<BottomSheetModal, Props>(({ title, actions }, ref) => {
  return (
    <BottomSheetModalComponent
      ref={ref}
      title={title}
      config={{
        snapPoints: ['32%'],
      }}
    >
      <View className="gap-2">
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              action.onPress();

              (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
            }}
            className="rounded-2xl px-4 py-4"
          >
            <Text
              className={`text-base font-medium ${
                action.destructive ? 'text-red-400' : 'text-white'
              }`}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheetModalComponent>
  );
});

ActionSheet.displayName = 'ActionSheet';

export default ActionSheet;
