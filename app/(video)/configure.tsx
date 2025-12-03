import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { OverlayPreview } from "@/components/video/OverlayPreview";
import { TimerEditor } from "@/components/video/TimerEditor";
import { TimestampEditor } from "@/components/video/TimestampEditor";
import { TextEditor } from "@/components/video/TextEditor";
import { StyleEditor } from "@/components/video/StyleEditor";
import { PositionControl } from "@/components/video/PositionControl";
import { useVideoStore } from "@/lib/store/videoStore";
import type { OverlayType } from "@/lib/types/overlay";

export default function ConfigureScreen() {
  const router = useRouter();
  const { sourceVideo, overlayConfig, setOverlayType, updateOverlayConfig } =
    useVideoStore();

  // Video dimensions for overlay positioning
  const videoWidth = Dimensions.get("window").width - 48;
  const videoHeight = videoWidth * (9 / 16);

  // Shared values for overlay position
  const translateX = useSharedValue(overlayConfig.position.x * videoWidth);
  const translateY = useSharedValue(overlayConfig.position.y * videoHeight);

  // Track starting position for each gesture
  const gestureStartX = useSharedValue(0);
  const gestureStartY = useSharedValue(0);

  // Update shared values when position changes from external sources (like PositionControl)
  useEffect(() => {
    translateX.value = overlayConfig.position.x * videoWidth;
    translateY.value = overlayConfig.position.y * videoHeight;
  }, [overlayConfig.position.x, overlayConfig.position.y, videoWidth, videoHeight, translateX, translateY]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      gestureStartX.value = translateX.value;
      gestureStartY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Add translation to the starting position
      const newX = gestureStartX.value + event.translationX;
      const newY = gestureStartY.value + event.translationY;

      // Constrain to video bounds
      translateX.value = Math.max(0, Math.min(videoWidth, newX));
      translateY.value = Math.max(0, Math.min(videoHeight, newY));
    })
    .onFinalize(() => {
      'worklet';
      // Save the final position
      const percentX = translateX.value / videoWidth;
      const percentY = translateY.value / videoHeight;

      // Update on JS thread
      updateOverlayConfig({
        position: { x: percentX, y: percentY },
      });
    });

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  if (!sourceVideo) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>No video selected</ThemedText>
        </View>
      </View>
    );
  }

  const overlayTypes: Array<{
    type: OverlayType;
    label: string;
    description: string;
  }> = [
    {
      type: "elapsed",
      label: "Elapsed Timer",
      description: "Count up from video start",
    },
    {
      type: "timestamp",
      label: "Time-of-Day",
      description: "Real-world time with timelapse",
    },
    {
      type: "text",
      label: "Custom Text",
      description: "Static or dynamic text",
    },
    {
      type: "none",
      label: "No Overlay",
      description: "Export without overlay",
    },
  ];

  const handleNext = () => {
    router.push("/(video)/preview");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerMark} />
          <ThemedText style={styles.headerText}>CONFIGURE</ThemedText>
        </View>

        {/* Video Preview */}
        <View style={styles.videoSection}>
          <View style={styles.videoContainer}>
            <VideoPlayer
              videoSource={{ uri: sourceVideo.uri }}
              style={styles.videoPlayer}
              shouldLoop
              shouldMute
            />
            {/* Draggable Overlay Preview on Video */}
            {overlayConfig.type !== "none" && (
              <View style={styles.overlayContainer} pointerEvents="box-none">
                <GestureDetector gesture={panGesture}>
                  <Animated.View
                    style={[animatedOverlayStyle, { position: "absolute" }]}
                  >
                    <OverlayPreview
                      config={overlayConfig}
                      currentTime={5} // Show preview at 5 seconds
                      videoWidth={videoWidth}
                      videoHeight={videoHeight}
                    />
                  </Animated.View>
                </GestureDetector>
              </View>
            )}
          </View>
          <View style={styles.videoInfo}>
            <ThemedText style={styles.videoInfoText}>
              {sourceVideo.fileName || "Imported video"}
            </ThemedText>
            <ThemedText style={styles.videoInfoText}>
              {Math.round(sourceVideo.duration)}s •{" "}
              {sourceVideo.dimensions.width}×{sourceVideo.dimensions.height}
            </ThemedText>
            {overlayConfig.type !== "none" && (
              <ThemedText style={styles.videoInfoHint}>
                Preview shows overlay at 5s
              </ThemedText>
            )}
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
                    overlayConfig.type === item.type &&
                      styles.typeDescriptionActive,
                  ]}
                >
                  {item.description}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Overlay Configuration */}
        {overlayConfig.type !== "none" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <ThemedText style={styles.sectionTitle}>SETTINGS</ThemedText>
            </View>

            {overlayConfig.type === "elapsed" && <TimerEditor />}
            {overlayConfig.type === "timestamp" && <TimestampEditor />}
            {overlayConfig.type === "text" && <TextEditor />}
          </View>
        )}

        {/* Style Customization */}
        {overlayConfig.type !== "none" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <ThemedText style={styles.sectionTitle}>APPEARANCE</ThemedText>
            </View>

            <StyleEditor />

            {/* Divider */}
            <View style={styles.divider} />

            <PositionControl />
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
          <ThemedText style={styles.nextButtonText}>
            Continue to Preview
          </ThemedText>
          <ThemedText style={styles.nextArrow}>→</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  headerMark: {
    width: 4,
    height: 20,
    backgroundColor: "#000",
    marginRight: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 2,
    color: "#000",
  },
  videoSection: {
    marginBottom: 32,
  },
  videoContainer: {
    position: "relative",
    width: "100%",
  },
  videoPlayer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 0,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  videoInfo: {
    marginTop: 12,
    gap: 4,
  },
  videoInfoText: {
    fontSize: 12,
    fontWeight: "300",
    color: "#666",
    letterSpacing: 0.3,
  },
  videoInfoHint: {
    fontSize: 11,
    fontWeight: "300",
    color: "#999",
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#000",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1.5,
    color: "#000",
  },
  typeGrid: {
    gap: 12,
  },
  typeCard: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 0,
    padding: 16,
    backgroundColor: "#fff",
  },
  typeCardActive: {
    borderColor: "#000",
    backgroundColor: "#000",
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.5,
    color: "#000",
    marginBottom: 4,
  },
  typeLabelActive: {
    color: "#fff",
  },
  typeDescription: {
    fontSize: 12,
    fontWeight: "300",
    color: "#666",
    letterSpacing: 0.3,
  },
  typeDescriptionActive: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#666",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#000",
    padding: 24,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 0,
    backgroundColor: "#000",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.5,
    color: "#fff",
    marginRight: 8,
  },
  nextArrow: {
    fontSize: 20,
    fontWeight: "300",
    color: "#fff",
  },
});
