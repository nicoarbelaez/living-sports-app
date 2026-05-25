import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import type { Post } from '@/types/post';

interface PostsGridProps {
  posts: Post[];
  onLongPress: (post: Post) => void;
}

export default function PostsGrid({ posts, onLongPress }: PostsGridProps) {
  const { width } = useWindowDimensions();
  const CELL_SIZE = (width - 32 - 4) / 2;

  const renderItem = ({ item, index }: { item: Post; index: number }) => {
    const isLeft = index % 2 === 0;
    const firstMedia = item.media[0] ?? null;

    return (
      <Pressable
        onLongPress={() => onLongPress(item)}
        delayLongPress={500}
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          marginLeft: isLeft ? 0 : 4,
          marginBottom: 4,
          borderRadius: 12,
          overflow: 'hidden',
        }}
        className="bg-secondary"
      >
        {firstMedia ? (
          <Image
            source={{ uri: firstMedia.url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center p-2">
            <Text
              className="text-foreground text-xs"
              numberOfLines={4}
              style={{ textAlign: 'center' }}
            >
              {item.text}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  if (posts.length === 0) {
    return (
      <View className="items-center py-10">
        <Text className="text-muted-foreground">No hay posts aún</Text>
      </View>
    );
  }

  return (
    <FlashList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      scrollEnabled={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    />
  );
}
