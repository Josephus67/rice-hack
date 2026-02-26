/**
 * Results Route Layout
 */

import { Stack } from 'expo-router';

export default function ResultsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
