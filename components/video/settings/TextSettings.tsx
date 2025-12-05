import { ThemedText } from '@/components/themed-text';
import { useVideoStore } from '@/lib/store/videoStore';
import { Type } from 'lucide-react-native';
import { StyleSheet, TextInput, View } from 'react-native';
import { BackgroundSettings } from './BackgroundSettings';
import { ColorSettings } from './ColorSettings';
import { FontSettings } from './FontSettings';

interface TextSettingsProps {
  overlayId: string;
}

export function TextSettings({ overlayId }: TextSettingsProps) {
  const { overlays, updateOverlay } = useVideoStore();
  const overlayConfig = overlays.find(o => o.id === overlayId);

  if (!overlayConfig) {
    return null;
  }

  const text = overlayConfig.text || '';

  const handleTextChange = (newText: string) => {
    updateOverlay(overlayId, { text: newText });
  };

  return (
    <View style={styles.container}>
      {/* Text Input */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Overlay Text</ThemedText>
        <View style={styles.textInputContainer}>
          <Type size={16} color="#666" style={styles.textIcon} />
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
        </View>
        <ThemedText style={styles.hint}>
          {text.length} characters
        </ThemedText>
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
  textInputContainer: {
    position: 'relative',
  },
  textIcon: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingLeft: 40,
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    backgroundColor: '#fff',
    minHeight: 80,
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
