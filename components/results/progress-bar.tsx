/**
 * Progress Bar Component
 * Horizontal bar showing percentage with color coding
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants';

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  showPercentage?: boolean;
  height?: number;
  thresholds?: {
    low: number;
    medium: number;
  };
}

export function ProgressBar({
  label,
  value,
  maxValue = 100,
  color,
  showPercentage = true,
  height = 8,
  thresholds,
}: ProgressBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  // Determine color based on thresholds if not provided
  const barColor = color ?? getThresholdColor(percentage, thresholds);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {showPercentage && (
          <Text style={styles.value}>{percentage.toFixed(1)}%</Text>
        )}
      </View>
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: barColor,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
}

function getThresholdColor(
  percentage: number,
  thresholds?: { low: number; medium: number }
): string {
  const { low = 5, medium = 15 } = thresholds ?? {};
  
  if (percentage <= low) {
    return Colors.light.success;
  }
  if (percentage <= medium) {
    return Colors.light.warning;
  }
  return Colors.light.error;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
  },
  value: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
  },
  track: {
    backgroundColor: Colors.light.gray200,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.sm,
  },
});
