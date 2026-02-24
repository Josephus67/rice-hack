/**
 * Grade Indicator Component
 * Visual display of milling grade with animated badge
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants';
import type { MillingGrade } from '@/types';

interface GradeIndicatorProps {
  grade: MillingGrade;
  brokenPercent: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const GRADE_CONFIG = {
  P: { icon: 'star', emoji: '⭐', label: 'Premium Quality' },
  '1': { icon: 'checkmark-circle', emoji: '🥇', label: 'Grade 1 - Excellent' },
  '2': { icon: 'checkmark', emoji: '🥈', label: 'Grade 2 - Good' },
  '3': { icon: 'alert-circle', emoji: '🥉', label: 'Grade 3 - Acceptable' },
  'BG': { icon: 'warning', emoji: '⚠️', label: 'Below Grade' },
} as const;

export function GradeIndicator({
  grade,
  brokenPercent,
  size = 'lg',
  showDetails = true,
}: GradeIndicatorProps) {
  const config = GRADE_CONFIG[grade.code as keyof typeof GRADE_CONFIG] ?? GRADE_CONFIG['BG'];
  const sizeStyles = getSizeStyles(size);

  return (
    <View style={[styles.container, { backgroundColor: grade.color }, sizeStyles.container]}>
      {/* Badge */}
      <View style={[styles.badge, sizeStyles.badge]}>
        <Text style={[styles.emoji, sizeStyles.emoji]}>{config.emoji}</Text>
      </View>

      {/* Grade Text */}
      <Text style={[styles.gradeText, sizeStyles.gradeText]}>{grade.grade}</Text>

      {showDetails && (
        <>
          <Text style={[styles.label, sizeStyles.label]}>{config.label}</Text>
          
          {/* Broken Percentage Indicator */}
          <View style={styles.percentContainer}>
            <View style={styles.percentBar}>
              <View
                style={[
                  styles.percentFill,
                  { width: `${Math.min(brokenPercent, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.percentText}>
              {brokenPercent.toFixed(1)}% Broken
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

function getSizeStyles(size: 'sm' | 'md' | 'lg') {
  switch (size) {
    case 'sm':
      return {
        container: { padding: Spacing.sm, borderRadius: BorderRadius.md },
        badge: { width: 32, height: 32 },
        emoji: { fontSize: 20 },
        gradeText: { fontSize: FontSize.md },
        label: { fontSize: FontSize.xs },
      };
    case 'md':
      return {
        container: { padding: Spacing.md, borderRadius: BorderRadius.lg },
        badge: { width: 48, height: 48 },
        emoji: { fontSize: 32 },
        gradeText: { fontSize: FontSize.xl },
        label: { fontSize: FontSize.sm },
      };
    case 'lg':
    default:
      return {
        container: { padding: Spacing.xl, borderRadius: BorderRadius.lg },
        badge: { width: 64, height: 64 },
        emoji: { fontSize: 48 },
        gradeText: { fontSize: FontSize.xxl },
        label: { fontSize: FontSize.md },
      };
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
    marginBottom: Spacing.sm,
  },
  emoji: {
    textAlign: 'center',
  },
  gradeText: {
    fontWeight: FontWeight.bold,
    color: Colors.light.primaryText,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: Spacing.xs,
  },
  percentContainer: {
    width: '80%',
    marginTop: Spacing.md,
  },
  percentBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  percentFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 3,
  },
  percentText: {
    fontSize: FontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
