/**
 * SwipeableRow Component
 * Provides swipe-to-delete functionality using Reanimated
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DELETE_THRESHOLD = 80;
const DISMISS_THRESHOLD = SCREEN_WIDTH * 0.4;

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  enabled?: boolean;
}

export function SwipeableRow({
  children,
  onDelete,
  enabled = true,
}: SwipeableRowProps) {
  const translateX = useSharedValue(0);
  const context = useSharedValue({ x: 0 });
  const isDeleting = useSharedValue(false);

  const handleDelete = () => {
    onDelete();
  };

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onStart(() => {
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      // Only allow swiping left (negative values)
      const newValue = context.value.x + event.translationX;
      translateX.value = Math.min(0, Math.max(-DISMISS_THRESHOLD - 20, newValue));
    })
    .onEnd((event) => {
      if (translateX.value < -DISMISS_THRESHOLD) {
        // Swipe complete - dismiss and delete
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, () => {
          runOnJS(handleDelete)();
        });
        isDeleting.value = true;
      } else if (translateX.value < -DELETE_THRESHOLD) {
        // Show delete action
        translateX.value = withSpring(-DELETE_THRESHOLD, {
          damping: 20,
          stiffness: 200,
        });
      } else {
        // Reset
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const actionStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / DELETE_THRESHOLD),
  }));

  return (
    <View style={styles.container}>
      {/* Delete Action Background */}
      <Animated.View style={[styles.actionContainer, actionStyle]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={24} color={Colors.light.primaryText} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.rowContainer, rowStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  rowContainer: {
    backgroundColor: Colors.light.background,
  },
  actionContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: Spacing.md,
    width: DELETE_THRESHOLD,
    backgroundColor: Colors.light.error,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  deleteText: {
    color: Colors.light.primaryText,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.xs,
  },
});
