import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { Edit2 } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useProfileStore } from '@/features/profile/stores/useProfileStore';
import { supabase } from '@/lib/supabase';
import { useRoutine } from '@/features/profile/hooks/useRoutine';
import { usePrs } from '@/features/profile/hooks/usePrs';
import { formatRelativeTime, getRandomAvatarUrl } from '@/lib/utils';
import { getProfileFullName } from '@/types/post';
import type { Post, PostRow } from '@/types/post';
import type { PersonalRecord } from '@/features/profile/types';
import { Skeleton } from '@/components/ui/skeleton';
import PrBentoGrid from '@/components/profile/PrBentoGrid';
import PrDetailDialog from '@/components/profile/PrDetailDialog';
import WeeklyRoutineScroll from '@/components/profile/WeeklyRoutineScroll';
import PostsGrid from '@/components/profile/PostsGrid';
import PostFullscreenDialog from '@/components/profile/PostFullscreenDialog';

const POST_SELECT = `
  id,
  body,
  created_at,
  likes_count,
  comments_count,
  profiles (
    id,
    username,
    first_name,
    last_name,
    avatar_url
  ),
  post_media (
    url,
    media_type,
    sort_order
  )
` as const;

function rowToPost(row: PostRow): Post {
  const profile = row.profiles;
  const username = getProfileFullName(profile);
  const avatarSeed = profile?.username ?? username;
  const avatar =
    profile?.avatar_url && !profile.avatar_url.includes('avatars.githubusercontent.com')
      ? profile.avatar_url
      : getRandomAvatarUrl(avatarSeed);

  const media = [...(row.post_media ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => ({
      url: m.url,
      type: (m.media_type === 'video' ? 'video' : 'image') as 'image' | 'video',
    }));

  return {
    id: row.id,
    authorId: profile?.id ?? '',
    user: username,
    time: formatRelativeTime(row.created_at),
    createdAt: row.created_at,
    avatar,
    media,
    text: row.body ?? '',
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
  };
}

export default function ProfileScreen() {
  const { session } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);

  const userId = user?.id ?? '';
  const isOwner = true; // own profile tab

  const { data: prs, isLoading: prsLoading, refetch: refetchPrs } = usePrs(userId);
  const { data: routine, isLoading: routineLoading, refetch: refetchRoutine } = useRoutine(userId);

  const [posts, setPosts] = React.useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = React.useState(true);

  const refetchPosts = React.useCallback(async () => {
    if (!userId) return;
    setPostsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts((data ?? []).map((row) => rowToPost(row as PostRow)));
    } catch (err) {
      console.log('Error fetching posts:', err);
    } finally {
      setPostsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    refetchPosts();
  }, [userId, refetchPosts]);

  const [selectedPr, setSelectedPr] = React.useState<PersonalRecord | null>(null);
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refetchPosts();
    }, [refetchPosts])
  );

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchPrs(), refetchRoutine(), refetchPosts()]);
    setRefreshing(false);
  }, [refetchPrs, refetchRoutine, refetchPosts]);


  const handleDayPress = (dayOfWeek: number) => {
    router.push({
      pathname: '/routine/[day]',
      params: { day: String(dayOfWeek) },
    });
  };

  const displayName =
    profile?.first_name || profile?.last_name
      ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
      : user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email?.split('@')[0] ||
        'Usuario';

  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;

  const featuredPrs = (prs ?? []).filter((pr) => pr.isFeatured).slice(0, 3);
  const allPrs = featuredPrs.length > 0 ? featuredPrs : (prs ?? []).slice(0, 3);

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* ── Header ── */}
      <View className="mx-4 mt-6 overflow-hidden rounded-3xl bg-secondary p-6">
        <View className="items-center">
          <TouchableOpacity
            onPress={() => isOwner && router.push('/profile/edit-pr')}
            activeOpacity={isOwner ? 0.8 : 1}
            className="relative"
          >
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 96, height: 96, borderRadius: 48 }}
              contentFit="cover"
            />
            {isOwner && (
              <View className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5">
                <Edit2 size={12} color="#0e0f0c" />
              </View>
            )}
          </TouchableOpacity>

          <Text className="mt-3 text-xl font-bold text-foreground">{displayName}</Text>

          {profile?.username && (
            <Text className="text-sm text-muted-foreground">@{profile.username}</Text>
          )}
        </View>

        {/* Stats row */}
        <View className="mt-5 flex-row justify-around">
          <View className="items-center">
            <Text className="text-lg font-bold text-foreground">{posts?.length ?? 0}</Text>
            <Text className="text-xs text-muted-foreground">POSTS</Text>
          </View>
          <View className="h-full w-px bg-border" />
          <View className="items-center">
            <Text className="text-lg font-bold text-foreground">0</Text>
            <Text className="text-xs text-muted-foreground">SEGUIDORES</Text>
          </View>
          <View className="h-full w-px bg-border" />
          <View className="items-center">
            <Text className="text-lg font-bold text-foreground">0</Text>
            <Text className="text-xs text-muted-foreground">SIGUIENDO</Text>
          </View>
        </View>
      </View>

      {/* ── PRs Bento ── */}
      <View className="mt-6 px-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-foreground">Records personales</Text>
          {isOwner && (
            <TouchableOpacity onPress={() => router.push('/profile/edit-pr')} activeOpacity={0.7}>
              <Text className="text-sm font-semibold text-primary">Gestionar</Text>
            </TouchableOpacity>
          )}
        </View>

        {prsLoading ? (
          <View style={{ height: 248, flexDirection: 'row', gap: 8 }}>
            <Skeleton style={{ flex: 1, height: 248, borderRadius: 16 }} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton style={{ flex: 1, borderRadius: 16 }} />
              <Skeleton style={{ flex: 1, borderRadius: 16 }} />
            </View>
          </View>
        ) : (
          <PrBentoGrid
            prs={allPrs}
            isOwner={isOwner}
            onAddPr={() => router.push('/profile/edit-pr')}
            onPressPr={(pr) => setSelectedPr(pr)}
          />
        )}
      </View>

      {/* ── Rutina semanal ── */}
      <View className="mt-8">
        <View className="mb-3 flex-row items-center justify-between px-4">
          <Text className="text-lg font-bold text-foreground">Rutina semanal</Text>
          {isOwner && (
            <TouchableOpacity
              onPress={() => router.push('/routine/ai-routine')}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-primary">✨ IA</Text>
            </TouchableOpacity>
          )}
        </View>

        {routineLoading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} style={{ width: 240, height: 160, borderRadius: 24 }} />
            ))}
          </ScrollView>
        ) : (
          <WeeklyRoutineScroll
            routine={routine ?? {}}
            onDayPress={handleDayPress}
          />
        )}
      </View>

      {/* ── AI Routine CTA ── */}
      {isOwner && (
        <View className="mx-4 mt-6 rounded-3xl bg-foreground p-5">
          <Text className="text-2xl font-extrabold text-primary">Crea tu rutina con IA</Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            Genera un plan personalizado según tus objetivos en segundos
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/routine/ai-routine')}
            activeOpacity={0.8}
            className="mt-5 items-center rounded-full bg-primary py-3"
          >
            <Text className="font-bold text-primary-foreground">✨ Crear rutina ahora</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Posts grid ── */}
      <View className="mt-8">
        <Text className="mb-4 px-4 text-lg font-bold text-foreground">Posts</Text>
        {postsLoading ? (
          <View className="flex-row flex-wrap px-4 gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                style={{ width: '48%', aspectRatio: 1, borderRadius: 12, marginBottom: 4 }}
              />
            ))}
          </View>
        ) : (
          <PostsGrid
            posts={posts ?? []}
            onLongPress={(post) => setSelectedPost(post)}
          />
        )}
      </View>

      {/* ── Dialogs ── */}
      <PrDetailDialog pr={selectedPr} onClose={() => setSelectedPr(null)} />
      <PostFullscreenDialog post={selectedPost} onClose={() => setSelectedPost(null)} />
    </ScrollView>
  );
}
