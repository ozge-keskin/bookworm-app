import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const CustomButton = ({ title, onPress, style, textStyle, disabled = false, icon, iconOnly = false, isLoading = false }) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    button: {
      backgroundColor: theme.primary,
      paddingVertical: 10,
      paddingHorizontal: 32,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonText: {
      color: theme.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    disabled: {
      opacity: 0.6,
    },
    iconButton: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      minHeight: 44,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.disabled, iconOnly && styles.iconButton]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.white} />
      ) : iconOnly && icon ? (
        <Ionicons name={icon} size={20} color={theme.white} />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
