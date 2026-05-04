import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { FlashListRef, ListRenderItem } from '@shopify/flash-list';

import PostCard from '@/components/feed/post-card';
import PostCardSkeleton from '@/components/feed/post-card-skeleton';
import FormPost from '@/components/feed/form-post';
import { useNavbarScroll } from '@/hooks/use-navbar-scroll';
import { usePostStore } from '@/stores/usePostStore';
import type { Post } from '@/types/post';

type SkeletonItem = {
  id: string;
  _skeleton: true;
};

type FeedItem = Post | SkeletonItem;

export default function HomeScreen() {
  const { onScroll } = useNavbarScroll();
  const listRef = useRef<FlashListRef<FeedItem>>(null);

  const posts = usePostStore((s) => s.posts);
  const isLoading = usePostStore((s) => s.isLoading);
  const isFetchingMore = usePostStore((s) => s.isFetchingMore);
  const fetchPosts = usePostStore((s) => s.fetchPosts);
  const fetchMorePosts = usePostStore((s) => s.fetchMorePosts);
  const prependPost = usePostStore((s) => s.prependPost);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = useCallback(
    (post: Post) => {
      prependPost(post);
      // Wait for the list to re-render with the new item before scrolling
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      });
    },
    [prependPost]
  );

  const skeletonData = useMemo<FeedItem[]>(
    () =>
      Array.from({ length: 6 }, (_, index) => ({
        id: `post-skeleton-${index}`,
        _skeleton: true as const,
      })),
    []
  );

  const data = isLoading && posts.length === 0 ? skeletonData : posts;

  const renderItem: ListRenderItem<FeedItem> = useCallback(({ item }) => {
    if ('_skeleton' in item) {
      return <PostCardSkeleton />;
    }

    return <PostCard post={item} />;
  }, []);

  const keyExtractor = useCallback((item: FeedItem) => item.id, []);

  const ListHeader = (
    <>
      <FormPost onPostCreated={handlePostCreated} />
    </>
  );

  const ListFooter = isFetchingMore ? (
    <View className="items-center py-4">
      <ActivityIndicator size="small" color="#10b981" />
    </View>
  ) : null;

  const ListEmpty = !isLoading ? (
    <View className="items-center px-6 py-12">
      <Text className="text-muted-foreground text-center">Sé el primero en publicar algo hoy.</Text>
    </View>
  ) : null;

  return (
    <View className="bg-background dark:bg-background flex-1">
      <FlashList
        ref={listRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        onEndReached={fetchMorePosts}
        onEndReachedThreshold={0.5}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
