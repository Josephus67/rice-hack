/**
 * Results Route Layout
 */

import { Stack } from 'expo-router';
import { Colors } from '@/constants';

export default function ResultsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerTintColor: Colors.light.text,
        animation: 'slide_from_right',
      }}
    />
  );
}
