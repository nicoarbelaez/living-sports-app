import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ArrowLeft, Users, UserPlus, Trash2 } from 'lucide-react-native';
import type { GroupDetail } from '@/features/communities/services/fetchCommunityDetail';

interface Props {
  group: GroupDetail;
  isOwner: boolean;
  onBack: () => void;
  onInvite: () => void;
  onDelete: () => void;
}

export default function CommunityHeroHeader({ group, isOwner, onBack, onInvite, onDelete }: Props) {
  return (
    <View className="bg-white pb-4 shadow-sm dark:bg-gray-900">
      <View className="relative h-32 bg-blue-100 dark:bg-blue-900/30">
        {group.image_url && (
          <Image
            source={{ uri: group.image_url }}
            className="absolute inset-0 h-full w-full opacity-40"
            blurRadius={10}
          />
        )}
        <View className="absolute inset-0 bg-black/30" />

        <TouchableOpacity
          onPress={onBack}
          className="absolute top-12 left-4 h-10 w-10 items-center justify-center rounded-full bg-black/40"
        >
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>

        {isOwner && (
          <View className="absolute top-12 right-4 flex-row gap-2">
            <TouchableOpacity
              onPress={onInvite}
              className="flex-row items-center gap-1.5 rounded-full bg-black/40 px-3 py-2"
            >
              <UserPlus size={16} color="#fff" />
              <Text className="text-xs font-semibold text-white">Invitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              className="items-center justify-center rounded-full bg-red-500/80 px-3 py-2"
            >
              <Trash2 size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="-mt-10 items-center px-6">
        {group.image_url ? (
          <Image
            source={{ uri: group.image_url }}
            className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-900"
          />
        ) : (
          <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gray-200 dark:border-gray-900 dark:bg-gray-700">
            <Text style={{ fontSize: 36 }}>{group.emoji ?? '🏋️'}</Text>
          </View>
        )}

        <Text className="mt-2 text-2xl font-black text-black dark:text-white">{group.name}</Text>

        <View className="mt-1 flex-row items-center gap-1">
          <Users size={14} color="#6b7280" />
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {group.members_count} miembros
          </Text>
        </View>
      </View>
    </View>
  );
}
