import { View, StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useVideoStore } from '@/lib/store/videoStore';
import { formatElapsedTime } from '@/lib/utils/timeFormatters';

export function TimerEditor() {
  const { overlayConfig, updateOverlayConfig, sourceVideo } = useVideoStore();

  if (!overlayConfig.elapsedTimer) {
    return null;
  }

  const startTime = overlayConfig.elapsedTimer.startTime;
  const videoDuration = sourceVideo?.duration || 0;

  const handleStartTimeChange = (seconds: number) => {
    // Clamp to video duration
    const clampedSeconds = Math.max(0, Math.min(seconds, videoDuration));

    updateOverlayConfig({
      elapsedTimer: {
        startTime: clampedSeconds,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Start Time Input */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Start Time</ThemedText>
        <ThemedText style={styles.description}>
          Timer starts counting from this point in the video
        </ThemedText>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={startTime.toString()}
            onChangeText={(text) => {
              const parsed = parseFloat(text);
              if (!isNaN(parsed)) {
                handleStartTimeChange(parsed);
              }
            }}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#999"
          />
          <ThemedText style={styles.unit}>seconds</ThemedText>
        </View>

        <ThemedText style={styles.hint}>
          Timer will display: {formatElapsedTime(0)} at {formatElapsedTime(startTime)}
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
            {formatElapsedTime(videoDuration - startTime)}
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
