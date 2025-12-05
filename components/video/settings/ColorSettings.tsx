import { ThemedText } from '@/components/themed-text';
import { PRESET_COLORS } from '@/lib/constants/fonts';
import { useVideoStore } from '@/lib/store/videoStore';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ColorSettingsProps {
  overlayId: string;
}

export function ColorSettings({ overlayId }: ColorSettingsProps) {
  const { overlays, updateOverlay } = useVideoStore();
  const overlayConfig = overlays.find(o => o.id === overlayId);

  if (!overlayConfig) {
    return null;
  }

  const handleColorChange = (color: string) => {
    updateOverlay(overlayId, { color });
  };

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <ThemedText style={styles.label}>Text Color</ThemedText>
        <View style={styles.colorGrid}>
          {PRESET_COLORS.map((color) => (
            <TouchableOpacity
              key={color.value}
              style={[
                styles.colorButton,
                { backgroundColor: color.value },
                overlayConfig.color === color.value && styles.colorButtonActive,
              ]}
              onPress={() => handleColorChange(color.value)}
              activeOpacity={0.7}
            >
              {overlayConfig.color === color.value && (
                <View style={styles.colorCheckmark} />
              )}
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonActive: {
    borderColor: '#000',
    borderWidth: 3,
  },
  colorCheckmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#000',
  },
});
