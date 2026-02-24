/**
 * Accessibility Utilities
 * Sprint 3: S3-010 - Accessibility review and improvements
 */

import { Platform, AccessibilityInfo, Dimensions } from 'react-native';

/**
 * Accessibility labels for common UI elements
 */
export const A11yLabels = {
  // Navigation
  backButton: 'Go back',
  closeButton: 'Close',
  menuButton: 'Open menu',
  
  // Home screen
  newScanButton: 'Start a new rice quality scan',
  viewHistoryButton: 'View scan history',
  recentScanCard: (grade: string, date: string) => 
    `Scan from ${date}, grade ${grade}. Tap to view details.`,
  
  // Camera
  captureButton: 'Take photo of rice sample',
  switchCameraButton: 'Switch camera',
  flashButton: (isOn: boolean) => `Flash ${isOn ? 'on' : 'off'}. Tap to toggle.`,
  galleryButton: 'Choose photo from gallery',
  
  // Results
  gradeIndicator: (grade: string, percentage: string) =>
    `Quality grade: ${grade}. ${percentage} percent broken grains.`,
  warningItem: (message: string, severity: string) =>
    `${severity} severity warning: ${message}`,
  exportButton: 'Export scan results',
  shareButton: 'Share results',
  
  // History
  scanItem: (riceType: string, date: string, grade: string) =>
    `${riceType} scan from ${date}. Grade ${grade}. Double tap to view.`,
  deleteAction: 'Delete this scan',
};

/**
 * Accessibility roles for semantic meaning
 */
export const A11yRoles = {
  button: 'button' as const,
  link: 'link' as const,
  header: 'header' as const,
  alert: 'alert' as const,
  image: 'image' as const,
  progressbar: 'progressbar' as const,
  summary: 'summary' as const,
};

/**
 * Minimum touch target size per platform guidelines
 */
export const MinTouchTarget = {
  // iOS: 44x44, Android: 48x48
  size: Platform.OS === 'ios' ? 44 : 48,
  hitSlop: {
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
  },
};

/**
 * Font scaling for accessibility
 */
export function getScaledFontSize(
  baseSize: number, 
  options: { maxScale?: number; minScale?: number } = {}
): number {
  const { maxScale = 1.5, minScale = 0.8 } = options;
  const { fontScale } = Dimensions.get('window');
  const clampedScale = Math.max(minScale, Math.min(maxScale, fontScale));
  return Math.round(baseSize * clampedScale);
}

/**
 * Announce message to screen readers
 */
export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Check if screen reader is enabled
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  return AccessibilityInfo.isScreenReaderEnabled();
}

/**
 * Check if reduce motion is enabled
 */
export async function isReduceMotionEnabled(): Promise<boolean> {
  return AccessibilityInfo.isReduceMotionEnabled();
}

/**
 * Create accessible props for grade indicators
 */
export function getGradeAccessibilityProps(
  grade: string,
  brokenPercent: number
) {
  return {
    accessible: true,
    accessibilityRole: 'text' as const,
    accessibilityLabel: A11yLabels.gradeIndicator(
      grade,
      brokenPercent.toFixed(1)
    ),
    accessibilityHint: 'Shows the milling quality grade based on broken grain percentage',
  };
}

/**
 * Create accessible props for interactive cards
 */
export function getCardAccessibilityProps(
  label: string,
  hint?: string
) {
  return {
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityLabel: label,
    accessibilityHint: hint || 'Double tap to view details',
  };
}

/**
 * Contrast ratio utilities for WCAG compliance
 */
export const ContrastRatios = {
  // WCAG AA requirements
  largeText: 3, // 18pt+ or 14pt bold
  normalText: 4.5,
  // WCAG AAA requirements
  enhancedLargeText: 4.5,
  enhancedNormalText: 7,
};

/**
 * High contrast color alternatives
 */
export const HighContrastColors = {
  // Grade colors with improved contrast
  premium: '#1B5E20',    // Darker green
  grade1: '#33691E',     // Darker light green
  grade2: '#F57F17',     // Darker amber
  grade3: '#E65100',     // Darker orange
  belowGrade: '#B71C1C', // Darker red
  
  // Status colors
  success: '#1B5E20',
  warning: '#E65100',
  error: '#B71C1C',
  info: '#01579B',
};
