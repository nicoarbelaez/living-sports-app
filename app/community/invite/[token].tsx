import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Users } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { useRedeemInvite } from '@/features/communities/hooks/useCommunityActions';
import { useAuth } from '@/providers/AuthProvider';

export default function InviteRedeemScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const redeemInvite = useRedeemInvite();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If not authenticated, redirect to login
  if (!session) {
    router.replace('/login');
    return null;
  }

  const handleJoin = async () => {
    if (!token) return;
    setErrorMsg(null);
    try {
      const result = await redeemInvite.mutateAsync(token);
      if (result.error) {
        throw new Error(result.error.message ?? 'No se pudo procesar la invitación');
      }
      const groupId = (result.data as { group_id?: string })?.group_id;
      if (groupId) {
        router.replace(`/community/${groupId}`);
      } else {
        router.replace('/(tabs)/comunidades');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al unirse a la comunidad';
      setErrorMsg(msg);
      Alert.alert('Error', msg);
    }
  };

  return (
    <View className="bg-background flex-1 items-center justify-center px-8">
      <View className="bg-primary/10 mb-6 rounded-full p-6">
        <Users size={48} color="#3b82f6" />
      </View>

      <Text className="text-foreground mb-3 text-center text-2xl font-black">
        Te han invitado a unirte a una comunidad
      </Text>

      <Text className="text-muted-foreground mb-10 text-center text-base leading-relaxed">
        Acepta la invitación para empezar a competir y conectar con otros miembros.
      </Text>

      {errorMsg && (
        <View className="bg-destructive/10 mb-6 w-full rounded-xl p-4">
          <Text className="text-destructive text-center text-sm">{errorMsg}</Text>
        </View>
      )}

      <Button
        onPress={handleJoin}
        loading={redeemInvite.isPending}
        disabled={redeemInvite.isPending || !token}
        className="w-full rounded-2xl py-4"
        size="lg"
      >
        <Text className="text-primary-foreground text-base font-bold">Unirme a la comunidad</Text>
      </Button>

      <Button
        variant="ghost"
        onPress={() => router.replace('/(tabs)/comunidades')}
        className="mt-4 w-full"
        disabled={redeemInvite.isPending}
      >
        <Text className="text-muted-foreground text-base">Cancelar</Text>
      </Button>

      {redeemInvite.isPending && (
        <View className="mt-4 flex-row items-center gap-2">
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text className="text-muted-foreground text-sm">Procesando invitación...</Text>
        </View>
      )}
    </View>
  );
}
