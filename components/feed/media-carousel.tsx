import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import { Media } from '@/types/post';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface MediaCarouselProps {
  media: Media[];
}

export default function MediaCarousel({ media }: MediaCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  if (!media?.length) return null;

  const renderMediaItem = (item: Media, index: number) => {
    const key = item.url || `media-${index}`;

    // VIDEO
    if (item.type === 'video') {
      const isPlaying = playingVideo === item.url;

      return (
        <View key={key} className="flex-1 bg-black">
          {!isPlaying ? (
            <Pressable
              onPress={() => setPlayingVideo(item.url)}
              className="flex-1 items-center justify-center"
            >
              <Image
                source={{
                  uri:
                    item.type === 'video'
                      ? item.url // fallback temporal
                      : item.url,
                }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />

              <View className="absolute inset-0 items-center justify-center bg-black/30">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-white/25">
                  <Play size={28} color="white" fill="white" />
                </View>

                <Text className="mt-2 text-xs font-bold text-white uppercase">Video</Text>
              </View>
            </Pressable>
          ) : (
            <View className="flex-1 items-center justify-center bg-black">
              {/* Aquí podrías integrar expo-av o react-native-video */}
              <Text className="text-white">▶ Playing video...</Text>
            </View>
          )}
        </View>
      );
    }

    // IMAGE
    return (
      <View key={key} className="flex-1">
        <Image
          source={{ uri: item.url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
      </View>
    );
  };

  return (
    <AspectRatio ratio={4 / 5} className="w-full bg-black">
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {media.map(renderMediaItem)}
      </PagerView>

      {/* Counter */}
      {media.length > 1 && (
        <View className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1">
          <Text className="text-xs font-semibold text-white">
            {currentPage + 1}/{media.length}
          </Text>
        </View>
      )}
    </AspectRatio>
  );
}
