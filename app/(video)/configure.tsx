import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoStore } from '@/lib/store/videoStore';

export default function ConfigureScreen() {
  const router = useRouter();
  const { sourceVideo, overlayConfig } = useVideoStore();

  if (!sourceVideo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No video selected</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Configure Overlay</Text>
        <Text style={styles.subtitle}>
          Video: {sourceVideo.fileName || 'Imported video'}
        </Text>
        <Text style={styles.subtitle}>
          Duration: {Math.round(sourceVideo.duration)}s
        </Text>

        {/* TODO: Add overlay configuration UI */}
        <Text style={styles.placeholder}>
          Overlay configuration UI will be implemented in Phase 3
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
