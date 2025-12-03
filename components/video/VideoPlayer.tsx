import { StyleSheet, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import type { VideoSource } from 'expo-video';

interface VideoPlayerProps {
  videoSource: VideoSource;
  style?: object;
  shouldLoop?: boolean;
  shouldMute?: boolean;
  showControls?: boolean;
}

export function VideoPlayer({
  videoSource,
  style,
  shouldLoop = false,
  shouldMute = false,
  showControls = true,
}: VideoPlayerProps) {
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = shouldLoop;
    player.muted = shouldMute;
    player.play();
  });

  return (
    <View style={[styles.container, style]}>
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture={false}
        nativeControls={showControls}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'transparent',
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});
