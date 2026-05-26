import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import PostsGrid from '@/components/profile/PostsGrid';
import PostFullscreenDialog from '@/components/profile/PostFullscreenDialog';
import { getProfileFullName } from '@/types/post';
import type { Post, PostRow } from '@/types/post';
import { formatRelativeTime, getRandomAvatarUrl } from '@/lib/utils';

interface UserProfile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

const POST_SELECT = `
  id, body, created_at, likes_count, comments_count,
  profiles ( id, username, first_name, last_name, avatar_url ),
  post_media ( url, media_type, sort_order )
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

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      const [profileResult, postsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, first_name, last_name, avatar_url, bio')
          .eq('id', userId)
          .single(),
        supabase
          .from('posts')
          .select(POST_SELECT)
          .eq('user_id', userId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(30),
      ]);

      setProfile(profileResult.data ?? null);
      if (postsResult.data) setPosts((postsResult.data as PostRow[]).map(rowToPost));
      setLoading(false);
    };

    load();
  }, [userId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="mb-4 text-foreground">Perfil no encontrado.</Text>
        <Button variant="ghost" onPress={() => router.back()}>
          <Text className="text-foreground">Volver</Text>
        </Button>
      </View>
    );
  }

  const displayName = getProfileFullName(profile) || profile.username || 'Usuario';
  const avatarUri =
    profile.avatar_url && !profile.avatar_url.includes('avatars.githubusercontent.com')
      ? profile.avatar_url
      : getRandomAvatarUrl(profile.username ?? 'user');

  return (
    <View className="flex-1 bg-background">
      <ScrollView>
        {/* Header */}
        <View className="bg-white px-4 pt-14 pb-6 dark:bg-gray-900">
          <TouchableOpacity onPress={() => router.back()} className="mb-4 self-start">
            <ArrowLeft size={24} color="#6b7280" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-4">
            <Image
              source={{ uri: avatarUri }}
              style={{ width: 72, height: 72, borderRadius: 36 }}
              contentFit="cover"
            />
            <View className="flex-1">
              <Text className="text-xl font-black text-foreground">{displayName}</Text>
              {profile.username && (
                <Text className="text-sm text-muted-foreground">@{profile.username}</Text>
              )}
              {profile.bio && (
                <Text className="mt-1 text-sm text-foreground">{profile.bio}</Text>
              )}
            </View>
          </View>

          <View className="mt-4 flex-row gap-6">
            <View className="items-center">
              <Text className="text-lg font-black text-foreground">{posts.length}</Text>
              <Text className="text-xs text-muted-foreground">Posts</Text>
            </View>
          </View>
        </View>

        {/* Posts grid */}
        <PostsGrid posts={posts} onLongPress={setSelectedPost} />
      </ScrollView>

      {selectedPost && (
        <PostFullscreenDialog post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </View>
  );
}
