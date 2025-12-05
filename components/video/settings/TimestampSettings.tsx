import { ThemedText } from '@/components/themed-text';
import { useVideoStore } from '@/lib/store/videoStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BackgroundSettings } from './BackgroundSettings';
import { ColorSettings } from './ColorSettings';
import { FontSettings } from './FontSettings';

interface TimestampSettingsProps {
  overlayId: string;
}

export function TimestampSettings({ overlayId }: TimestampSettingsProps) {
  const { overlays, updateOverlay, sourceVideo } = useVideoStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const overlayConfig = overlays.find(o => o.id === overlayId);

  if (!overlayConfig || !overlayConfig.timestamp) {
    return null;
  }

  const showHours = overlayConfig.showHours ?? true;
  const showMinutes = overlayConfig.showMinutes ?? true;
  const showSeconds = overlayConfig.showSeconds ?? true;
  const timestamp = overlayConfig.timestamp;
  const realWorldStartTime = timestamp.realWorldStartTime || new Date();
  const timelapseSpeed = timestamp.timelapseSpeed || 1;
  const videoDuration = sourceVideo?.duration || 0;
  
  // Determine if 12h or 24h based on format
  const is12Hour = timestamp.format?.includes('12h') ?? true;

  const handleToggle = (field: 'showHours' | 'showMinutes' | 'showSeconds') => {
    updateOverlay(overlayId, { [field]: !overlayConfig[field] });
  };

  const handleTimeFormatToggle = () => {
    const newFormat = is12Hour ? '24h' : '12h';
    updateOverlay(overlayId, {
      timestamp: {
        ...timestamp,
        format: newFormat,
      },
    });
  };

  const handleRealWorldStartTimeChange = (date: Date) => {
    updateOverlay(overlayId, {
      timestamp: {
        ...timestamp,
        realWorldStartTime: date,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* HMS Toggles */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Time Display</ThemedText>
        
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, showHours && styles.toggleButtonActive]}
            onPress={() => handleToggle('showHours')}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.toggleIcon, showHours && styles.toggleIconActive]}>
              00
            </ThemedText>
            <ThemedText style={[styles.toggleLabel, showHours && styles.toggleLabelActive]}>
              Hours
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, showMinutes && styles.toggleButtonActive]}
            onPress={() => handleToggle('showMinutes')}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.toggleIcon, showMinutes && styles.toggleIconActive]}>
              00
            </ThemedText>
            <ThemedText style={[styles.toggleLabel, showMinutes && styles.toggleLabelActive]}>
              Minutes
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, showSeconds && styles.toggleButtonActive]}
            onPress={() => handleToggle('showSeconds')}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.toggleIcon, showSeconds && styles.toggleIconActive]}>
              00
            </ThemedText>
            <ThemedText style={[styles.toggleLabel, showSeconds && styles.toggleLabelActive]}>
              Seconds
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* 12/24 Hour Toggle */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Time Format</ThemedText>
        <TouchableOpacity
          style={styles.formatToggle}
          onPress={handleTimeFormatToggle}
          activeOpacity={0.7}
        >
          <Clock size={16} color="#666" />
          <ThemedText style={styles.formatText}>
            {is12Hour ? '12-hour (AM/PM)' : '24-hour'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Start Time */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Real-World Start Time</ThemedText>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={14} color="#666" style={{ marginRight: 6 }} />
            <ThemedText style={styles.dateTimeText}>
              {realWorldStartTime.toLocaleDateString()}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Clock size={14} color="#666" style={{ marginRight: 6 }} />
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

      {/* Timelapse Speed Info */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Timelapse Speed</ThemedText>
        <View style={styles.infoBox}>
          <Clock size={16} color="#666" />
          <ThemedText style={styles.infoText}>
            {timelapseSpeed.toFixed(1)}× speed
          </ThemedText>
        </View>
        {videoDuration > 0 && (
          <ThemedText style={styles.hint}>
            Real-world duration: {Math.round((videoDuration * timelapseSpeed) / 60)} minutes
          </ThemedText>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Shared Settings */}
      <FontSettings overlayId={overlayId} />
      <ColorSettings overlayId={overlayId} />
      <BackgroundSettings overlayId={overlayId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: '#000',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
  },
  toggleButtonActive: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  toggleIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    fontVariant: ['tabular-nums'],
  },
  toggleIconActive: {
    color: '#fff',
  },
  toggleLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: '#666',
    letterSpacing: 0.3,
  },
  toggleLabelActive: {
    color: '#fff',
  },
  formatToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  formatText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  dateTimeText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#000',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },
  hint: {
    fontSize: 11,
    fontWeight: '300',
    color: '#999',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
});
