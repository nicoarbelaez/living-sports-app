import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { VideoPlayer } from '@/components/ui/video-player';
import { getVideoThumbnail } from '@/lib/cloudinary';
import type { Media } from '@/types/post';

interface MediaCarouselProps {
  media: Media[];
}

export default function MediaCarousel({ media }: MediaCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  if (!media?.length) return null;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setActiveVideo(null); // pause/unmount any playing video on swipe
  };

  const renderItem = (item: Media, index: number) => {
    const key = item.url || `media-${index}`;
    const isCurrentPage = currentPage === index;

    if (item.type === 'video') {
      if (activeVideo === item.url) {
        return (
          <View key={key} style={{ flex: 1, backgroundColor: '#000' }}>
            <VideoPlayer uri={item.url} active={isCurrentPage} autoPlay loop />
          </View>
        );
      }

      const thumbnail = getVideoThumbnail(item.url);

      return (
        <View key={key} style={{ flex: 1 }}>
          <Image
            source={{ uri: thumbnail }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          <Pressable
            onPress={() => setActiveVideo(item.url)}
            style={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play size={28} color="white" fill="white" />
            </View>
          </Pressable>
        </View>
      );
    }

    return (
      <View key={key} style={{ flex: 1 }}>
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
        onPageSelected={(e) => handlePageChange(e.nativeEvent.position)}
      >
        {media.map(renderItem)}
      </PagerView>

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
