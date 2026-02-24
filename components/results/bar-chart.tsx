/**
 * Bar Chart Component
 * Simple horizontal bar chart for grain counts
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants';

interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartItem[];
  maxValue?: number;
  showValues?: boolean;
  height?: number;
}

const DEFAULT_COLORS = [
  Colors.light.primary,
  Colors.light.secondary,
  Colors.light.info,
  Colors.light.success,
  Colors.light.warning,
  Colors.light.error,
];

export function BarChart({
  data,
  maxValue,
  showValues = true,
  height = 20,
}: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        const percentage = (item.value / max) * 100;
        const color = item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];

        return (
          <View key={item.label} style={styles.row}>
            <View style={styles.labelContainer}>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.track, { height }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${Math.max(percentage, 2)}%`,
                      backgroundColor: color,
                      height,
                    },
                  ]}
                />
              </View>
              {showValues && (
                <Text style={styles.value}>{Math.round(item.value)}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  labelContainer: {
    width: 80,
    paddingRight: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    backgroundColor: Colors.light.gray200,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  bar: {
    borderRadius: BorderRadius.sm,
  },
  value: {
    width: 40,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.light.text,
    textAlign: 'right',
    marginLeft: Spacing.sm,
  },
});
