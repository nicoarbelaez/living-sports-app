import React, { forwardRef, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';

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
  // visible-controlled pattern (alternative to forwardRef pattern)
  visible?: boolean;
  bottomSheetRef?: React.RefObject<BottomSheetModal | null>;
}

export type BottomSheetRef = BottomSheetModal | null;

const BottomSheetModalComponent = forwardRef<BottomSheetRef, BottomSheetModalProps>(
  (
    { title, subtitle, children, onClose, config, visible, bottomSheetRef: externalRef },
    forwardedRef
  ) => {
    const internalRef = useRef<BottomSheetModal>(null);

    // Pattern A (forwardRef): parent holds ref and calls .present() directly
    // Pattern B (visible): component handles present/dismiss via useEffect
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
    }, [visible]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      []
    );

    const handleClose = useCallback(() => {
      resolvedRef.current?.dismiss();
    }, [resolvedRef]);

    return (
      <BottomSheetModal
        ref={resolvedRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={config?.enablePanDownToClose ?? true}
        onDismiss={onClose}
        backgroundStyle={{ backgroundColor: '#0f172a' }}
        handleIndicatorStyle={{ backgroundColor: '#64748b' }}
      >
        <BottomSheetView className="flex-1 px-5 pb-6">
          {(title || subtitle) && (
            <View className="mb-5 flex-row items-start justify-between">
              <View className="flex-1">
                {title && <Text className="text-xl font-semibold text-white">{title}</Text>}
                {subtitle && <Text className="mt-1 text-sm text-slate-400">{subtitle}</Text>}
              </View>
              <TouchableOpacity onPress={handleClose} className="p-1">
                <X size={22} color="#94a3b8" />
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
