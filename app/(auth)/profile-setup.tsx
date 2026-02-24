/**
 * Profile Setup Screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, Select, Card } from '@/components/common';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants';
import { useUserStore } from '@/store';
import { generateUUID } from '@/utils/uuid';
import type { UserRole, CreateUserInput } from '@/types';

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.title}>Set Up Your Profile</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your experience
          </Text>
        </View>

        <Card variant="filled" style={styles.form}>
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
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.xl,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: Spacing.xl,
  },
});
