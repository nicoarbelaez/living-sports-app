import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import type { VideoContentFit } from 'expo-video';

interface VideoPlayerProps {
  uri: string;
  /** When false the player is paused (e.g. carousel swiped away) */
  active?: boolean;
  autoPlay?: boolean;
  contentFit?: VideoContentFit;
  loop?: boolean;
  /** Called once when the real video dimensions are known */
  onAspectRatioChange?: (ratio: number) => void;
}

export function VideoPlayer({
  uri,
  active = true,
  autoPlay = true,
  contentFit = 'contain',
  loop = true,
  onAspectRatioChange,
}: VideoPlayerProps) {
  const [ready, setReady] = useState(false);

  const player = useVideoPlayer(uri, (p) => {
    p.loop = loop;
    if (autoPlay) p.play();
  });

  useEffect(() => {
    if (!active) player.pause();
  }, [active, player]);

  useEffect(() => {
    if (!onAspectRatioChange) return;
    const sub = player.addListener('videoTrackChange', ({ videoTrack }) => {
      const { width, height } = videoTrack?.size ?? {};
      if (width && height) onAspectRatioChange(width / height);
    });
    return () => sub.remove();
  }, [player, onAspectRatioChange]);

  return (
    <View style={styles.container}>
      {!ready && (
        <View style={[StyleSheet.absoluteFill, styles.loader]}>
          <ActivityIndicator color="#9fe870" size="large" />
        </View>
      )}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit={contentFit}
        nativeControls
        surfaceType="textureView"
        onFirstFrameRender={() => setReady(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
});
