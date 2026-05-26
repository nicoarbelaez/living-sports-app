import React from 'react';
import { Modal, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Button } from './button';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
  loading?: boolean;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  destructive = false,
  loading = false,
}: AlertDialogProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => !loading && onOpenChange(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}

          <View style={styles.actions}>
            <Button
              variant="ghost"
              onPress={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              <Text className="text-foreground font-semibold">{cancelLabel}</Text>
            </Button>

            <View style={styles.separator} />

            <Button
              variant={destructive ? 'destructive' : 'default'}
              onPress={onConfirm}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  className={`font-semibold ${destructive ? 'text-destructive-foreground' : 'text-primary-foreground'}`}
                >
                  {confirmLabel}
                </Text>
              )}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  separator: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
});
