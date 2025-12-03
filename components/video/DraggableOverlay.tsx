import { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { X, Pencil } from "lucide-react-native";
import { OverlayPreview } from "./OverlayPreview";
import type { OverlayConfig } from "@/lib/types/overlay";

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
        {/* White border wrapper when selected */}
        {isSelected ? (
          <View style={{ position: "relative", alignSelf: "flex-start" }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: "white",

                padding: 8,
              }}
            >
              <OverlayPreview
                config={modifiedConfig}
                currentTime={currentTime}
                videoWidth={videoWidth}
                videoHeight={videoHeight}
                inline={true}
              />
            </View>

            {/* Delete button (left corner, outside border) */}
            {onDelete && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                style={{
                  position: "absolute",
                  top: -10,
                  left: -10,
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

            {/* Edit button (right corner, outside border) */}
            {onEdit && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                style={{
                  position: "absolute",
                  top: -10,
                  right: -10,
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
          </View>
        ) : (
          <OverlayPreview
            config={modifiedConfig}
            currentTime={currentTime}
            videoWidth={videoWidth}
            videoHeight={videoHeight}
          />
        )}
      </Animated.View>
    </GestureDetector>
  );
}
