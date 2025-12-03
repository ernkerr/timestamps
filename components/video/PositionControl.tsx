import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useVideoStore } from '@/lib/store/videoStore';

interface PositionControlProps {
  overlayId: string;
}

export function PositionControl({ overlayId }: PositionControlProps) {
  const { updateOverlay } = useVideoStore();

  const presets = [
    { label: 'Top Left', x: 0.05, y: 0.05 },
    { label: 'Top Center', x: 0.5, y: 0.05 },
    { label: 'Top Right', x: 0.95, y: 0.05 },
    { label: 'Center', x: 0.5, y: 0.5 },
    { label: 'Bottom Left', x: 0.05, y: 0.95 },
    { label: 'Bottom Center', x: 0.5, y: 0.95 },
    { label: 'Bottom Right', x: 0.95, y: 0.95 },
  ];

  const handlePresetPress = (x: number, y: number) => {
    updateOverlay(overlayId, { position: { x, y } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <ThemedText style={styles.label}>Quick Positions</ThemedText>
        <ThemedText style={styles.description}>
          Or drag the overlay directly on the video
        </ThemedText>

        <View style={styles.presetsGrid}>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset.label}
              style={styles.presetButton}
              onPress={() => handlePresetPress(preset.x, preset.y)}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.presetButtonText}>
                {preset.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
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
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
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
