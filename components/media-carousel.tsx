import React, { useState } from 'react';
import { View, Text } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import { Media } from '@/types/post';

interface MediaCarouselProps {
  media: Media[];
}

export default function MediaCarousel({ media }: MediaCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);

  if (!media || media.length === 0) return null;

  const renderMediaItem = (item: Media, index: number) => {
    const key = item.url || `media-${index}`;
    if (item.type === 'video') {
      return (
        <View
          key={key}
          collapsable={false}
          style={{ flex: 1, width: '100%', height: '100%' }}
          className="items-center justify-center bg-black"
        >
          <Image
            source={{ uri: item.url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            priority="high"
          />
          <View className="absolute h-full w-full items-center justify-center bg-black/20">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-white/30">
              <Play size={32} color="white" fill="white" />
            </View>
            <Text className="mt-2 text-xs font-bold tracking-wider text-white uppercase">
              Video
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View key={key} collapsable={false} style={{ flex: 1, width: '100%', height: '100%' }}>
        <Image
          source={{ uri: item.url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
      </View>
    );
  };

  if (media.length === 1) {
    return <View className="h-64 w-full bg-gray-100">{renderMediaItem(media[0], 0)}</View>;
  }

  return (
    <View className="h-64 w-full bg-gray-100">
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {media.map((item, index) => renderMediaItem(item, index))}
      </PagerView>

      <View className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1">
        <Text className="text-xs font-semibold text-white">
          {currentPage + 1}/{media.length}
        </Text>
      </View>
    </View>
  );
}
