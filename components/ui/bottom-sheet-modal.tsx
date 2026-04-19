import React, { ReactNode, useMemo, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetView, useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';

export interface BottomSheetModalConfig {
  snapPoints?: (number | string)[];
  enablePanDownToClose?: boolean;
  enableOverDrag?: boolean;
  handleHeight?: number;
}

export interface BottomSheetModalComponentProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  config?: BottomSheetModalConfig;
  bottomSheetRef?: React.RefObject<BottomSheetModal | null>;
}

export default function BottomSheetModalComponent({
  visible,
  title,
  subtitle,
  children,
  onClose,
  config = {},
  bottomSheetRef,
}: BottomSheetModalComponentProps) {
  const internalRef = useRef<BottomSheetModal>(null);
  const ref = bottomSheetRef || internalRef;

  const {
    snapPoints = [200, '50%', '90%'],
    enablePanDownToClose = true,
    enableOverDrag = true,
  } = config;

  const defaultSnapPoints = useMemo(() => snapPoints, []);

  React.useEffect(() => {
    if (visible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    ref.current?.dismiss();
    onClose();
  }, [onClose]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={defaultSnapPoints}
      enablePanDownToClose={enablePanDownToClose}
      enableOverDrag={enableOverDrag}
      onDismiss={handleClose}
      handleIndicatorStyle={{ backgroundColor: '#cbd5e1', height: 4, width: 40 }}
      handleStyle={{ backgroundColor: 'transparent' }}
      backdropComponent={({ animatedIndex, animatedPosition }) => (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onPress={handleClose}
          activeOpacity={1}
        />
      )}
    >
      <BottomSheetView className="flex-1 bg-white dark:bg-slate-900">
        {/* Header */}
        {(title || subtitle) && (
          <View className="border-b border-gray-200 px-6 py-4 dark:border-slate-700">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                {title && (
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="rounded-full p-1 active:bg-gray-100 dark:active:bg-slate-800"
              >
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Content */}
        <View className="flex-1 px-6 py-4">{children}</View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
