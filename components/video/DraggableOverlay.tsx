import { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { X, Pencil } from 'lucide-react-native';
import { OverlayPreview } from './OverlayPreview';
import type { OverlayConfig } from '@/lib/types/overlay';

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
        className={`absolute ${isSelected ? 'border-2 border-white rounded' : ''}`}
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
        <OverlayPreview
          config={modifiedConfig}
          currentTime={currentTime}
          videoWidth={videoWidth}
          videoHeight={videoHeight}
        />

        {/* Action buttons when selected */}
        {isSelected && (
          <>
            {/* Delete button (top-left) */}
            {onDelete && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-black items-center justify-center border-2 border-white"
                activeOpacity={0.7}
              >
                <X color="white" size={16} />
              </TouchableOpacity>
            )}

            {/* Edit button (top-right) */}
            {onEdit && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black items-center justify-center border-2 border-white"
                activeOpacity={0.7}
              >
                <Pencil color="white" size={14} />
              </TouchableOpacity>
            )}
          </>
        )}
      </Animated.View>
    </GestureDetector>
  );
}
