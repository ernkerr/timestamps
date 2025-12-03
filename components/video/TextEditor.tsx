import { View, StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useVideoStore } from '@/lib/store/videoStore';

export function TextEditor() {
  const { overlayConfig, updateOverlayConfig } = useVideoStore();

  const text = overlayConfig.text || '';

  const handleTextChange = (newText: string) => {
    updateOverlayConfig({
      text: newText,
    });
  };

  return (
    <View style={styles.container}>
      {/* Text Input */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Overlay Text</ThemedText>
        <ThemedText style={styles.description}>
          Enter the text to display on your video
        </ThemedText>

        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={handleTextChange}
          placeholder="Enter text..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <ThemedText style={styles.hint}>
          {text.length} characters
        </ThemedText>
      </View>

      {/* Preview */}
      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <View style={styles.previewDot} />
          <ThemedText style={styles.previewTitle}>PREVIEW</ThemedText>
        </View>

        <View style={styles.previewBox}>
          {text ? (
            <ThemedText style={styles.previewText}>{text}</ThemedText>
          ) : (
            <ThemedText style={styles.previewPlaceholder}>
              No text entered
            </ThemedText>
          )}
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
  textInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    backgroundColor: '#fff',
    marginTop: 4,
    minHeight: 80,
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
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: '#000',
    textAlign: 'center',
  },
  previewPlaceholder: {
    fontSize: 14,
    fontWeight: '300',
    color: '#999',
    fontStyle: 'italic',
  },
});
