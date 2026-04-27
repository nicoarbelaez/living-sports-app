import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/providers/theme';
import ActionSheet from '@/components/ui/action-sheet';
import type { ActionSheetAction } from '@/components/ui/action-sheet';

export type { ActionSheetAction as CreateActionMenuItem };

interface BaseCreateActionCardProps {
  title: string;
  onPress: () => void;
  contextMenuItems?: ActionSheetAction[];
}

interface RowVariantProps extends BaseCreateActionCardProps {
  variant: 'row';
  subtitle: string;
}

interface GridVariantProps extends BaseCreateActionCardProps {
  variant: 'grid';
  subtitle?: never;
}

export type CreateActionCardProps = RowVariantProps | GridVariantProps;

function RowCard({
  title,
  subtitle,
  onPress,
  onLongPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay: 100 }}
      className="w-full"
    >
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} onLongPress={onLongPress}>
        <View className="flex-row items-center rounded-2xl border border-dashed border-blue-500 bg-white px-6 py-4 dark:bg-gray-900">
          <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-blue-500">
            <Plus size={20} color="#ffffff" />
          </View>
          <View>
            <Text className="text-lg font-bold text-black dark:text-white">{title}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}

function GridCard({
  title,
  onPress,
  onLongPress,
  isDark,
}: {
  title: string;
  onPress: () => void;
  onLongPress?: () => void;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1"
    >
      <View className="m-1 min-h-[120px] items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <View className="mb-2 rounded-full bg-blue-100 p-2 dark:bg-blue-900/50">
          <Plus size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
        </View>
        <Text className="text-center text-xs font-semibold text-blue-600 dark:text-blue-400">
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CreateActionCard(props: CreateActionCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { variant, title, onPress, contextMenuItems } = props;

  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLongPress = contextMenuItems?.length ? () => setSheetOpen(true) : undefined;

  return (
    <>
      {variant === 'row' ? (
        <RowCard
          title={title}
          subtitle={props.subtitle}
          onPress={onPress}
          onLongPress={handleLongPress}
        />
      ) : (
        <GridCard title={title} onPress={onPress} onLongPress={handleLongPress} isDark={isDark} />
      )}

      {contextMenuItems?.length ? (
        <ActionSheet
          visible={sheetOpen}
          actions={contextMenuItems}
          onClose={() => setSheetOpen(false)}
        />
      ) : null}
    </>
  );
}
