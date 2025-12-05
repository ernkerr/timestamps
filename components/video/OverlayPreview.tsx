import type { OverlayConfig } from '@/lib/types/overlay';
import { formatElapsedTime, formatTimeOfDayTimestamp } from '@/lib/utils/timeFormatters';
import { StyleSheet, Text, View } from 'react-native';

interface OverlayPreviewProps {
  config: OverlayConfig;
  currentTime: number; // Current video playback time in seconds
  videoWidth: number;
  videoHeight: number;
  inline?: boolean; // If true, renders without absolute positioning
}

export function OverlayPreview({
  config,
  currentTime,
  videoWidth,
  videoHeight,
  inline = false,
}: OverlayPreviewProps) {
  if (config.type === 'none') {
    return null;
  }

  // Calculate overlay text based on type
  let overlayText = '';

  switch (config.type) {
    case 'elapsed':
      if (config.elapsedTimer) {
        const timelapseSpeed = config.elapsedTimer.timelapseSpeed || 1;
        const elapsedTime = currentTime * timelapseSpeed;
        overlayText = formatElapsedTime(elapsedTime, true, config.showSeconds ?? true);
      }
      break;

    case 'timestamp':
      if (config.timestamp) {
        overlayText = formatTimeOfDayTimestamp(
          currentTime,
          config.timestamp.realWorldStartTime,
          config.timestamp.timelapseSpeed,
          config.timestamp.format
        );
      }
      break;

    case 'text':
      overlayText = config.text || '';
      break;
  }

  if (!overlayText) {
    return null;
  }

  // Calculate position (percentage to pixels) - only needed if not inline
  const left = config.position.x * videoWidth;
  const top = config.position.y * videoHeight;

  return (
    <View
      style={[
        inline ? styles.inlineContainer : styles.container,
        !inline && {
          left,
          top,
        },
      ]}
    >
      <View
        style={[
          styles.textContainer,
          config.backgroundColor && {
            backgroundColor: config.backgroundColor,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize: config.fontSize,
              color: config.color,
              fontFamily: config.fontFamily === 'System' ? undefined : config.fontFamily,
            },
          ]}
        >
          {overlayText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10,
  },
  inlineContainer: {
    zIndex: 10,
  },
  textContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
});
