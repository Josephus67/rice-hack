/**
 * Results Screen
 * Displays scan results with quality metrics
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/common';
import {
  GradeIndicator,
  BarChart,
  ProgressBar,
  StatGrid,
} from '@/components/results';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants';
import { useScansStore } from '@/store';
import {
  formatPercentage,
  formatCount,
  formatMm,
  formatRatio,
  formatLabValue,
} from '@/utils/formatters';

export default function ResultsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentScan, recentScans } = useScansStore();

  // Try to find the scan in current or recent scans
  const scan = currentScan?.id === id ? currentScan : null;

  if (!scan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Scan not found</Text>
          <Button title="Go Home" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    );
  }

  const { rawOutput, classifications } = scan;
  const brokenPercent = (rawOutput.broken_count / rawOutput.count) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Grade Indicator */}
        <GradeIndicator
          grade={classifications.millingGrade}
          brokenPercent={brokenPercent}
          size="lg"
          showDetails
        />

        {/* Quick Summary */}
        <Card variant="elevated" style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <StatGrid
            items={[
              { icon: 'layers', label: 'Total Grains', value: rawOutput.count.toString() },
              { icon: 'cut', label: 'Broken', value: formatPercentage(brokenPercent) },
              { icon: 'shapes', label: 'Shape', value: classifications.grainShape.shape },
              { icon: 'resize', label: 'Length Class', value: classifications.lengthClass },
            ]}
            columns={2}
          />
        </Card>

        {/* Warnings */}
        {classifications.warnings.length > 0 && (
          <Card variant="outlined" style={styles.warningsCard}>
            <View style={styles.warningsHeader}>
              <Ionicons name="warning" size={20} color={Colors.light.warning} />
              <Text style={styles.warningsTitle}>Notices</Text>
            </View>
            {classifications.warnings.map((warning, index) => (
              <View key={index} style={styles.warningItem}>
                <View
                  style={[
                    styles.warningDot,
                    {
                      backgroundColor:
                        warning.severity === 'high'
                          ? Colors.light.error
                          : warning.severity === 'medium'
                          ? Colors.light.warning
                          : Colors.light.info,
                    },
                  ]}
                />
                <Text style={styles.warningText}>
                  {warning.message} ({formatPercentage(warning.percentage)})
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Grain Counts */}
        <Card variant="outlined" style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Grain Distribution</Text>
          <BarChart
            data={[
              { label: 'Long', value: rawOutput.long_count, color: Colors.light.success },
              { label: 'Medium', value: rawOutput.medium_count, color: Colors.light.info },
              { label: 'Broken', value: rawOutput.broken_count, color: Colors.light.warning },
            ]}
            maxValue={rawOutput.count}
          />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Count</Text>
            <Text style={styles.totalValue}>{rawOutput.count}</Text>
          </View>
        </Card>

        {/* Color Defects */}
        <Card variant="outlined" style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Color Composition</Text>
          <ProgressBar
            label="Chalky"
            value={(rawOutput.chalky_count / rawOutput.count) * 100}
            thresholds={{ low: 5, medium: 15 }}
          />
          <ProgressBar
            label="Black/Damaged"
            value={(rawOutput.black_count / rawOutput.count) * 100}
            thresholds={{ low: 1, medium: 5 }}
          />
          <ProgressBar
            label="Green (Immature)"
            value={(rawOutput.green_count / rawOutput.count) * 100}
            thresholds={{ low: 2, medium: 8 }}
          />
          <ProgressBar
            label="Red"
            value={(rawOutput.red_count / rawOutput.count) * 100}
            thresholds={{ low: 2, medium: 8 }}
          />
          <ProgressBar
            label="Yellow"
            value={(rawOutput.yellow_count / rawOutput.count) * 100}
            thresholds={{ low: 2, medium: 8 }}
          />
        </Card>


        {/* Kernel Dimensions */}
        <Card variant="outlined" style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Kernel Dimensions</Text>
          <MetricRow label="Avg. Length" value={formatMm(rawOutput.wk_length_avg)} />
          <MetricRow label="Avg. Width" value={formatMm(rawOutput.wk_width_avg)} />
          <MetricRow label="L/W Ratio" value={formatRatio(rawOutput.wk_lw_ratio_avg)} />
        </Card>

        {/* Color Profile */}
        <Card variant="outlined" style={styles.detailCard}>
          <Text style={styles.sectionTitle}>CIELAB Color Profile</Text>
          <MetricRow label="L* (Lightness)" value={formatLabValue(rawOutput.average_l, 'L')} />
          <MetricRow label="a* (Green-Red)" value={formatLabValue(rawOutput.average_a, 'a')} />
          <MetricRow label="b* (Blue-Yellow)" value={formatLabValue(rawOutput.average_b, 'b')} />
        </Card>

        {/* Metadata */}
        <Card variant="filled" style={styles.metaCard}>
          <Text style={styles.metaText}>
            Rice Type: {scan.riceType} | Inference: {scan.inferenceTimeMs}ms
          </Text>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="New Scan"
            onPress={() => router.push('/capture')}
            fullWidth
          />
          <Button
            title="Go Home"
            variant="outline"
            onPress={() => router.replace('/(tabs)')}
            fullWidth
            style={{ marginTop: Spacing.sm }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  notFoundText: {
    fontSize: FontSize.lg,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  totalLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.light.textSecondary,
  },
  totalValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  warningsCard: {
    marginBottom: Spacing.md,
    borderColor: Colors.light.warning,
  },
  warningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  warningsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    marginLeft: Spacing.sm,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  warningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  warningText: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  detailCard: {
    marginBottom: Spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  metricLabel: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
  },
  metricValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.light.text,
  },
  metaCard: {
    marginBottom: Spacing.lg,
  },
  metaText: {
    fontSize: FontSize.sm,
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
  actions: {
    paddingTop: Spacing.md,
  },
});
