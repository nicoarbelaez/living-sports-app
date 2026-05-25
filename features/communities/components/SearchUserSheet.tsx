import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { Search, UserPlus } from 'lucide-react-native';
import BottomSheetModalComponent from '@/components/ui/bottom-sheet-modal';
import AvatarWithEmoji from '@/components/ui/avatar-with-emoji';
import { supabase } from '@/lib/supabase';
import { useCreateInvite } from '@/features/communities/hooks/useCommunityActions';

interface UserResult {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface SearchUserSheetProps {
  isVisible: boolean;
  onClose: () => void;
  groupId: string;
}

export default function SearchUserSheet({ isVisible, onClose, groupId }: SearchUserSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const createInvite = useCreateInvite();

  // 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const searchUsers = async () => {
      setSearching(true);
      try {
        const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/search-users?q=${encodeURIComponent(debouncedQuery.trim())}`;
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
        });
        const data = (await res.json()) as UserResult[];
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  const handleInvite = async (user: UserResult) => {
    setInvitingId(user.id);
    try {
      await createInvite.mutateAsync({
        group_id: groupId,
        channel: 'nickname',
        target_username: user.username,
      });
      setInvitedIds((prev) => new Set(prev).add(user.id));
    } finally {
      setInvitingId(null);
    }
  };

  const handleClose = () => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setInvitedIds(new Set());
    onClose();
  };

  return (
    <BottomSheetModalComponent
      visible={isVisible}
      title="Buscar usuario"
      subtitle="Invita a alguien a tu comunidad por nombre de usuario"
      onClose={handleClose}
      bottomSheetRef={bottomSheetRef}
      config={{ snapPoints: ['75%', '90%'] }}
    >
      <View className="flex-1 gap-4">
        {/* Search input */}
        <View className="border-border flex-row items-center gap-2 rounded-xl border bg-transparent px-3 py-2">
          <Search size={18} color="#6b7280" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por nombre de usuario..."
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
            className="text-foreground flex-1 text-sm"
          />
          {searching && <ActivityIndicator size="small" color="#6b7280" />}
        </View>

        {/* Results */}
        <FlashList
          data={results}
          keyExtractor={(item) => item.id}
          estimatedItemSize={64}
          ListEmptyComponent={
            debouncedQuery.trim() && !searching ? (
              <View className="items-center py-8">
                <Text className="text-muted-foreground text-sm">No se encontraron usuarios.</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const isInvited = invitedIds.has(item.id);
            const isInviting = invitingId === item.id;
            return (
              <View className="flex-row items-center gap-3 py-2">
                <AvatarWithEmoji
                  imageUrl={item.avatar_url}
                  fallback={item.username?.[0]?.toUpperCase() ?? '?'}
                  size="sm"
                />
                <Text className="text-foreground flex-1 text-sm font-medium">
                  @{item.username}
                </Text>
                <TouchableOpacity
                  onPress={() => handleInvite(item)}
                  disabled={isInvited || isInviting}
                  className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 ${
                    isInvited ? 'bg-muted' : 'bg-primary'
                  }`}
                >
                  {isInviting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <UserPlus size={14} color={isInvited ? '#6b7280' : '#ffffff'} />
                      <Text
                        className={`text-xs font-semibold ${isInvited ? 'text-muted-foreground' : 'text-primary-foreground'}`}
                      >
                        {isInvited ? 'Invitado' : 'Invitar'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
    </BottomSheetModalComponent>
  );
}
