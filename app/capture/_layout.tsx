/**
 * Capture Route Layout
 */

import { Stack } from 'expo-router';
import { Colors } from '@/constants';

export default function CaptureLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="preview"
        options={{
          headerShown: true,
          title: 'Review Photo',
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerTintColor: Colors.light.text,
        }}
      />
    </Stack>
  );
}
