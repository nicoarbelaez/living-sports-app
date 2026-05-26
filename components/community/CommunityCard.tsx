import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { UserPlus, CheckCircle } from 'lucide-react-native';
import AvatarWithEmoji from '@/components/ui/avatar-with-emoji';
import { useCommunityListContext } from '@/features/communities/contexts/CommunityListContext';
import type { Group } from '@/types/group';

export default function CommunityCard({ group }: { group: Group }) {
  const router = useRouter();
  const { joinedIds, onJoin, joiningId, ownedGroupId } = useCommunityListContext();
  const isOwner = ownedGroupId === group.id;
  const isMember = isOwner || joinedIds.has(group.id);
  const isJoining = joiningId === group.id;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/community/${group.id}` as any)}
    >
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="border-border bg-canvas mb-3 flex-row items-center gap-4 rounded-2xl border p-4"
      >
        <AvatarWithEmoji imageUrl={group.imageUrl} emoji={group.emoji ?? '🏋️'} size="lg" />

        <View className="flex-1">
          <Text className="text-foreground mb-0.5 text-base font-semibold" numberOfLines={1}>
            {group.name}
          </Text>
          <Text className="text-muted-foreground text-sm">{group.membersCount} participantes</Text>
        </View>

        {isOwner ? (
          <View className="bg-primary rounded-full px-3 py-1.5">
            <Text className="text-primary-foreground text-xs font-semibold">Mi comunidad</Text>
          </View>
        ) : !isMember ? (
          <TouchableOpacity
            onPress={() => onJoin(group.id)}
            disabled={isJoining}
            className="bg-primary flex-row items-center gap-1.5 rounded-full px-3 py-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="#0e0f0c" />
            ) : (
              <>
                <UserPlus size={13} color="#0e0f0c" />
                <Text className="text-primary-foreground text-xs font-semibold">Unirse</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View className="bg-primary-pale flex-row items-center gap-1 rounded-full px-3 py-1.5">
            <CheckCircle size={13} color="#054d28" />
            <Text className="text-positive-deep text-xs font-semibold">Miembro</Text>
          </View>
        )}
      </MotiView>
    </TouchableOpacity>
  );
}
