import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', // primary, secondary, outlined, ghost
  iconName,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.card;
      case 'outlined': return 'transparent';
      case 'ghost': return 'transparent';
      default: return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textSecondary;
    switch (variant) {
      case 'primary': return theme.colors.textInverse;
      case 'secondary': return theme.colors.textPrimary;
      case 'outlined': return theme.colors.primary;
      case 'ghost': return theme.colors.primary;
      default: return theme.colors.textInverse;
    }
  };

  const getBorder = () => {
    if (variant === 'outlined') {
      return { borderWidth: 1, borderColor: disabled ? theme.colors.border : theme.colors.primary };
    }
    return {};
  };

  const getShadow = () => {
    if (variant === 'primary' && !disabled) {
      return theme.shadows.primaryGlow;
    }
    return {};
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: getBackgroundColor() },
        getBorder(),
        getShadow(),
        style
      ]} 
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.inner}>
          {iconName && (
            <Ionicons 
              name={iconName} 
              size={18} 
              color={getTextColor()} 
              style={title ? { marginRight: theme.spacing[2] } : {}}
            />
          )}
          {title && (
            <Text style={[styles.text, theme.typography.button, { color: getTextColor() }, textStyle]}>
              {title}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
