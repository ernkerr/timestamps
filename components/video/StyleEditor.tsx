import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useVideoStore } from '@/lib/store/videoStore';
import { AVAILABLE_FONTS, FONT_SIZES, PRESET_COLORS, BACKGROUND_OPACITIES } from '@/lib/constants/fonts';

export function StyleEditor() {
  const { overlayConfig, updateOverlayConfig } = useVideoStore();

  const handleFontChange = (fontFamily: string) => {
    updateOverlayConfig({ fontFamily });
  };

  const handleFontSizeChange = (fontSize: number) => {
    updateOverlayConfig({ fontSize });
  };

  const handleColorChange = (color: string) => {
    updateOverlayConfig({ color });
  };

  const handleBackgroundOpacityChange = (opacity: number) => {
    if (opacity === 0) {
      updateOverlayConfig({ backgroundColor: undefined });
    } else {
      updateOverlayConfig({ backgroundColor: `rgba(0, 0, 0, ${opacity})` });
    }
  };

  // Parse current background opacity
  const currentOpacity = overlayConfig.backgroundColor
    ? parseFloat(overlayConfig.backgroundColor.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || '0.5')
    : 0;

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

      {/* Text Color */}
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

      {/* Background Opacity */}
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

      {/* Preview */}
      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <View style={styles.previewDot} />
          <ThemedText style={styles.previewTitle}>STYLE PREVIEW</ThemedText>
        </View>

        <View style={styles.previewBox}>
          <View
            style={[
              styles.previewTextContainer,
              overlayConfig.backgroundColor && {
                backgroundColor: overlayConfig.backgroundColor,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.previewText,
                {
                  fontSize: overlayConfig.fontSize,
                  color: overlayConfig.color,
                  fontFamily: overlayConfig.fontFamily === 'System' ? undefined : overlayConfig.fontFamily,
                },
              ]}
            >
              00:00:00
            </ThemedText>
          </View>
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
  previewSection: {
    gap: 12,
    marginTop: 8,
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
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    backgroundColor: '#F5F5F5',
  },
  previewTextContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  previewText: {
    fontWeight: '600',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
});
