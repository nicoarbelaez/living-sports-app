import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Users,
  MoreVertical,
  UserPlus,
  LogOut,
  Pencil,
  Lock,
  Globe,
} from 'lucide-react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/providers/theme';
import CompetitionsTab from '@/components/community/tabs/CompetitionsTab';
import RankingTab from '@/components/community/tabs/RankingTab';
import SearchUserSheet from '@/features/communities/components/SearchUserSheet';
import BottomSheetModalComponent from '@/components/ui/bottom-sheet-modal';
import { useProfileStore } from '@/features/profile/stores/useProfileStore';
import { useCommunityDetailQuery } from '@/features/communities/hooks/useCommunityQueries';
import {
  useDeleteCommunity,
  useLeaveCommunity,
  useJoinCommunity,
  useUpdateCommunity,
} from '@/features/communities/hooks/useCommunityActions';

const Tab = createMaterialTopTabNavigator();

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const profile = useProfileStore((s) => s.profile);
  const qc = useQueryClient();

  const { data: group, isLoading } = useCommunityDetailQuery(id, profile?.id);

  const optionsRef = useRef<BottomSheetModal>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);

  const isOwner = !!group && group.owner_id === profile?.id;
  const isMember = !!group?.isMember;

  const updateMutation = useUpdateCommunity();
  const deleteMutation = useDeleteCommunity();
  const leaveMutation = useLeaveCommunity();
  const joinMutation = useJoinCommunity();

  const openEdit = () => {
    if (!group) return;
    setEditName(group.name);
    setEditDescription(group.description ?? '');
    setEditIsPublic(group.is_public);
    setEditVisible(true);
  };

  const handleUpdate = async () => {
    if (!group) return;
    try {
      await updateMutation.mutateAsync({
        groupId: group.id,
        name: editName.trim(),
        description: editDescription.trim(),
        isPublic: editIsPublic,
      });
      setEditVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo actualizar.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar comunidad', '¿Estás seguro? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(group!.id);
            router.back();
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'No se pudo eliminar.');
          }
        },
      },
    ]);
  };

  const handleLeave = () => {
    Alert.alert('Salir de la comunidad', '¿Deseas abandonar esta comunidad?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveMutation.mutateAsync(group!.id);
            router.back();
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'No se pudo completar la acción.');
          }
        },
      },
    ]);
  };

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync(group!.id);
      qc.invalidateQueries({ queryKey: ['community', id] });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo unir a la comunidad.');
    }
  };

  if (isLoading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#9fe870" />
      </View>
    );
  }

  if (!group) {
    return (
      <View className="bg-background flex-1 items-center justify-center px-6">
        <Text className="text-muted-foreground mb-6 text-center text-base">
          Comunidad no encontrada.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary rounded-full px-6 py-3"
        >
          <Text className="text-primary-foreground font-semibold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tabBgColor = isDark ? '#1a1c18' : '#ffffff';
  const tabBorderColor = isDark ? '#ffffff1a' : '#0e0f0c1a';

  return (
    <View className="bg-background flex-1">
      {/* ── Hero Header ── */}
      <View className="bg-canvas pb-5">
        {/* Cover band */}
        <View className="bg-canvas-soft relative h-36">
          {group.image_url && (
            <Image
              source={{ uri: group.image_url }}
              className="absolute inset-0 h-full w-full opacity-40"
              blurRadius={12}
            />
          )}
          <View className="absolute inset-0 bg-black/15" />

          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-canvas/80 absolute top-12 left-4 h-10 w-10 items-center justify-center rounded-full"
          >
            <ArrowLeft size={20} color={isDark ? '#e8ebe6' : '#0e0f0c'} />
          </TouchableOpacity>

          {/* Owner options */}
          {isOwner && (
            <TouchableOpacity
              onPress={() => optionsRef.current?.present()}
              className="bg-canvas/80 absolute top-12 right-4 h-10 w-10 items-center justify-center rounded-full"
            >
              <MoreVertical size={20} color={isDark ? '#e8ebe6' : '#0e0f0c'} />
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar + Info */}
        <View className="-mt-10 items-center px-6">
          {group.image_url ? (
            <Image
              source={{ uri: group.image_url }}
              className="border-canvas h-20 w-20 rounded-full border-4"
            />
          ) : (
            <View className="border-canvas bg-canvas-soft h-20 w-20 items-center justify-center rounded-full border-4">
              <Text style={{ fontSize: 34 }}>{group.emoji ?? '🏋️'}</Text>
            </View>
          )}

          <Text className="text-foreground mt-3 text-2xl font-black tracking-tight">
            {group.name}
          </Text>

          <View className="mt-1.5 flex-row items-center gap-2">
            <View className="flex-row items-center gap-1">
              <Users size={13} color="#868685" />
              <Text className="text-muted-foreground text-sm">{group.members_count} miembros</Text>
            </View>
            <View className="bg-canvas-soft flex-row items-center gap-1 rounded-full px-2 py-0.5">
              {group.is_public ? (
                <>
                  <Globe size={11} color="#868685" />
                  <Text className="text-muted-foreground text-xs">Pública</Text>
                </>
              ) : (
                <>
                  <Lock size={11} color="#868685" />
                  <Text className="text-muted-foreground text-xs">Privada</Text>
                </>
              )}
            </View>
          </View>

          {group.description ? (
            <Text className="text-muted-foreground mt-2 px-4 text-center text-sm leading-relaxed">
              {group.description}
            </Text>
          ) : null}

          {/* ── Action buttons ── */}
          <View className="mt-4 flex-row flex-wrap justify-center gap-2">
            {isOwner && (
              <TouchableOpacity
                onPress={() => setInviteVisible(true)}
                className="border-border bg-canvas-soft flex-row items-center gap-2 rounded-full border px-4 py-2.5"
              >
                <UserPlus size={15} color="#868685" />
                <Text className="text-foreground text-sm font-semibold">Invitar</Text>
              </TouchableOpacity>
            )}

            {isMember && !isOwner && (
              <TouchableOpacity
                onPress={handleLeave}
                disabled={leaveMutation.isPending}
                className="border-negative bg-negative-bg flex-row items-center gap-2 rounded-full border px-4 py-2.5"
              >
                {leaveMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ff5c63" />
                ) : (
                  <>
                    <LogOut size={15} color="#ff5c63" />
                    <Text className="text-negative text-sm font-semibold">Salir</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {!isMember && !isOwner && group.is_public && (
              <TouchableOpacity
                onPress={handleJoin}
                disabled={joinMutation.isPending}
                className="bg-primary rounded-full px-6 py-2.5"
              >
                {joinMutation.isPending ? (
                  <ActivityIndicator size="small" color="#0e0f0c" />
                ) : (
                  <Text className="text-primary-foreground text-sm font-semibold">Unirse</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* ── Tabs ── */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#9fe870',
          tabBarInactiveTintColor: isDark ? '#6b6e6a' : '#868685',
          tabBarIndicatorStyle: { backgroundColor: '#9fe870', height: 2 },
          tabBarStyle: {
            backgroundColor: tabBgColor,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: tabBorderColor,
          },
          tabBarLabelStyle: { fontWeight: '700', fontSize: 14, textTransform: 'none' },
        }}
      >
        <Tab.Screen name="Competiciones">{() => <CompetitionsTab groupId={group.id} />}</Tab.Screen>
        <Tab.Screen name="Ranking">{() => <RankingTab groupId={group.id} />}</Tab.Screen>
      </Tab.Navigator>

      {/* ── Owner options sheet ── */}
      <BottomSheetModalComponent ref={optionsRef} title="Opciones" config={{ snapPoints: ['36%'] }}>
        <View className="gap-2 pt-1">
          <TouchableOpacity
            onPress={() => {
              optionsRef.current?.dismiss();
              setTimeout(openEdit, 300);
            }}
            className="bg-canvas-soft flex-row items-center gap-3 rounded-2xl px-4 py-4"
          >
            <Pencil size={18} color="#868685" />
            <Text className="text-foreground text-base font-medium">Editar comunidad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              optionsRef.current?.dismiss();
              setTimeout(handleDelete, 300);
            }}
            className="flex-row items-center gap-3 rounded-2xl px-4 py-4"
          >
            <Text className="text-negative text-base font-medium">Eliminar comunidad</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModalComponent>

      {/* ── Edit sheet ── */}
      <BottomSheetModalComponent
        visible={editVisible}
        title="Editar comunidad"
        subtitle="Actualiza los datos de tu comunidad"
        onClose={() => setEditVisible(false)}
        config={{ snapPoints: ['82%'] }}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-4 pt-2 pb-6">
            {/* Name */}
            <View>
              <Text className="text-foreground mb-1.5 text-sm font-medium">Nombre *</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Nombre de la comunidad"
                placeholderTextColor="#868685"
                maxLength={80}
                className="border-border bg-canvas-soft text-foreground rounded-xl border px-4 py-3 text-sm"
              />
            </View>

            {/* Description */}
            <View>
              <Text className="text-foreground mb-1.5 text-sm font-medium">Descripción</Text>
              <TextInput
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Descripción opcional..."
                placeholderTextColor="#868685"
                multiline
                numberOfLines={4}
                maxLength={300}
                textAlignVertical="top"
                className="border-border bg-canvas-soft text-foreground rounded-xl border px-4 py-3 text-sm"
                style={{ minHeight: 96 }}
              />
            </View>

            {/* Public / Private toggle */}
            <View className="border-border bg-canvas-soft flex-row items-center justify-between rounded-xl border px-4 py-3.5">
              <View className="flex-1 pr-4">
                <Text className="text-foreground text-sm font-medium">
                  {editIsPublic ? 'Comunidad pública' : 'Comunidad privada'}
                </Text>
                <Text className="text-muted-foreground mt-0.5 text-xs">
                  {editIsPublic
                    ? 'Cualquier persona puede encontrarla y unirse'
                    : 'Solo accesible por invitación'}
                </Text>
              </View>
              <Switch
                value={editIsPublic}
                onValueChange={setEditIsPublic}
                trackColor={{ false: '#6b6e6a', true: '#9fe870' }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Save */}
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={updateMutation.isPending || !editName.trim()}
              className="bg-primary items-center rounded-2xl py-4"
              style={{ opacity: !editName.trim() ? 0.5 : 1 }}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#0e0f0c" />
              ) : (
                <Text className="text-primary-foreground text-base font-semibold">
                  Guardar cambios
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheetModalComponent>

      {/* ── Invite sheet ── */}
      <SearchUserSheet
        isVisible={inviteVisible}
        onClose={() => setInviteVisible(false)}
        groupId={group.id}
      />
    </View>
  );
}
