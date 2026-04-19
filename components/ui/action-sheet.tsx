import React from 'react';
import { Modal, View, TouchableOpacity, Text, SafeAreaView, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

export interface ActionSheetAction {
  label: string;
  icon?: string;
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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />

      <View className="flex-1" pointerEvents="box-none">
        <SafeAreaView className="flex-1 justify-end">
          <View className="rounded-t-3xl bg-white dark:bg-slate-900">
            {/* Header */}
            {title && (
              <View className="flex-row items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-slate-700">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">{title}</Text>
                <TouchableOpacity onPress={onClose}>
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}

            {/* Actions */}
            <View className="px-4 py-3">
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    action.onPress();
                    onClose();
                  }}
                  className="flex-row items-center gap-3 rounded-xl px-4 py-3"
                >
                  <Text
                    className={`flex-1 text-base font-medium ${
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

            {/* Cancel */}
            <View className="border-t border-gray-200 px-4 py-2 dark:border-slate-700">
              <TouchableOpacity
                onPress={onClose}
                className="rounded-xl bg-gray-100 py-3 dark:bg-slate-800"
              >
                <Text className="text-center font-semibold text-gray-900 dark:text-white">
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>

            <View className="h-6" />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
