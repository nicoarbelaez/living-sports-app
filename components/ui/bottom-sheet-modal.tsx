import React, { ReactNode, useMemo, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { cn } from '@/lib/utils';

export interface BottomSheetModalConfig {
  snapPoints?: (number | string)[];
  enablePanDownToClose?: boolean;
  enableOverDrag?: boolean;
  handleHeight?: number;
  enableDynamicSizing?: boolean;
  peekBackdrop?: boolean; // when true: backdrop hides at snap index 0, shows from index 1+
}

export interface BottomSheetModalComponentProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  config?: BottomSheetModalConfig;
  bottomSheetRef?: React.RefObject<BottomSheetModal | null>;
  footer?: ReactNode;
  contentClassName?: string;
}

export default function BottomSheetModalComponent({
  visible,
  title,
  subtitle,
  children,
  onClose,
  config = {},
  bottomSheetRef,
  footer,
  contentClassName,
}: BottomSheetModalComponentProps) {
  const internalRef = useRef<BottomSheetModal>(null);
  const ref = bottomSheetRef || internalRef;

  const {
    snapPoints = [],
    enablePanDownToClose = true,
    enableOverDrag = true,
    enableDynamicSizing = true,
    peekBackdrop = false,
  } = config;

  const defaultSnapPoints = useMemo(() => snapPoints, [snapPoints]);

  React.useEffect(() => {
    if (visible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [visible, ref]);

  const handleClose = useCallback(() => {
    ref.current?.dismiss();
    onClose();
  }, [onClose, ref]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={peekBackdrop ? 0 : -1}
        appearsOnIndex={peekBackdrop ? 1 : 0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [peekBackdrop]
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={defaultSnapPoints}
      enablePanDownToClose={enablePanDownToClose}
      enableOverDrag={enableOverDrag}
      onDismiss={handleClose}
      handleIndicatorStyle={{ backgroundColor: '#cbd5e1', height: 4, width: 40 }}
      handleStyle={{ backgroundColor: 'transparent' }}
      backdropComponent={renderBackdrop}
      enableDynamicSizing={enableDynamicSizing}
    >
      <BottomSheetView className="bg-background flex-1">
        {(title || subtitle) && (
          <View className="border-border border-b px-6 py-4">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                {title && <Text className="text-foreground text-lg font-semibold">{title}</Text>}
                {subtitle && <Text className="text-muted-foreground mt-1 text-sm">{subtitle}</Text>}
              </View>
              <TouchableOpacity onPress={handleClose} className="active:bg-accent rounded-full p-1">
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className={cn('flex-1 px-6 pt-4 pb-8', contentClassName)}>{children}</View>
        {footer && footer}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
