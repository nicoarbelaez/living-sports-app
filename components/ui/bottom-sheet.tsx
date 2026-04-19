import React, { ReactNode, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView, useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';

export interface BottomSheetConfig {
  snapPoints?: (number | string)[];
  enablePanDownToClose?: boolean;
  enableOverDrag?: boolean;
  handleHeight?: number;
  contentHeight?: 'auto' | 'full';
}

export interface BottomSheetComponentProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  config?: BottomSheetConfig;
}

export default function BottomSheetComponent({
  visible,
  title,
  subtitle,
  children,
  onClose,
  config = {},
}: BottomSheetComponentProps) {
  const {
    snapPoints = [200, '50%', '90%'],
    enablePanDownToClose = true,
    enableOverDrag = true,
  } = config;

  const defaultSnapPoints = useMemo(() => snapPoints, []);

  if (!visible) return null;

  return (
    <BottomSheet
      snapPoints={defaultSnapPoints}
      enablePanDownToClose={enablePanDownToClose}
      enableOverDrag={enableOverDrag}
      onClose={onClose}
      handleIndicatorStyle={{ backgroundColor: '#cbd5e1', height: 4, width: 40 }}
      handleStyle={{ backgroundColor: 'transparent' }}
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
                onPress={onClose}
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
    </BottomSheet>
  );
}
