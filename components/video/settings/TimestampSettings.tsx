import { ThemedText } from '@/components/themed-text';
import { useVideoStore } from '@/lib/store/videoStore';
import { Clock } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BackgroundSettings } from './BackgroundSettings';
import { ColorSettings } from './ColorSettings';
import { FontSettings } from './FontSettings';

interface TimestampSettingsProps {
  overlayId: string;
}

export function TimestampSettings({ overlayId }: TimestampSettingsProps) {
  const { overlays, updateOverlay } = useVideoStore();
  
  const overlayConfig = overlays.find(o => o.id === overlayId);

  if (!overlayConfig || !overlayConfig.timestamp) {
    return null;
  }

  const showHours = overlayConfig.showHours ?? true;
  const showMinutes = overlayConfig.showMinutes ?? true;
  const showSeconds = overlayConfig.showSeconds ?? true;
  const timestamp = overlayConfig.timestamp;
  
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
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
});
