/**
 * Metric Card Component
 * Individual metric display with icon and optional trend
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants';

interface MetricCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtext?: string;
}

export function MetricCard({
  icon,
  label,
  value,
  unit,
  color = Colors.light.primary,
  trend,
  subtext,
}: MetricCardProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
        {trend && trend !== 'neutral' && (
          <Ionicons
            name={trend === 'up' ? 'arrow-up' : 'arrow-down'}
            size={14}
            color={trend === 'up' ? Colors.light.success : Colors.light.error}
            style={styles.trendIcon}
          />
        )}
      </View>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    minWidth: 100,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  unit: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginLeft: 2,
  },
  trendIcon: {
    marginLeft: Spacing.xs,
  },
  subtext: {
    fontSize: FontSize.xs,
    color: Colors.light.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
