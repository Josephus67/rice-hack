/**
 * Capture Route Layout
 */

import { Stack } from "expo-router";

export default function CaptureLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="preview"
        options={{
          headerShown: false,
          title: "Review Photo",
          // headerStyle: {
          //   backgroundColor: Colors.light.background,
          // },
          // headerTintColor: Colors.light.text,
        }}
      />
    </Stack>
  );
}
