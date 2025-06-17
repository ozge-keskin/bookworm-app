import { Stack, useSegments, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

export default function RootLayout() {
  const { checkAuth, isHydrated, hasCompletedOnboarding, user } =
    useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    checkAuth();
    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isHydrated || !isMounted) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inOnboarding = segments[0] === "onboarding";
    const inRoot = segments.length === 0 || segments[0] === "index";

    console.log("Navigation Debug:", {
      segments,
      inAuthGroup,
      inTabsGroup,
      inOnboarding,
      inRoot,
      hasCompletedOnboarding,
      user: !!user,
      isHydrated,
    });

    // First priority: If haven't completed onboarding, go to onboarding
    if (!hasCompletedOnboarding) {
      if (!inOnboarding) {
        console.log("Redirecting to onboarding - not completed");
        setTimeout(() => router.replace("/onboarding"), 50);
      }
      return;
    }

    // After onboarding is completed, handle navigation based on auth status
    if (hasCompletedOnboarding) {
      if (user) {
        // User is authenticated
        if (inRoot || inAuthGroup) {
          console.log("Redirecting to tabs - user authenticated");
          setTimeout(() => router.replace("/(tabs)"), 50);
          return;
        }
      } else {
        // User is not authenticated
        if (inRoot || inTabsGroup) {
          console.log("Redirecting to auth - user not authenticated");
          setTimeout(() => router.replace("/(auth)"), 50);
          return;
        }
      }
    }
  }, [user, hasCompletedOnboarding, isHydrated, segments, isMounted]);

  if (!isHydrated || !isMounted) {
    return null;
  }

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { isLoading: themeLoading } = useTheme();

  // Wait for theme to load before rendering the app
  if (themeLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </SafeScreen>
      <ThemedStatusBar />
    </SafeAreaProvider>
  );
}

function ThemedStatusBar() {
  const { isDarkMode } = useTheme();
  return <StatusBar style={isDarkMode ? "light" : "dark"} />;
}
