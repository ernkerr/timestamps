import { useState, useEffect } from 'react';
import { View, Pressable, LayoutChangeEvent } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import type { VideoSource } from 'expo-video';
import { DraggableOverlay } from './DraggableOverlay';
import type { OverlayConfig } from '@/lib/types/overlay';

interface VideoWithOverlaysProps {
  videoSource: VideoSource;
  overlays: OverlayConfig[];
  selectedOverlayId: string | null;
  onOverlaySelect: (id: string | null) => void;
  onOverlayPositionChange: (id: string, position: { x: number; y: number }) => void;
  onOverlayDelete: (id: string) => void;
  shouldLoop?: boolean;
  shouldMute?: boolean;
}

export function VideoWithOverlays({
  videoSource,
  overlays,
  selectedOverlayId,
  onOverlaySelect,
  onOverlayPositionChange,
  onOverlayDelete,
  shouldLoop = true,
  shouldMute = true,
}: VideoWithOverlaysProps) {
  const [videoLayout, setVideoLayout] = useState({ width: 0, height: 0 });
  const [currentTime, setCurrentTime] = useState(0);

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = shouldLoop;
    player.muted = shouldMute;
    // Small delay to ensure video is loaded before playing
    setTimeout(() => {
      player.play();
    }, 100);
  });

  // Update current time for overlay rendering
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      setCurrentTime(player.currentTime);
    }, 100); // Update 10 times per second

    return () => clearInterval(interval);
  }, [player]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setVideoLayout({ width, height });
  };

  const handleBackgroundPress = () => {
    onOverlaySelect(null);
  };

  return (
    <Pressable onPress={handleBackgroundPress} style={{ position: 'relative', width: '100%' }}>
      <View
        onLayout={handleLayout}
        style={{
          aspectRatio: 4 / 3,
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <VideoView
          player={player}
          style={{ width: '100%', height: '100%' }}
          allowsFullscreen
          allowsPictureInPicture={false}
          nativeControls={false}
          contentFit="contain"
        />

        {/* Render all overlays on top of video */}
        {videoLayout.width > 0 && videoLayout.height > 0 && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'box-none' }}>
            {overlays.map((overlay) => (
              <DraggableOverlay
                key={overlay.id}
                config={overlay}
                currentTime={currentTime}
                videoWidth={videoLayout.width}
                videoHeight={videoLayout.height}
                isSelected={overlay.id === selectedOverlayId}
                onPositionChange={(position) =>
                  onOverlayPositionChange(overlay.id, position)
                }
                onSelect={() => onOverlaySelect(overlay.id)}
                onDelete={() => onOverlayDelete(overlay.id)}
                onEdit={() => onOverlaySelect(overlay.id)}
              />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}
