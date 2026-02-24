/**
 * Animation Utilities
 * Sprint 3: S3-007 - UI animations for polish
 */

import { Easing } from 'react-native-reanimated';

/**
 * Standard animation configurations for consistent UX
 */
export const AnimationConfig = {
  // Fast feedback animations (buttons, toggles)
  fast: {
    duration: 150,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  
  // Standard transitions (modals, sheets)
  standard: {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  
  // Slow, emphasizing animations (success states)
  slow: {
    duration: 500,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  
  // Spring configuration for natural feel
  spring: {
    damping: 20,
    stiffness: 200,
    mass: 0.8,
  },
  
  // Bouncy spring for emphasis
  bouncy: {
    damping: 12,
    stiffness: 180,
    mass: 0.6,
  },
};

/**
 * Shared layout transition config
 */
export const LayoutTransition = {
  entering: {
    duration: 300,
    type: 'timing',
    easing: Easing.out(Easing.cubic),
  },
  exiting: {
    duration: 200,
    type: 'timing',
    easing: Easing.in(Easing.cubic),
  },
};

/**
 * Staggered animation delays for lists
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  // Cap the delay to avoid long waits for large lists
  const maxIndex = 10;
  const effectiveIndex = Math.min(index, maxIndex);
  return effectiveIndex * baseDelay;
}

/**
 * Common animated values for reuse
 */
export const SharedAnimatedValues = {
  // Scale for press feedback
  pressScale: {
    pressed: 0.97,
    default: 1,
  },
  
  // Opacity for disabled states
  disabledOpacity: 0.5,
  
  // Scale for grade indicator pulse
  pulseScale: {
    min: 1,
    max: 1.05,
  },
};

/**
 * Loading animation keyframes
 */
export const LoadingAnimationConfig = {
  dots: {
    duration: 1200,
    delay: 200, // Between dots
  },
  spinner: {
    duration: 1000,
  },
  shimmer: {
    duration: 1500,
    delay: 100,
  },
};

/**
 * Result reveal animation sequence
 */
export const ResultRevealConfig = {
  gradeDelay: 0,
  gradeDuration: 400,
  statsDelay: 200,
  statsDuration: 300,
  chartsDelay: 400,
  chartsDuration: 500,
  warningsDelay: 600,
  warningsDuration: 300,
};
