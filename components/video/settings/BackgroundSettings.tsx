import { ThemedText } from '@/components/themed-text';
import { BACKGROUND_OPACITIES } from '@/lib/constants/fonts';
import { useVideoStore } from '@/lib/store/videoStore';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface BackgroundSettingsProps {
  overlayId: string;
}

export function BackgroundSettings({ overlayId }: BackgroundSettingsProps) {
  const { overlays, updateOverlay } = useVideoStore();
  const overlayConfig = overlays.find(o => o.id === overlayId);

  if (!overlayConfig) {
    return null;
  }

  const handleBackgroundOpacityChange = (opacity: number) => {
    if (opacity === 0) {
      updateOverlay(overlayId, { backgroundColor: undefined });
    } else {
      updateOverlay(overlayId, { backgroundColor: `rgba(0, 0, 0, ${opacity})` });
    }
  };

  // Parse current background opacity
  const currentOpacity = overlayConfig.backgroundColor
    ? parseFloat(overlayConfig.backgroundColor.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || '0.5')
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <ThemedText style={styles.label}>Background</ThemedText>
        <View style={styles.optionsGrid}>
          {BACKGROUND_OPACITIES.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                currentOpacity === option.value && styles.optionButtonActive,
              ]}
              onPress={() => handleBackgroundOpacityChange(option.value)}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  currentOpacity === option.value && styles.optionTextActive,
                ]}
              >
                {option.label}
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  optionButtonActive: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.3,
    color: '#000',
  },
  optionTextActive: {
    color: '#fff',
  },
});
