/**
 * Welcome/Signup Screen - First screen users see
 */

import { Button, DisclaimerModal } from "@/components/common";
import { Colors, FontSize, FontWeight, Spacing } from "@/constants";
import { useSettingsStore, useUserStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRootNavigationState, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { user, isAuthenticated, isLoading } = useUserStore();
  const { disclaimerAccepted, acceptDisclaimer } = useSettingsStore();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const isSmallScreen = width < 380 || height < 740;

  const handleGetStarted = () => {
    if (isLoading) return;
    if (!disclaimerAccepted) {
      setShowDisclaimer(true);
    } else {
      router.push("/(auth)/profile-setup");
    }
  };

  const handleAcceptDisclaimer = () => {
    acceptDisclaimer();
    setShowDisclaimer(false);
    router.push("/(auth)/profile-setup");
  };

  if (isLoading) {
    return <SafeAreaView style={styles.container} />;
  }

  if (rootNavigationState?.key && isAuthenticated && user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isSmallScreen && styles.scrollContentSmall,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🌾</Text>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
            Rice Quality
          </Text>
          <Text
            style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}
          >
            Analyzer
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem
            icon="camera-outline"
            title="Capture"
            description="Take a photo of your rice sample"
          />
          <FeatureItem
            icon="analytics-outline"
            title="Analyze"
            description="AI analyzes grain quality instantly"
          />
          <FeatureItem
            icon="stats-chart-outline"
            title="Results"
            description="Get detailed quality metrics"
          />
        </View>

        <View style={styles.footer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            fullWidth
            size="lg"
          />
          <Text style={styles.footerText}>Powered by UNIDO & AfricaRice</Text>
        </View>
      </ScrollView>

      <DisclaimerModal
        visible={showDisclaimer}
        onAccept={handleAcceptDisclaimer}
      />
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={24} color={Colors.light.primary} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  logo: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  scrollContentSmall: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.light.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  titleSmall: {
    fontSize: 28,
  },
  subtitleSmall: {
    fontSize: 28,
  },
  features: {
    flex: 1,
    justifyContent: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
  },
  footer: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
  },
  footerText: {
    textAlign: "center",
    marginTop: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.light.textMuted,
  },
});
