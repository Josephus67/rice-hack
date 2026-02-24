/**
 * Stat Grid Component
 * Grid layout for displaying multiple stats
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants';

interface StatItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color?: string;
}

interface StatGridProps {
  items: StatItem[];
  columns?: 2 | 3 | 4;
}

export function StatGrid({ items, columns = 2 }: StatGridProps) {
  const itemWidth = `${100 / columns}%` as const;

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View
          key={item.label}
          style={[styles.item, { width: itemWidth }]}
        >
          <Ionicons
            name={item.icon}
            size={22}
            color={item.color ?? Colors.light.primary}
          />
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  value: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    marginTop: Spacing.xs,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});
