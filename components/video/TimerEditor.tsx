import { ThemedText } from '@/components/themed-text';
import { useVideoStore } from '@/lib/store/videoStore';
import { formatElapsedTime } from '@/lib/utils/timeFormatters';
import { StyleSheet, View } from 'react-native';

interface TimerEditorProps {
  overlayId: string;
}

export function TimerEditor({ overlayId }: TimerEditorProps) {
  const { overlays, updateOverlay, sourceVideo } = useVideoStore();
  const overlayConfig = overlays.find(o => o.id === overlayId);

  if (!overlayConfig || !overlayConfig.elapsedTimer) {
    return null;
  }

  const startTime = overlayConfig.elapsedTimer.startTime;
  const timelapseSpeed = overlayConfig.elapsedTimer.timelapseSpeed || 1;
  const videoDuration = sourceVideo?.duration || 0;

  const handleStartTimeChange = (seconds: number) => {
    // Clamp to video duration
    const clampedSeconds = Math.max(0, Math.min(seconds, videoDuration));

    updateOverlay(overlayId, {
      elapsedTimer: {
        startTime: clampedSeconds,
        timelapseSpeed: timelapseSpeed,
      },
    });
  };

  const handleTimelapseSpeedChange = (speed: number) => {
    updateOverlay(overlayId, {
      elapsedTimer: {
        startTime: startTime,
        timelapseSpeed: Math.max(1, speed),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Timelapse Speed */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Timelapse Speed</ThemedText>
        <ThemedText style={styles.description}>
          Automatically calculated from video metadata
        </ThemedText>

        <View style={styles.readOnlyRow}>
          <ThemedText style={styles.readOnlyValue}>
            {timelapseSpeed.toFixed(1)}×
          </ThemedText>
        </View>

        <ThemedText style={styles.hint}>
          {videoDuration > 0 && (
            <>Real-world duration: {Math.round((videoDuration * timelapseSpeed) / 60)} minutes</>
          )}
        </ThemedText>
      </View>

      {/* Preview */}
      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <View style={styles.previewDot} />
          <ThemedText style={styles.previewTitle}>PREVIEW</ThemedText>
        </View>

        <View style={styles.previewBox}>
          <ThemedText style={styles.previewTime}>
            {formatElapsedTime(0)}
          </ThemedText>
          <ThemedText style={styles.previewLabel}>
            At {formatElapsedTime(startTime)} in video
          </ThemedText>
        </View>

        <View style={styles.previewBox}>
          <ThemedText style={styles.previewTime}>
            {formatElapsedTime((videoDuration - startTime) * timelapseSpeed)}
          </ThemedText>
          <ThemedText style={styles.previewLabel}>
            At end of video ({formatElapsedTime(videoDuration)})
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  readOnlyValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    backgroundColor: '#fff',
  },
  unit: {
    fontSize: 13,
    fontWeight: '300',
    color: '#666',
    letterSpacing: 0.3,
  },
  hint: {
    fontSize: 11,
    fontWeight: '300',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  previewSection: {
    gap: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
    marginRight: 8,
  },
  previewTitle: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: '#000',
  },
  previewBox: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 0,
    padding: 16,
    gap: 4,
  },
  previewTime: {
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 1,
    color: '#000',
    fontVariant: ['tabular-nums'],
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '300',
    color: '#666',
    letterSpacing: 0.3,
  },
});
