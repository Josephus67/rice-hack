/**
 * Home Screen - Main dashboard
 */

import { Card } from "@/components/common";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadows,
  Spacing,
} from "@/constants";
import { useScansStore, useUserStore } from "@/store";
import type { ScanSummary } from "@/types";
import { formatDate } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { recentScans } = useScansStore();

  const handleNewScan = () => {
    router.push("/capture");
  };

  const handleViewScan = (id: string) => {
    router.push(`/results/${id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Welcome{user?.username ? `, ${user.username}` : ""}!
        </Text>
        <Text style={styles.subtitleText}>Analyze rice quality with AI</Text>
      </View>

      {/* New Scan Button */}
      <TouchableOpacity
        style={styles.newScanButton}
        onPress={handleNewScan}
        activeOpacity={0.8}
      >
        <View style={styles.newScanIcon}>
          <Ionicons name="camera" size={32} color={Colors.light.primaryText} />
        </View>
        <View style={styles.newScanTextContainer}>
          <Text style={styles.newScanTitle}>New Scan</Text>
          <Text style={styles.newScanSubtitle}>
            Capture and analyze a rice sample
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={Colors.light.primaryText}
        />
      </TouchableOpacity>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card variant="outlined" style={styles.statCard}>
          <Text style={styles.statValue}>{recentScans.length}</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </Card>
        <Card variant="outlined" style={styles.statCard}>
          <Text style={styles.statValue}>
            {
              recentScans.filter(
                (s) => s.gradeCode === "P" || s.gradeCode === "1",
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>Premium/Grade 1</Text>
        </Card>
      </View>

      {/* Recent Scans */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {recentScans.length > 0 && (
            <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentScans.length === 0 ? (
          <Card variant="filled" style={styles.emptyCard}>
            <Ionicons
              name="stats-chart"
              size={FontSize.xxxl * 2}
              color={Colors.primary}
            />
            <Text style={styles.emptyText}>No scans yet</Text>
            <Text style={styles.emptySubtext}>
              Tap &quot;New Scan&quot; to analyze your first rice sample
            </Text>
          </Card>
        ) : (
          recentScans
            .slice(0, 3)
            .map((scan) => (
              <RecentScanCard
                key={scan.id}
                scan={scan}
                onPress={() => handleViewScan(scan.id)}
              />
            ))
        )}
      </View>

      {/* Tips Section */}
      <Card variant="outlined" style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb" size={20} color={Colors.light.warning} />
          <Text style={styles.tipsTitle}>Tip for Best Results</Text>
        </View>
        <Text style={styles.tipsText}>
          Use a blue background and ensure grains are spread evenly without
          overlapping for most accurate analysis.
        </Text>
      </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function RecentScanCard({
  scan,
  onPress,
}: {
  scan: ScanSummary;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" style={styles.scanCard}>
        <View style={styles.scanCardContent}>
          <View
            style={[
              styles.gradeBadge,
              { backgroundColor: getGradeColor(scan.gradeCode) },
            ]}
          >
            <Text style={styles.gradeText}>{scan.gradeCode}</Text>
          </View>
          <View style={styles.scanInfo}>
            <Text style={styles.scanType}>{scan.riceType} Rice</Text>
            <Text style={styles.scanDate}>
              {formatDate(new Date(scan.capturedAt))}
            </Text>
          </View>
          <View style={styles.scanStats}>
            <Text style={styles.scanStatValue}>{scan.totalCount}</Text>
            <Text style={styles.scanStatLabel}>grains</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.light.textMuted}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function getGradeColor(code: string): string {
  switch (code) {
    case "P":
      return Colors.light.premium;
    case "1":
      return Colors.light.grade1;
    case "2":
      return Colors.light.grade2;
    case "3":
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
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  welcomeSection: {
    marginBottom: Spacing.lg,
  },
  welcomeText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  subtitleText: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  newScanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  newScanIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  newScanTextContainer: {
    flex: 1,
  },
  newScanTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.light.primaryText,
  },
  newScanSubtitle: {
    fontSize: FontSize.sm,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  recentSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
  },
  viewAllText: {
    fontSize: FontSize.sm,
    color: Colors.light.primary,
    fontWeight: FontWeight.medium,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  scanCard: {
    marginBottom: Spacing.sm,
  },
  scanCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  gradeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  gradeText: {
    color: Colors.light.primaryText,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
  scanInfo: {
    flex: 1,
  },
  scanType: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
  },
  scanDate: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  scanStats: {
    alignItems: "flex-end",
    marginRight: Spacing.sm,
  },
  scanStatValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  scanStatLabel: {
    fontSize: FontSize.xs,
    color: Colors.light.textSecondary,
  },
  tipsCard: {
    marginTop: Spacing.md,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  tipsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    marginLeft: Spacing.sm,
  },
  tipsText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.light.textSecondary,
  },
});
