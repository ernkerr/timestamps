import type { OverlayConfig } from "@/lib/types/overlay";
import { Pencil, X } from "lucide-react-native";
import { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { OverlayPreview } from "./OverlayPreview";

interface DraggableOverlayProps {
  config: OverlayConfig;
  currentTime: number;
  videoWidth: number;
  videoHeight: number;
  isSelected: boolean;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSelect: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

// Approximate overlay size for bounds calculation
const OVERLAY_SIZE = 100;

export function DraggableOverlay({
  config,
  currentTime,
  videoWidth,
  videoHeight,
  isSelected,
  onPositionChange,
  onSelect,
  onDelete,
  onEdit,
}: DraggableOverlayProps) {
  // Use shared values for position tracking
  const translateX = useSharedValue(config.position.x * videoWidth);
  const translateY = useSharedValue(config.position.y * videoHeight);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Update position when config changes externally (e.g., preset buttons)
  useEffect(() => {
    translateX.value = config.position.x * videoWidth;
    translateY.value = config.position.y * videoHeight;
  }, [config.position.x, config.position.y, videoWidth, videoHeight]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      // Update position during drag
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      // Convert pixels back to percentage
      // Clamp to ensure we stay within bounds
      const percentX = Math.max(0, Math.min(1, translateX.value / videoWidth));
      const percentY = Math.max(0, Math.min(1, translateY.value / videoHeight));

      // Update shared values to the clamped position to prevent jump
      translateX.value = percentX * videoWidth;
      translateY.value = percentY * videoHeight;

      runOnJS(onPositionChange)({ x: percentX, y: percentY });
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(onSelect)();
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // Create a modified config with position at (0, 0) since we handle positioning via transform
  const modifiedConfig = {
    ...config,
    position: { x: 0, y: 0 },
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        className="absolute"
        style={[
          animatedStyle,
          {
            left: 0,
            top: 0,
          },
        ]}
        onStartShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
      >
        <View style={{ position: "relative", alignSelf: "flex-start" }}>
          <OverlayPreview
            config={modifiedConfig}
            currentTime={currentTime}
            videoWidth={videoWidth}
            videoHeight={videoHeight}
            inline={true}
          />

          {isSelected && (
            <>
              {/* Selection Border */}
              <View
                style={{
                  position: "absolute",
                  top: -9,
                  left: -9,
                  right: -9,
                  bottom: -9,
                  borderWidth: 1,
                  borderColor: "white",
                  pointerEvents: "none",
                }}
              />

              {/* Delete button (left corner) */}
              {onDelete && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  style={{
                    position: "absolute",
                    top: -19,
                    left: -19,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "#000",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 3,
                  }}
                  activeOpacity={0.7}
                >
                  <X color="white" size={14} />
                </TouchableOpacity>
              )}

              {/* Edit button (right corner) */}
              {onEdit && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  style={{
                    position: "absolute",
                    top: -19,
                    right: -19,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "#000",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 3,
                  }}
                  activeOpacity={0.7}
                >
                  <Pencil color="white" size={12} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
