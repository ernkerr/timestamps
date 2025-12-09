import { ThemedText } from "@/components/themed-text";
import { OverlayTypeSelector } from "@/components/video/OverlayTypeSelector";
import { TextSettings } from "@/components/video/settings/TextSettings";
import { TimerSettings } from "@/components/video/settings/TimerSettings";
import { TimestampSettings } from "@/components/video/settings/TimestampSettings";
import { VideoWithOverlays } from "@/components/video/VideoWithOverlays";
import { useVideoStore } from "@/lib/store/videoStore";
import type { OverlayType } from "@/lib/types/overlay";
import { debounce } from "@/lib/utils/debounce";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

export default function ConfigureScreen() {
  const router = useRouter();
  const {
    sourceVideo,
    overlays,
    selectedOverlayId,
    addOverlay,
    selectOverlay,
    updateOverlay,
    removeOverlay,
    saveDraftProject
  } = useVideoStore();

  // Settings panel state management
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);

  // Auto-open/close settings panel based on selection
  useEffect(() => {
    setSettingsPanelOpen(!!selectedOverlayId);
  }, [selectedOverlayId]);

  // Debounced auto-save for drafts
  const debouncedSave = useMemo(
    () => debounce(() => {
      saveDraftProject();
    }, 2000),
    [saveDraftProject]
  );

  // Trigger auto-save when overlays change
  useEffect(() => {
    if (sourceVideo && overlays.length > 0) {
      debouncedSave();
    }
  }, [overlays, sourceVideo, debouncedSave]);

  // Get the currently selected overlay for editing
  const selectedOverlay = overlays.find(o => o.id === selectedOverlayId) || overlays[0];

  const handleCloseSettings = () => {
    selectOverlay(null);
  };

  const handleTypeSelect = (type: OverlayType) => {
    addOverlay(type);
  };

  const handleNext = () => {
    router.push("/(video)/preview");
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.dismiss()} style={styles.headerCloseButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerText}>CONFIGURE</ThemedText>
        </View>
        <TouchableOpacity
          style={styles.headerNextButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.headerNextText}>Next</ThemedText>
          <ThemedText style={styles.headerNextArrow}>→</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Video Preview - Top Right */}
        <View style={styles.previewSection}>
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

        {/* Settings Panel - Scrollable */}
        <ScrollView
          style={styles.settingsScroll}
          contentContainerStyle={styles.settingsContent}
          showsVerticalScrollIndicator={false}
        >
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
                  <ThemedText style={styles.closeButtonText}>×</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Settings for Selected Overlay */}
              <View style={styles.settingsContainer}>
                {selectedOverlay.type === "elapsed" && <TimerSettings overlayId={selectedOverlay.id} />}
                {selectedOverlay.type === "timestamp" && <TimestampSettings overlayId={selectedOverlay.id} />}
                {selectedOverlay.type === "text" && <TextSettings overlayId={selectedOverlay.id} />}
              </View>
            </Animated.View>
          ) : (
            /* Empty State */
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                Select an overlay type below to get started
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bottom Overlay Type Selector - Only show when NOT editing */}
      {!settingsPanelOpen && (
        <OverlayTypeSelector
          selectedType={selectedOverlay?.type || null}
          onSelectType={handleTypeSelect}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerCloseButton: {
    marginRight: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 2,
    color: "#000",
  },
  headerNextButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#000",
  },
  headerNextText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  headerNextArrow: {
    fontSize: 16,
    color: "#fff",
  },
  mainContent: {
    flex: 1,
  },
  previewSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "transparent", // Changed from #000
    borderRadius: 4,
    overflow: "hidden",
  },
  settingsScroll: {
    flex: 1,
  },
  settingsContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#000",
    marginRight: 10,
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
  settingsContainer: {
    gap: 20,
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
});
