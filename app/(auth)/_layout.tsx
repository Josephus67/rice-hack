/**
 * Auth Flow Layout
 */

import { Stack } from 'expo-router';
import { Colors } from '@/constants/design-system';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.light.background,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="profile-setup" />
    </Stack>
  );
}
