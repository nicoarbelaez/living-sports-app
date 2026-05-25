import React, { useRef, useState } from 'react';

import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { useTheme } from '@/providers/theme';
import { useAuth } from '@/providers/AuthProvider';

import { useCommunityDetail } from '@/features/communities/hooks/useCommunityDetail';

import {
  useCreateInvite,
  useDeleteCommunity,
} from '@/features/communities/hooks/useCommunityActions';

import CommunityHeroHeader from '@/components/community/CommunityHeroHeader';

import CompetitionsTab from '@/components/community/tabs/CompetitionsTab';
import RankingTab from '@/components/community/tabs/RankingTab';

import ActionSheet from '@/components/ui/action-sheet';

import { AlertDialog } from '@/components/ui/alert-dialog';

import SearchUserSheet from '@/features/communities/components/SearchUserSheet';

const Tab = createMaterialTopTabNavigator();

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { session } = useAuth();
  const isDark = theme === 'dark';
  const currentUserId = session?.user?.id;
  const inviteSheetRef = useRef<BottomSheetModal>(null);
  const [showSearchSheet, setShowSearchSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { group, loading } = useCommunityDetail(id);
  const createInvite = useCreateInvite();
  const { deleteCommunity, isDeleting } = useDeleteCommunity({
    onSuccess: () => router.back(),
  });
  const isOwner = !!currentUserId && !!group && currentUserId === group.owner_id;
  const handleShareLink = async () => {
    if (!id) return;

    try {
      const result = await createInvite.mutateAsync({
        group_id: id,
        channel: 'link',
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      const token = (
        result.data as {
          token?: string;
        }
      )?.token;

      if (token) {
        const link = `livingsports://invite/${token}`;

        try {
          const Clipboard = await import('expo-clipboard');

          await Clipboard.setStringAsync(link);

          Alert.alert('¡Listo!', 'El enlace fue copiado.');
        } catch {
          Alert.alert('Invitación', link);
        }
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo crear el enlace');
    }
  };

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!group) {
    return (
      <View className="bg-background flex-1 items-center justify-center px-6">
        <Text className="text-foreground mb-5 text-center">Comunidad no encontrada</Text>

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary rounded-full px-6 py-3"
        >
          <Text className="text-primary-foreground font-bold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <CommunityHeroHeader
        group={group}
        isOwner={isOwner}
        onBack={() => router.back()}
        onInvite={() => inviteSheetRef.current?.present()}
        onDelete={() => setShowDeleteDialog(true)}
      />

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#3b82f6',

          tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',

          tabBarIndicatorStyle: {
            backgroundColor: '#3b82f6',
            height: 2,
          },

          tabBarStyle: {
            backgroundColor: isDark ? '#111827' : '#ffffff',

            elevation: 0,

            shadowOpacity: 0,

            borderBottomWidth: 1,

            borderBottomColor: isDark ? '#1f2937' : '#f3f4f6',
          },

          tabBarLabelStyle: {
            fontWeight: '700',
            fontSize: 15,
            textTransform: 'none',
          },
        }}
      >
        <Tab.Screen name="Competiciones">{() => <CompetitionsTab groupId={group.id} />}</Tab.Screen>

        <Tab.Screen name="Ranking">{() => <RankingTab groupId={group.id} />}</Tab.Screen>
      </Tab.Navigator>

      <ActionSheet
        ref={inviteSheetRef}
        title="Invitar miembros"
        actions={[
          {
            label: '🔗 Compartir link',
            onPress: handleShareLink,
          },
          {
            label: '👤 Buscar usuario',
            onPress: () => setShowSearchSheet(true),
          },
        ]}
      />

      <SearchUserSheet
        isVisible={showSearchSheet}
        onClose={() => setShowSearchSheet(false)}
        groupId={group.id}
      />

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar comunidad"
        description={`¿Eliminar "${group.name}" permanentemente?`}
        confirmLabel="Eliminar"
        destructive
        loading={isDeleting}
        onConfirm={() => deleteCommunity(group.id)}
      />
    </View>
  );
}
