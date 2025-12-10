import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
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
        videoExportPreset: ImagePicker.VideoExportPreset.H264_1920x1080,
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
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera access to record videos.'
        );
        return;
      }

      // Launch camera for video recording
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 1,
        videoMaxDuration: 300, // 5 minutes max
        videoExportPreset: ImagePicker.VideoExportPreset.H264_1920x1080,
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
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logoMark} />
            <ThemedText style={styles.brandText}>TIMESTAMPS</ThemedText>
          </View>
          <ThemedText style={styles.tagline}>
            Add precision timing overlays to video
          </ThemedText>
        </View>

        {/* Main Actions */}
        <View style={styles.mainActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleImportVideo}
            activeOpacity={0.7}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionNumber}>
                <ThemedText style={styles.numberText}>01</ThemedText>
              </View>
              <View style={styles.actionDetails}>
                <ThemedText style={styles.actionLabel}>Import</ThemedText>
                <ThemedText style={styles.actionDescription}>
                  From library
                </ThemedText>
              </View>
              <View style={styles.actionArrow}>
                <ThemedText style={styles.arrowText}>→</ThemedText>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRecordVideo}
            activeOpacity={0.7}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionNumber}>
                <ThemedText style={styles.numberText}>02</ThemedText>
              </View>
              <View style={styles.actionDetails}>
                <ThemedText style={styles.actionLabel}>Record</ThemedText>
                <ThemedText style={styles.actionDescription}>
                  New capture
                </ThemedText>
              </View>
              <View style={styles.actionArrow}>
                <ThemedText style={styles.arrowText}>→</ThemedText>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/projects')}
            activeOpacity={0.7}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionNumber}>
                <ThemedText style={styles.numberText}>03</ThemedText>
              </View>
              <View style={styles.actionDetails}>
                <ThemedText style={styles.actionLabel}>Projects</ThemedText>
                <ThemedText style={styles.actionDescription}>
                  Resume drafts
                </ThemedText>
              </View>
              <View style={styles.actionArrow}>
                <ThemedText style={styles.arrowText}>→</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Process */}
        <View style={styles.processContainer}>
          <View style={styles.processHeader}>
            <View style={styles.processDot} />
            <ThemedText style={styles.processTitle}>Process</ThemedText>
          </View>
          <View style={styles.processSteps}>
            <ThemedText style={styles.stepText}>Select media</ThemedText>
            <ThemedText style={styles.stepText}>Configure overlay</ThemedText>
            <ThemedText style={styles.stepText}>Export result</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  header: {
    marginBottom: 64,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoMark: {
    width: 4,
    height: 24,
    backgroundColor: '#000',
    marginRight: 12,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 2,
    color: '#000',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '300',
    color: '#666',
    letterSpacing: 0.5,
    lineHeight: 20,
    maxWidth: 240,
  },
  mainActions: {
    marginBottom: 80,
    gap: 16,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 0,
    backgroundColor: '#fff',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  actionNumber: {
    width: 48,
    marginRight: 20,
  },
  numberText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    letterSpacing: 1,
  },
  actionDetails: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 22,
    fontWeight: '400',
    color: '#000',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    fontWeight: '300',
    color: '#666',
    letterSpacing: 0.5,
  },
  actionArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#000',
  },
  processContainer: {
    marginTop: 'auto',
    paddingBottom: 40,
  },
  processHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  processDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
    marginRight: 10,
  },
  processTitle: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#000',
  },
  processSteps: {
    paddingLeft: 16,
    gap: 8,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '300',
    color: '#666',
    letterSpacing: 0.3,
    lineHeight: 20,
  },
});
