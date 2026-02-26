import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import {
  ErrorBoundary,
  OfflineIndicator,
  ToastProvider,
} from "@/components/common";
import { Colors } from "@/constants/design-system";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  useEffect(() => {
    // Hide splash screen after layout is ready
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const configureNavigationBar = async () => {
      try {
        await NavigationBar.setVisibilityAsync("visible");
        await NavigationBar.setButtonStyleAsync(
          colorScheme === "dark" ? "light" : "dark",
        );
      } catch (error) {
        console.warn("Failed to configure Android navigation bar:", error);
      }
    };

    configureNavigationBar();
  }, [colorScheme, colors.background]);

  // Custom theme with our design system colors
  const theme =
    colorScheme === "dark"
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            primary: colors.primary,
            background: colors.background,
            card: colors.card,
            text: colors.text,
            border: colors.border,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: colors.primary,
            background: colors.background,
            card: colors.card,
            text: colors.text,
            border: colors.border,
          },
        };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ToastProvider>
          <ThemeProvider value={theme}>
            <OfflineIndicator />
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="capture" options={{ headerShown: false }} />
              <Stack.Screen name="results" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Info" }}
              />
            </Stack>
            <StatusBar
              style={colorScheme === "dark" ? "light" : "dark"}
              backgroundColor={colors.background}
              translucent={false}
            />
          </ThemeProvider>
        </ToastProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
