import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import type { SoyioTheme } from '../types';

export interface ConsentSkeletonProps {
  theme?: SoyioTheme;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
}

const ANIMATION_DURATION = 1500;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    minHeight: 112,
    borderWidth: 1,
    borderRadius: 4,
    zIndex: 1,
  },
  mainContainer: {
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  shimmerContainer: {
    overflow: 'hidden',
    borderRadius: 4,
  },
  shimmerBase: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  shimmerHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    opacity: 0.5,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  titleBar: {
    height: 16,
    flex: 0.3,
  },
  expandButton: {
    width: 48,
    height: 20,
    marginLeft: 'auto',
  },
  checkboxContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
  },
  textContent: {
    flex: 1,
    gap: 8,
  },
  textLine1: {
    height: 14,
    width: '80%',
  },
  textLine2: {
    height: 14,
    width: '60%',
  },
});

export const ConsentSkeleton: React.FC<ConsentSkeletonProps> = ({
  theme,
  visible = true,
  style,
}) => {
  const systemColorScheme = useColorScheme();
  const isDarkMode = theme === 'night' || (!theme && systemColorScheme === 'dark');

  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    );
    shimmerLoop.start();

    return () => shimmerLoop.stop();
  }, [shimmerAnim]);

  useEffect(() => {
    if (!visible) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [visible, fadeAnim]);

  const backgroundColor = isDarkMode ? '#1E293B' : '#FFFFFF';
  const borderColor = isDarkMode ? '#334155' : '#E5E7EB';
  const shimmerBaseColor = isDarkMode ? '#334155' : '#f0f0f0';

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const renderShimmerBox = (boxStyle: ViewStyle) => (
    <View style={[styles.shimmerContainer, boxStyle]}>
      <View style={[styles.shimmerBase, { backgroundColor: shimmerBaseColor }]}>
        <Animated.View
          style={[
            styles.shimmerHighlight,
            {
              transform: [{ translateX: shimmerTranslateX }],
              backgroundColor: isDarkMode ? '#475569' : '#e0e0e0',
            },
          ]}
        />
      </View>
    </View>
  );

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          opacity: fadeAnim,
        },
        style,
      ]}
    >
      <View style={styles.mainContainer}>
        {/* Top row: icon, title, expand button */}
        <View style={styles.topRow}>
          {renderShimmerBox(styles.iconCircle)}
          {renderShimmerBox(styles.titleBar)}
          {renderShimmerBox(styles.expandButton)}
        </View>

        {/* Bottom row: checkbox and text lines */}
        <View style={styles.bottomRow}>
          <View style={styles.checkboxContainer}>
            {renderShimmerBox(styles.checkbox)}
          </View>
          <View style={styles.textContent}>
            {renderShimmerBox(styles.textLine1)}
            {renderShimmerBox(styles.textLine2)}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
