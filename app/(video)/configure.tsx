import { useState, useEffect } from "react";
import { ThemedText } from "@/components/themed-text";
import { PositionControl } from "@/components/video/PositionControl";
import { StyleEditor } from "@/components/video/StyleEditor";
import { TextEditor } from "@/components/video/TextEditor";
import { TimerEditor } from "@/components/video/TimerEditor";
import { TimestampEditor } from "@/components/video/TimestampEditor";
import { VideoWithOverlays } from "@/components/video/VideoWithOverlays";
import { useVideoStore } from "@/lib/store/videoStore";
import type { OverlayType } from "@/lib/types/overlay";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";

export default function ConfigureScreen() {
  const router = useRouter();
  const {
    sourceVideo,
    overlays,
    selectedOverlayId,
    toggleOverlayType,
    hasOverlayType,
    selectOverlay,
    updateOverlay,
    removeOverlay
  } = useVideoStore();

  // Settings panel state management
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);

  // Auto-open/close settings panel based on selection
  useEffect(() => {
    setSettingsPanelOpen(!!selectedOverlayId);
  }, [selectedOverlayId]);

  // Get the currently selected overlay for editing
  const selectedOverlay = overlays.find(o => o.id === selectedOverlayId) || overlays[0];

  const handleCloseSettings = () => {
    selectOverlay(null);
  };

  if (!sourceVideo) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>No video selected</ThemedText>
        </View>
      </View>
    );
  }

  const overlayTypes: {
    type: OverlayType;
    label: string;
    description: string;
  }[] = [
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
            <VideoWithOverlays
              videoSource={{ uri: sourceVideo.uri }}
              overlays={overlays}
              selectedOverlayId={selectedOverlayId}
              onOverlaySelect={selectOverlay}
              onOverlayPositionChange={(id, pos) => updateOverlay(id, { position: pos })}
              onOverlayDelete={removeOverlay}
              shouldLoop
              shouldMute
            />
          </View>
        </View>

        {/* Overlay Type Selector - Only show when no overlays exist */}
        {overlays.length === 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <ThemedText style={styles.sectionTitle}>OVERLAY TYPE</ThemedText>
            </View>

            <View style={styles.typeGrid}>
              {overlayTypes.map((item) => {
                const isSelected = item.type === 'none'
                  ? overlays.length === 0
                  : hasOverlayType(item.type);

                return (
                  <TouchableOpacity
                    key={item.type}
                    style={[
                      styles.typeCard,
                      isSelected && styles.typeCardActive,
                    ]}
                    onPress={() => toggleOverlayType(item.type)}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      style={[
                        styles.typeLabel,
                        isSelected && styles.typeLabelActive,
                      ]}
                    >
                      {item.label}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.typeDescription,
                        isSelected && styles.typeDescriptionActive,
                      ]}
                    >
                      {item.description}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Settings Panel */}
        {settingsPanelOpen && selectedOverlay ? (
          <Animated.View
            entering={FadeInDown.duration(200)}
            exiting={FadeOutUp.duration(150)}
          >
            {/* Panel Header with Close Button */}
            <View style={styles.panelHeader}>
              <View style={styles.panelHeaderLeft}>
                <View style={styles.sectionDot} />
                <ThemedText style={styles.panelHeaderTitle}>
                  EDITING: {selectedOverlay.type.toUpperCase()}
                </ThemedText>
              </View>
              <TouchableOpacity
                onPress={handleCloseSettings}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Overlay Selector (if multiple overlays) */}
            {overlays.length > 1 && (
              <View style={styles.section}>
                <ScrollView
                  horizontal
                  style={styles.overlaySelector}
                  showsHorizontalScrollIndicator={false}
                >
                  {overlays.map((overlay) => (
                    <TouchableOpacity
                      key={overlay.id}
                      style={[
                        styles.overlayTab,
                        overlay.id === selectedOverlayId && styles.overlayTabActive,
                      ]}
                      onPress={() => selectOverlay(overlay.id)}
                      activeOpacity={0.7}
                    >
                      <ThemedText
                        style={[
                          styles.overlayTabText,
                          overlay.id === selectedOverlayId && styles.overlayTabTextActive,
                        ]}
                      >
                        {overlay.type.charAt(0).toUpperCase() + overlay.type.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Settings for Selected Overlay */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionDot} />
                <ThemedText style={styles.sectionTitle}>SETTINGS</ThemedText>
              </View>

              {selectedOverlay.type === "elapsed" && <TimerEditor overlayId={selectedOverlay.id} />}
              {selectedOverlay.type === "timestamp" && <TimestampEditor overlayId={selectedOverlay.id} />}
              {selectedOverlay.type === "text" && <TextEditor overlayId={selectedOverlay.id} />}
            </View>

            {/* Style Customization */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionDot} />
                <ThemedText style={styles.sectionTitle}>APPEARANCE</ThemedText>
              </View>

              <StyleEditor overlayId={selectedOverlay.id} />

              {/* Divider */}
              <View style={styles.divider} />

              <PositionControl overlayId={selectedOverlay.id} />
            </View>
          </Animated.View>
        ) : (
          /* Empty State */
          overlays.length === 0 && (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                Select an overlay type above to get started
              </ThemedText>
            </View>
          )
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
    marginHorizontal: -24,
  },
  videoContainer: {
    position: "relative",
    width: "100%",
  },
  videoPlayer: {
    width: "100%",
    aspectRatio: 16 / 10,
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
  overlaySelector: {
    flexDirection: "row",
  },
  overlayTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  overlayTabActive: {
    borderColor: "#000",
    backgroundColor: "#000",
  },
  overlayTabText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#666",
    letterSpacing: 0.3,
  },
  overlayTabTextActive: {
    color: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 24,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  panelHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  panelHeaderTitle: {
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 1.5,
    color: "#000",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
  },
  closeButtonText: {
    fontSize: 28,
    fontWeight: "300",
    color: "#666",
    lineHeight: 28,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#999",
    textAlign: "center",
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
