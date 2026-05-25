import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => onOpenChange(false)}
      >
        <TouchableOpacity activeOpacity={1}>{children}</TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`bg-background mx-4 overflow-hidden rounded-2xl ${className ?? ''}`}>
      {children}
    </View>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <View className="border-border border-b px-4 py-4">{children}</View>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
  },
});
