/**
 * Offline Indicator Component
 * Shows a banner when the device is offline
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants';
import { useNetwork } from '@/hooks/use-network';

interface OfflineIndicatorProps {
  showWhenOnline?: boolean;
}

export function OfflineIndicator({ showWhenOnline = false }: OfflineIndicatorProps) {
  const insets = useSafeAreaInsets();
  const { isOffline, networkStatus } = useNetwork();

  const shouldShow = isOffline || (showWhenOnline && !isOffline);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(shouldShow ? 0 : -100, {
          damping: 20,
          stiffness: 200,
        }),
      },
    ],
    opacity: withTiming(shouldShow ? 1 : 0, { duration: 200 }),
  }));

  if (!shouldShow) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.xs,
          backgroundColor: isOffline ? Colors.light.warning : Colors.light.success,
        },
        animatedStyle,
      ]}
    >
      <Ionicons
        name={isOffline ? 'cloud-offline' : 'cloud-done'}
        size={18}
        color={Colors.light.primaryText}
      />
      <Text style={styles.text}>
        {isOffline
          ? 'You are offline. Core features still work!'
          : 'Back online'}
      </Text>
    </Animated.View>
  );
}

/**
 * Compact offline badge for status bars
 */
export function OfflineBadge() {
  const { isOffline } = useNetwork();

  if (!isOffline) return null;

  return (
    <View style={styles.badge}>
      <Ionicons name="cloud-offline" size={14} color={Colors.light.primaryText} />
      <Text style={styles.badgeText}>Offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    zIndex: 1000,
  },
  text: {
    color: Colors.light.primaryText,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginLeft: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  badgeText: {
    color: Colors.light.primaryText,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginLeft: Spacing.xs,
  },
});
