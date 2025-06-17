import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

export default function SafeScreen({ children }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
  });
  
  return <View style={[styles.container, { paddingTop: 0 }]}>{children}</View>;
}