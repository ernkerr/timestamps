import { ThemedText } from '@/components/themed-text';
import { AVAILABLE_FONTS, FONT_SIZES } from '@/lib/constants/fonts';
import { useVideoStore } from '@/lib/store/videoStore';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface FontSettingsProps {
  overlayId: string;
}

export function FontSettings({ overlayId }: FontSettingsProps) {
  const { overlays, updateOverlay } = useVideoStore();
  const overlayConfig = overlays.find(o => o.id === overlayId);

  if (!overlayConfig) {
    return null;
  }

  const handleFontChange = (fontFamily: string) => {
    updateOverlay(overlayId, { fontFamily });
  };

  const handleFontSizeChange = (fontSize: number) => {
    updateOverlay(overlayId, { fontSize });
  };

  return (
    <View style={styles.container}>
      {/* Font Family */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Font</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          <View style={styles.horizontalOptions}>
            {AVAILABLE_FONTS.map((font) => (
              <TouchableOpacity
                key={font.value}
                style={[
                  styles.optionButton,
                  overlayConfig.fontFamily === font.family && styles.optionButtonActive,
                ]}
                onPress={() => handleFontChange(font.family)}
                activeOpacity={0.7}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    overlayConfig.fontFamily === font.family && styles.optionTextActive,
                    { fontFamily: font.family === 'System' ? undefined : font.family },
                  ]}
                >
                  {font.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Font Size */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Size</ThemedText>
        <View style={styles.optionsGrid}>
          {FONT_SIZES.map((size) => (
            <TouchableOpacity
              key={size.value}
              style={[
                styles.optionButton,
                overlayConfig.fontSize === size.value && styles.optionButtonActive,
              ]}
              onPress={() => handleFontSizeChange(size.value)}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  overlayConfig.fontSize === size.value && styles.optionTextActive,
                ]}
              >
                {size.label}
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
  horizontalScroll: {
    marginTop: 4,
  },
  horizontalOptions: {
    flexDirection: 'row',
    gap: 8,
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
