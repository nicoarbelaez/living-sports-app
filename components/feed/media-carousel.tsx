import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import { Media } from '@/types/post';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface MediaCarouselProps {
  media: Media[];
  isPostActive?: boolean;
}

export default function MediaCarousel({ media }: MediaCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  if (!media?.length) return null;

  const renderItem = (item: Media, index: number) => {
    const key = item.url || `media-${index}`;

    if (item.type === 'video') {
      const isPlaying = playingVideo === item.url;

      return (
        <View key={key} style={{ flex: 1, backgroundColor: '#000' }}>
          {isPlaying ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>▶ Reproduciendo video...</Text>
            </View>
          ) : (
            <Pressable onPress={() => setPlayingVideo(item.url)} style={{ flex: 1 }}>
              <Image
                source={{ uri: item.url }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
              <View
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
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    fontWeight: '700',
                    color: '#fff',
                    textTransform: 'uppercase',
                  }}
                >
                  Video
                </Text>
              </View>
            </Pressable>
          )}
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
        onPageSelected={(e) => {
          setCurrentPage(e.nativeEvent.position);
          setPlayingVideo(null);
        }}
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
