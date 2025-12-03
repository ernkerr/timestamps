import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useVideoStore } from '@/lib/store/videoStore';

export default function HomeScreen() {
  const router = useRouter();
  const { setSourceVideo } = useVideoStore();

  const handleImportVideo = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to import videos.'
        );
        return;
      }

      // Launch image picker for videos
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const video = result.assets[0];

        // Store video in state
        setSourceVideo({
          uri: video.uri,
          duration: video.duration || 0,
          dimensions: {
            width: video.width,
            height: video.height,
          },
          fileName: video.fileName ?? undefined,
          fileSize: video.fileSize,
        });

        // Navigate to configure screen
        router.push('/(video)/configure');
      }
    } catch (error) {
      console.error('Error importing video:', error);
      Alert.alert('Error', 'Failed to import video. Please try again.');
    }
  };

  const handleRecordVideo = async () => {
    // TODO: Implement camera recording
    Alert.alert('Coming Soon', 'Video recording will be implemented next!');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <IconSymbol name="video.fill" size={64} color="#007AFF" />
          <ThemedText type="title" style={styles.title}>
            Timestamps
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Add timers and timestamps to your videos
          </ThemedText>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleImportVideo}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <IconSymbol name="photo.on.rectangle" size={48} color="#fff" />
            </View>
            <ThemedText style={styles.actionTitle}>Import Video</ThemedText>
            <ThemedText style={styles.actionSubtitle}>
              Choose from your library
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRecordVideo}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <IconSymbol name="video.badge.plus" size={48} color="#fff" />
            </View>
            <ThemedText style={styles.actionTitle}>Record Video</ThemedText>
            <ThemedText style={styles.actionSubtitle}>
              Capture a new video
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <ThemedText style={styles.instructionText}>
            1. Import or record a video
          </ThemedText>
          <ThemedText style={styles.instructionText}>
            2. Configure your overlay (timer, timestamp, or text)
          </ThemedText>
          <ThemedText style={styles.instructionText}>
            3. Preview and export your video
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.6,
    textAlign: 'center',
  },
  actions: {
    gap: 16,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  instructions: {
    padding: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 12,
    gap: 12,
  },
  instructionText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
