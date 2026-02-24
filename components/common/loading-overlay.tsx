/**
 * Loading Overlay Component
 * Full screen loading indicator with animations (Sprint 3 polish)
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Colors, FontSize, Spacing } from '@/constants';
import { LoadingAnimationConfig } from '@/utils/animations';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export function LoadingOverlay({ visible, message, showProgress, progress }: LoadingOverlayProps) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // Spinner rotation
      rotation.value = withRepeat(
        withTiming(360, { 
          duration: LoadingAnimationConfig.spinner.duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );
      
      // Pulse animation
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      rotation.value = 0;
      pulse.value = 1;
    }
  }, [visible]);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View 
          style={styles.container}
          entering={FadeIn.duration(200).springify()}
          exiting={FadeOut.duration(200)}
        >
          <Animated.View style={[styles.spinnerContainer, pulseStyle]}>
            <Animated.View style={[styles.spinner, spinnerStyle]}>
              <View style={styles.spinnerArc} />
            </Animated.View>
            <Text style={styles.spinnerIcon}>🌾</Text>
          </Animated.View>
          
          {showProgress && progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, Math.max(0, progress))}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}
          
          {message && <Text style={styles.message}>{message}</Text>}
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Inline loading spinner (non-modal)
 */
export function LoadingSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const rotation = useSharedValue(0);
  
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const dimensions = {
    small: 20,
    medium: 32,
    large: 48,
  }[size];

  return (
    <Animated.View 
      style={[
        styles.inlineSpinner,
        { width: dimensions, height: dimensions },
        spinnerStyle,
      ]}
    >
      <View style={[styles.spinnerArc, { borderWidth: size === 'small' ? 2 : 3 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.light.card,
    padding: Spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 150,
  },
  spinnerContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    position: 'absolute',
    width: 64,
    height: 64,
  },
  spinnerArc: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    borderWidth: 3,
    borderColor: Colors.light.primary,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  spinnerIcon: {
    fontSize: 28,
  },
  progressContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  progressTrack: {
    width: 120,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  progressText: {
    marginTop: Spacing.xs,
    fontSize: FontSize.sm,
    color: Colors.light.textMuted,
  },
  message: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.light.text,
    textAlign: 'center',
  },
  inlineSpinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
