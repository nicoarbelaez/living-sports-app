import React, { forwardRef, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { useTheme } from '@/providers/theme';

export interface BottomSheetModalConfig {
  snapPoints?: (string | number)[];
  enablePanDownToClose?: boolean;
}

export interface BottomSheetModalProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose?: () => void;
  config?: BottomSheetModalConfig;
  visible?: boolean;
  bottomSheetRef?: React.RefObject<BottomSheetModal | null>;
  /** Prevent dismiss/pan/backdrop-close while true (e.g. during upload) */
  locked?: boolean;
}

export type BottomSheetRef = BottomSheetModal | null;

const COLORS = {
  light: {
    background: '#ffffff',
    handle: '#0e0f0c33',
    closeIcon: '#868685',
    closeIconDisabled: '#d1d5db',
  },
  dark: {
    background: '#1a1c18',
    handle: '#ffffff33',
    closeIcon: '#6b6e6a',
    closeIconDisabled: '#374151',
  },
} as const;

const BottomSheetModalComponent = forwardRef<BottomSheetRef, BottomSheetModalProps>(
  (
    {
      title,
      subtitle,
      children,
      onClose,
      config,
      visible,
      bottomSheetRef: externalRef,
      locked = false,
    },
    forwardedRef
  ) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];

    const internalRef = useRef<BottomSheetModal>(null);

    const resolvedRef = useMemo<React.RefObject<BottomSheetModal>>(() => {
      if (forwardedRef && typeof forwardedRef !== 'function') {
        return forwardedRef as React.RefObject<BottomSheetModal>;
      }
      return externalRef ?? internalRef;
    }, [forwardedRef, externalRef]);

    const snapPoints = useMemo(() => config?.snapPoints ?? ['50%'], [config?.snapPoints]);

    useEffect(() => {
      if (visible === undefined) return;
      if (visible) {
        resolvedRef.current?.present();
      } else {
        resolvedRef.current?.dismiss();
      }
    }, [visible, resolvedRef]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior={locked ? 'none' : 'close'}
        />
      ),
      [locked]
    );

    const handleClose = useCallback(() => {
      if (locked) return;
      resolvedRef.current?.dismiss();
    }, [resolvedRef, locked]);

    return (
      <BottomSheetModal
        ref={resolvedRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={!locked && (config?.enablePanDownToClose ?? true)}
        onDismiss={onClose}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{ backgroundColor: colors.handle }}
      >
        <BottomSheetView className="flex-1 px-5 pb-6">
          {(title || subtitle) && (
            <View className="mb-5 flex-row items-start justify-between">
              <View className="flex-1">
                {title && <Text className="text-foreground text-xl font-semibold">{title}</Text>}
                {subtitle && <Text className="text-muted-foreground mt-1 text-sm">{subtitle}</Text>}
              </View>
              <TouchableOpacity onPress={handleClose} disabled={locked} className="p-1">
                <X size={22} color={locked ? colors.closeIconDisabled : colors.closeIcon} />
              </TouchableOpacity>
            </View>
          )}
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

BottomSheetModalComponent.displayName = 'BottomSheetModalComponent';

export default BottomSheetModalComponent;
