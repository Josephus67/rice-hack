/**
 * History Tab - List of past scans with pagination and swipe-to-delete
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, SwipeableRow } from '@/components/common';
import { GradeIndicator } from '@/components/results';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants';
import { useScans } from '@/hooks/use-scans';
import { formatDate, formatPercentage } from '@/utils/formatters';
import type { ScanSummary } from '@/types';

export default function HistoryScreen() {
  const router = useRouter();
  const {
    scans,
    isLoading,
    isRefreshing,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    deleteScan,
  } = useScans();

  const handleDelete = useCallback(async (id: string) => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScan(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete scan');
            }
          },
        },
      ]
    );
  }, [deleteScan]);

  const renderScanItem = useCallback(({ item }: { item: ScanSummary }) => (
    <SwipeableRow onDelete={() => handleDelete(item.id)}>
      <Card variant="elevated" style={styles.scanCard}>
        <View style={styles.scanHeader}>
          <View
            style={[
              styles.gradeBadge,
              { backgroundColor: getGradeColor(item.gradeCode) },
            ]}
          >
            <Text style={styles.gradeText}>{item.gradeCode}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.riceType}>{item.riceType}</Text>
            <Text style={styles.date}>{formatDate(new Date(item.capturedAt))}</Text>
          </View>
        </View>
        <View style={styles.scanStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.totalCount}</Text>
            <Text style={styles.statLabel}>Grains</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatPercentage(item.brokenPercent)}</Text>
            <Text style={styles.statLabel}>Broken</Text>
          </View>
        </View>
        <Button
          title="View Details"
          variant="ghost"
          size="sm"
          onPress={() => router.push(`/results/${item.id}`)}
        />
      </Card>
    </SwipeableRow>
  ), [handleDelete, router]);

  const ListFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        {isLoading && <ActivityIndicator color={Colors.light.primary} />}
      </View>
    );
  };

  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Scan History</Text>
      <Text style={styles.headerSubtitle}>
        {totalCount} {totalCount === 1 ? 'scan' : 'scans'}
      </Text>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>No Scans Yet</Text>
      <Text style={styles.emptyDescription}>
        Start by capturing a rice sample from the Home screen
      </Text>
      <Button
        title="Start Scanning"
        onPress={() => router.push('/capture')}
        style={{ marginTop: Spacing.lg }}
      />
    </View>
  );

  if (isLoading && scans.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading scans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scans.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={scans}
          renderItem={renderScanItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={[Colors.light.primary]}
              tintColor={Colors.light.primary}
            />
          }
        />
      )}
    </View>
  );
}

function getGradeColor(code: string): string {
  switch (code) {
    case 'P':
      return Colors.light.premium;
    case '1':
      return Colors.light.grade1;
    case '2':
      return Colors.light.grade2;
    case '3':
      return Colors.light.grade3;
    default:
      return Colors.light.belowGrade;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    padding: Spacing.md,
  },
  scanCard: {
    marginBottom: Spacing.md,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  gradeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  gradeText: {
    color: Colors.light.primaryText,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
  },
  riceType: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    flex: 1,
  },
  date: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
  },
  scanStats: {
    flexDirection: 'row',
    marginVertical: Spacing.sm,
  },
  stat: {
    marginRight: Spacing.xl,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
  },
  header: {
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  headerInfo: {
    flex: 1,
  },
  footer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
