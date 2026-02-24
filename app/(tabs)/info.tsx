/**
 * Info Tab - App information and settings
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { Card } from '@/components/common';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants';
import { APP_VERSION, MODEL_VERSION } from '@/constants/app';

export default function InfoScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>🌾</Text>
        <Text style={styles.appName}>Rice Quality Analyzer</Text>
        <Text style={styles.tagline}>AI-Powered Field Assessment</Text>
      </View>

      <Card variant="outlined" style={styles.card}>
        <Text style={styles.sectionTitle}>Version Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>{APP_VERSION}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Model Version</Text>
          <Text style={styles.infoValue}>{MODEL_VERSION}</Text>
        </View>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          This application provides field-level rice quality assessment using
          AI-powered image analysis. It is designed for use by rice value-chain
          actors in Ghana and across Africa.
        </Text>
        <Text style={styles.description}>
          The AI model analyzes rice samples to detect grain count, broken
          grains, chalky grains, color defects, and kernel dimensions.
        </Text>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <Text style={styles.sectionTitle}>Organizations</Text>
        <View style={styles.orgRow}>
          <Text style={styles.orgIcon}>🏛️</Text>
          <Text style={styles.orgName}>UNIDO</Text>
        </View>
        <View style={styles.orgRow}>
          <Text style={styles.orgIcon}>🌾</Text>
          <Text style={styles.orgName}>AfricaRice</Text>
        </View>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <Text style={styles.sectionTitle}>Disclaimer</Text>
        <Text style={styles.disclaimer}>
          This tool provides INDICATIVE assessment only and does NOT replace
          laboratory analysis or food safety certification. Results should be
          used for preliminary assessment purposes only.
        </Text>
      </Card>

      <Text style={styles.copyright}>
        © 2025 UNIDO AfricaRice Challenge
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: Spacing.sm,
  },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
  },
  card: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  infoLabel: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
  },
  infoValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.light.text,
  },
  description: {
    fontSize: FontSize.md,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  orgIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  orgName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.light.text,
  },
  disclaimer: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.light.warning,
    fontStyle: 'italic',
  },
  copyright: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.light.textMuted,
    marginVertical: Spacing.xl,
  },
});
