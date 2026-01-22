import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  LayoutChangeEvent,
  Animated,
} from 'react-native';

interface TooltipProps {
  text: string;
  x: number;
  y: number;
  visible: boolean;
  containerWidth: number;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    maxWidth: 300,
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  text: {
    color: '#f5f5f5',
    fontSize: 14,
    fontFamily: 'System', // Fallback to system font
  },
});

export const Tooltip: React.FC<TooltipProps> = ({
  text,
  x,
  y,
  visible,
  containerWidth,
}) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  const getPosition = () => {
    if (!layout.width || !layout.height) return { top: -1000, left: -1000 };

    const margin = 10;

    // Default to top
    let top = y - layout.height - margin;
    let left = x - layout.width / 2;

    // Check bounds
    // Avoid left edge
    if (left < margin) {
      left = margin;
    }
    // Avoid right edge
    if (left + layout.width > containerWidth - margin) {
      left = containerWidth - layout.width - margin;
    }

    // Note: vertical checks would require container height, strictly speaking.
    // For now assuming sticking to 'top' is preferred unless we want to flip.
    // Given the widget behavior, top is default.

    return { top, left };
  };

  const { top, left } = getPosition();

  // If not visible and not animating out, we can hide it to prevent touches?
  // Animated opacity handles visibility visual.
  // We use pointerEvents="none" to let touches pass through if transparent.

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          top,
          left,
        },
      ]}
      onLayout={handleLayout}
      pointerEvents="none"
    >
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
};
