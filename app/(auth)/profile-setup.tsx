/**
 * Profile Setup Screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Select, Card } from '@/components/common';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '@/constants';
import { useUserStore } from '@/store';
import { generateUUID } from '@/utils/uuid';
import type { UserRole } from '@/types';

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Rice Buyer', value: 'Buyer' },
  { label: 'Rice Miller', value: 'Miller' },
  { label: 'Rice Trader', value: 'Trader' },
  { label: 'Quality Assessor', value: 'Quality Assessor' },
  { label: 'Other', value: 'Other' },
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { setUser } = useUserStore();

  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [organization, setOrganization] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = 'Name is required';
    } else if (username.trim().length < 2) {
      newErrors.username = 'Name must be at least 2 characters';
    }

    if (!role) {
      newErrors.role = 'Please select your role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const now = new Date();
    const user = {
      id: generateUUID(),
      username: username.trim(),
      role: role!,
      organization: organization.trim() || undefined,
      locationOptIn: false,
      disclaimerAcceptedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    setUser(user);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.heroIconBadge}>
              <Ionicons name="person-circle-outline" size={42} color={Colors.light.primary} />
            </View>
            <Text style={styles.kicker}>Welcome</Text>
            <Text style={styles.title}>Set Up Your Profile</Text>
            <Text style={styles.subtitle}>
              This helps us personalize your experience
            </Text>
          </View>

          <Card variant="elevated" style={styles.form}>
            <Input
              label="Your Name"
              placeholder="Enter your name"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Select
              label="Your Role"
              placeholder="Select your role"
              value={role}
              options={ROLE_OPTIONS}
              onChange={setRole}
              error={errors.role}
            />

            <Input
              label="Organization (Optional)"
              placeholder="Company or organization name"
              value={organization}
              onChangeText={setOrganization}
              autoCapitalize="words"
            />
          </Card>

          <View style={styles.footer}>
            <Button
              title="Continue"
              onPress={handleSubmit}
              fullWidth
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  heroIconBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 2,
    borderColor: '#DCECD6',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  kicker: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.light.primary,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  form: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: Spacing.lg,
  },
});
