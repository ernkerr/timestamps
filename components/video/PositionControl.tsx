import { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { useVideoStore } from '@/lib/store/videoStore';

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 180;
const OVERLAY_SIZE = 40; // Size of draggable overlay indicator

export function PositionControl() {
  const { overlayConfig, updateOverlayConfig } = useVideoStore();

  // Convert percentage position to pixels
  const initialX = overlayConfig.position.x * PREVIEW_WIDTH - OVERLAY_SIZE / 2;
  const initialY = overlayConfig.position.y * PREVIEW_HEIGHT - OVERLAY_SIZE / 2;

  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);

  const [positionText, setPositionText] = useState(
    `${Math.round(overlayConfig.position.x * 100)}%, ${Math.round(overlayConfig.position.y * 100)}%`
  );

  const updatePosition = (x: number, y: number) => {
    // Convert pixels back to percentage (0-1)
    const percentX = Math.max(0, Math.min(1, (x + OVERLAY_SIZE / 2) / PREVIEW_WIDTH));
    const percentY = Math.max(0, Math.min(1, (y + OVERLAY_SIZE / 2) / PREVIEW_HEIGHT));

    updateOverlayConfig({
      position: { x: percentX, y: percentY },
    });

    setPositionText(`${Math.round(percentX * 100)}%, ${Math.round(percentY * 100)}%`);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Constrain to bounds
      const newX = Math.max(-OVERLAY_SIZE / 2, Math.min(PREVIEW_WIDTH - OVERLAY_SIZE / 2, e.translationX + initialX));
      const newY = Math.max(-OVERLAY_SIZE / 2, Math.min(PREVIEW_HEIGHT - OVERLAY_SIZE / 2, e.translationY + initialY));

      translateX.value = newX;
      translateY.value = newY;
    })
    .onEnd((e) => {
      const finalX = Math.max(-OVERLAY_SIZE / 2, Math.min(PREVIEW_WIDTH - OVERLAY_SIZE / 2, e.translationX + initialX));
      const finalY = Math.max(-OVERLAY_SIZE / 2, Math.min(PREVIEW_HEIGHT - OVERLAY_SIZE / 2, e.translationY + initialY));

      runOnJS(updatePosition)(finalX, finalY);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <ThemedText style={styles.label}>Overlay Position</ThemedText>
        <ThemedText style={styles.description}>
          Drag the indicator to position the overlay on your video
        </ThemedText>

        {/* Preview Area */}
        <View style={styles.previewContainer}>
          <View style={styles.previewBox}>
            {/* Grid lines for reference */}
            <View style={styles.gridLine} />
            <View style={[styles.gridLine, styles.gridLineVertical]} />

            {/* Draggable overlay indicator */}
            <GestureDetector gesture={panGesture}>
              <Animated.View style={[styles.overlayIndicator, animatedStyle]}>
                <Text style={styles.overlayText}>00:00</Text>
              </Animated.View>
            </GestureDetector>
          </View>

          {/* Position info */}
          <View style={styles.positionInfo}>
            <ThemedText style={styles.positionText}>{positionText}</ThemedText>
          </View>
        </View>

        {/* Quick position presets */}
        <View style={styles.presetsSection}>
          <ThemedText style={styles.presetsLabel}>Quick Positions</ThemedText>
          <View style={styles.presetsGrid}>
            <PresetButton label="Top Left" x={0.05} y={0.05} />
            <PresetButton label="Top Center" x={0.5} y={0.05} />
            <PresetButton label="Top Right" x={0.95} y={0.05} />
            <PresetButton label="Bottom Left" x={0.05} y={0.95} />
            <PresetButton label="Bottom Center" x={0.5} y={0.95} />
            <PresetButton label="Bottom Right" x={0.95} y={0.95} />
          </View>
        </View>
      </View>
    </View>
  );
}

function PresetButton({ label, x, y }: { label: string; x: number; y: number }) {
  const { updateOverlayConfig } = useVideoStore();

  const handlePress = () => {
    updateOverlayConfig({ position: { x, y } });
  };

  return (
    <Animated.View style={styles.presetButton}>
      <Text style={styles.presetButtonText} onPress={handlePress}>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: '#000',
  },
  description: {
    fontSize: 11,
    fontWeight: '300',
    color: '#666',
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  previewContainer: {
    marginTop: 12,
    gap: 12,
  },
  previewBox: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 0,
    alignSelf: 'center',
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: '50%',
  },
  gridLineVertical: {
    width: 1,
    height: '100%',
    left: '50%',
    top: 0,
  },
  overlayIndicator: {
    position: 'absolute',
    width: OVERLAY_SIZE,
    height: OVERLAY_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  overlayText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000',
    fontVariant: ['tabular-nums'],
  },
  positionInfo: {
    alignItems: 'center',
  },
  positionText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
  presetsSection: {
    marginTop: 12,
    gap: 8,
  },
  presetsLabel: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1,
    color: '#000',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  presetButtonText: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.3,
    color: '#000',
  },
});
