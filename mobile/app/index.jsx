import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export default function Index() {
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    // Small delay to ensure proper navigation handling
    const timer = setTimeout(() => {
      // This will be handled by the root layout navigation logic
      // The root layout will redirect to appropriate screen
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
