import { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/themed-text';
import { useVideoStore } from '@/lib/store/videoStore';
import { formatTimeOfDayTimestamp } from '@/lib/utils/timeFormatters';
import type { TimestampFormat } from '@/lib/types/overlay';

interface TimestampEditorProps {
  overlayId: string;
}

export function TimestampEditor({ overlayId }: TimestampEditorProps) {
  const { overlays, updateOverlay, sourceVideo } = useVideoStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const overlayConfig = overlays.find(o => o.id === overlayId);

  if (!overlayConfig || !overlayConfig.timestamp) {
    return null;
  }

  const timestamp = overlayConfig.timestamp;
  const videoDuration = sourceVideo?.duration || 0;
  const realWorldStartTime = timestamp.realWorldStartTime || new Date();
  const timelapseSpeed = timestamp.timelapseSpeed || 1;
  const format = timestamp.format || '12h';

  const handleRealWorldStartTimeChange = (date: Date) => {
    updateOverlay(overlayId, {
      timestamp: {
        ...timestamp,
        realWorldStartTime: date,
      },
    });
  };

  const handleTimelapseSpeedChange = (speed: number) => {
    updateOverlay(overlayId, {
      timestamp: {
        ...timestamp,
        timelapseSpeed: Math.max(1, speed),
      },
    });
  };

  const handleFormatChange = (newFormat: TimestampFormat) => {
    updateOverlay(overlayId, {
      timestamp: {
        ...timestamp,
        format: newFormat,
      },
    });
  };

  const formatOptions: Array<{ value: TimestampFormat; label: string }> = [
    { value: '12h', label: '12-hour (9:00 AM)' },
    { value: '24h', label: '24-hour (09:00)' },
    { value: '12h-full', label: '12-hour with seconds' },
    { value: '24h-full', label: '24-hour with seconds' },
  ];

  return (
    <View style={styles.container}>
      {/* Start Time */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Real-World Start Time</ThemedText>
        <ThemedText style={styles.description}>
          The actual time when your timelapse started
        </ThemedText>

        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText style={styles.dateTimeText}>
              {realWorldStartTime.toLocaleDateString()}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <ThemedText style={styles.dateTimeText}>
              {realWorldStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={realWorldStartTime}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) {
                handleRealWorldStartTimeChange(date);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={realWorldStartTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (date) {
                handleRealWorldStartTimeChange(date);
              }
            }}
          />
        )}
      </View>

      {/* Timelapse Speed */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Timelapse Speed</ThemedText>
        <ThemedText style={styles.description}>
          How fast real-world time passes (e.g., 120x = 2 hours in 1 minute)
        </ThemedText>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={timelapseSpeed.toString()}
            onChangeText={(text) => {
              const parsed = parseFloat(text);
              if (!isNaN(parsed)) {
                handleTimelapseSpeedChange(parsed);
              }
            }}
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor="#999"
          />
          <ThemedText style={styles.unit}>×</ThemedText>
        </View>

        <ThemedText style={styles.hint}>
          {videoDuration > 0 && (
            <>Real-world duration: {Math.round((videoDuration * timelapseSpeed) / 60)} minutes</>
          )}
        </ThemedText>
      </View>

      {/* Format Selector */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Display Format</ThemedText>

        <View style={styles.formatGrid}>
          {formatOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.formatButton,
                format === option.value && styles.formatButtonActive,
              ]}
              onPress={() => handleFormatChange(option.value)}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.formatText,
                  format === option.value && styles.formatTextActive,
                ]}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Preview */}
      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <View style={styles.previewDot} />
          <ThemedText style={styles.previewTitle}>PREVIEW</ThemedText>
        </View>

        <View style={styles.previewBox}>
          <ThemedText style={styles.previewTime}>
            {formatTimeOfDayTimestamp(0, realWorldStartTime, timelapseSpeed, format)}
          </ThemedText>
          <ThemedText style={styles.previewLabel}>At video start</ThemedText>
        </View>

        <View style={styles.previewBox}>
          <ThemedText style={styles.previewTime}>
            {formatTimeOfDayTimestamp(videoDuration, realWorldStartTime, timelapseSpeed, format)}
          </ThemedText>
          <ThemedText style={styles.previewLabel}>At video end</ThemedText>
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
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  dateTimeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
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
  formatGrid: {
    gap: 8,
    marginTop: 4,
  },
  formatButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  formatButtonActive: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  formatText: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.3,
    color: '#000',
    textAlign: 'center',
  },
  formatTextActive: {
    color: '#fff',
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
