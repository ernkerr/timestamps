import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { useVideoStore } from '@/lib/store/videoStore';
import type { OverlayType } from '@/lib/types/overlay';

export default function ConfigureScreen() {
  const router = useRouter();
  const { sourceVideo, overlayConfig, setOverlayType } = useVideoStore();

  if (!sourceVideo) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>No video selected</ThemedText>
        </View>
      </View>
    );
  }

  const overlayTypes: Array<{ type: OverlayType; label: string; description: string }> = [
    { type: 'elapsed', label: 'Elapsed Timer', description: 'Count up from video start' },
    { type: 'timestamp', label: 'Time-of-Day', description: 'Real-world time with timelapse' },
    { type: 'text', label: 'Custom Text', description: 'Static or dynamic text' },
    { type: 'none', label: 'No Overlay', description: 'Export without overlay' },
  ];

  const handleNext = () => {
    router.push('/(video)/preview');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerMark} />
          <ThemedText style={styles.headerText}>CONFIGURE</ThemedText>
        </View>

        {/* Video Preview */}
        <View style={styles.videoSection}>
          <VideoPlayer
            videoSource={{ uri: sourceVideo.uri }}
            style={styles.videoPlayer}
            shouldLoop
            shouldMute
          />
          <View style={styles.videoInfo}>
            <ThemedText style={styles.videoInfoText}>
              {sourceVideo.fileName || 'Imported video'}
            </ThemedText>
            <ThemedText style={styles.videoInfoText}>
              {Math.round(sourceVideo.duration)}s • {sourceVideo.dimensions.width}×{sourceVideo.dimensions.height}
            </ThemedText>
          </View>
        </View>

        {/* Overlay Type Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <ThemedText style={styles.sectionTitle}>OVERLAY TYPE</ThemedText>
          </View>

          <View style={styles.typeGrid}>
            {overlayTypes.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.typeCard,
                  overlayConfig.type === item.type && styles.typeCardActive,
                ]}
                onPress={() => setOverlayType(item.type)}
                activeOpacity={0.7}
              >
                <ThemedText
                  style={[
                    styles.typeLabel,
                    overlayConfig.type === item.type && styles.typeLabelActive,
                  ]}
                >
                  {item.label}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.typeDescription,
                    overlayConfig.type === item.type && styles.typeDescriptionActive,
                  ]}
                >
                  {item.description}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Overlay Configuration */}
        {overlayConfig.type !== 'none' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <ThemedText style={styles.sectionTitle}>SETTINGS</ThemedText>
            </View>

            <View style={styles.settingsPlaceholder}>
              <ThemedText style={styles.placeholderText}>
                {overlayConfig.type === 'elapsed' && 'Timer settings coming next'}
                {overlayConfig.type === 'timestamp' && 'Timestamp settings coming next'}
                {overlayConfig.type === 'text' && 'Text settings coming next'}
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.nextButtonText}>Continue to Preview</ThemedText>
          <ThemedText style={styles.nextArrow}>→</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerMark: {
    width: 4,
    height: 20,
    backgroundColor: '#000',
    marginRight: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 2,
    color: '#000',
  },
  videoSection: {
    marginBottom: 32,
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 0,
  },
  videoInfo: {
    marginTop: 12,
    gap: 4,
  },
  videoInfoText: {
    fontSize: 12,
    fontWeight: '300',
    color: '#666',
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: '#000',
  },
  typeGrid: {
    gap: 12,
  },
  typeCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 0,
    padding: 16,
    backgroundColor: '#fff',
  },
  typeCardActive: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: '#000',
    marginBottom: 4,
  },
  typeLabelActive: {
    color: '#fff',
  },
  typeDescription: {
    fontSize: 12,
    fontWeight: '300',
    color: '#666',
    letterSpacing: 0.3,
  },
  typeDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  settingsPlaceholder: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 0,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '300',
    color: '#999',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#000',
    padding: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 0,
    backgroundColor: '#000',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: '#fff',
    marginRight: 8,
  },
  nextArrow: {
    fontSize: 20,
    fontWeight: '300',
    color: '#fff',
  },
});
