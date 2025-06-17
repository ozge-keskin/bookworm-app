import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

const CustomBackButton = ({ onPress, style }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    backButton: {
      width: 40,
      height: 40,
      marginTop: 10,
      borderRadius: 20,
      backgroundColor: theme.cardBackground,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: theme.border,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.backButton, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
    </TouchableOpacity>
  );
};

export default CustomBackButton;
