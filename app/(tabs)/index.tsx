import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';

import ActivityCard from '@/components/activity-card';
import PostCard from '@/components/post-card';
import FormPost from '@/components/form-post';
import { useAuth } from '@/providers/AuthProvider';
import { useNavbarScroll } from '@/hooks/use-navbar-scroll';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

import { Post, Media, getProfileFullName } from '@/types/post';
import { formatRelativeTime, getRandomAvatarUrl } from '@/lib/utils';

export default function HomeScreen() {
  const { session } = useAuth();

  return <AuthenticatedHome session={session} />;
}

function AuthenticatedHome({ session }: { session: Session | null }) {
  const { onScroll } = useNavbarScroll();
  const isDark = useColorScheme() === 'dark';
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id,
          body,
          created_at,
          profiles (
            first_name,
            last_name,
            avatar_url,
            username
          ),
          post_media (
            url,
            media_type
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      type PostResponse = {
        id: string;
        body: string | null;
        created_at: string;
        profiles: any; // We can use getProfileFullName with 'any', but properly typing it later
        post_media: { url: string; media_type: string }[] | null;
      };

      const formattedPosts: Post[] = (data as PostResponse[]).map((post) => {
        const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;

        const media: Media[] =
          post.post_media?.map((m) => ({
            url: m.url,
            type: m.media_type as 'image' | 'video',
          })) || [];

        return {
          id: post.id,
          user: getProfileFullName(profile),
          time: formatRelativeTime(post.created_at),
          createdAt: post.created_at,
          avatar: profile?.avatar_url || getRandomAvatarUrl(getProfileFullName(profile)),
          media: media,
          text: post.body || '',
        };
      });

      setPosts(formattedPosts);
    };

    fetchPosts();
  }, [session?.user.id]);

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...(posts || [])]);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView onScroll={onScroll} scrollEventThrottle={16}>
        <ActivityCard />
        <FormPost onPostCreated={handlePostCreated} />

        {!posts ? (
          <View style={{ padding: 20 }}>{/* Spinner here */}</View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              user={post.user}
              time={post.time}
              avatar={post.avatar}
              media={post.media}
              text={post.text}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  containerDark: {
    backgroundColor: '#000',
  },

  card: {
    marginHorizontal: 24,
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  cardDark: {
    backgroundColor: '#111827',
  },

  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  textDark: {
    color: '#fff',
  },
});
