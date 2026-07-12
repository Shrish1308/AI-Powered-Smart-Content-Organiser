import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export const Card = ({ children, style, variant = 'glass' }) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: theme.colors.cardGlass,
          borderWidth: 1,
          borderColor: theme.colors.borderGlass,
          ...theme.shadows.medium,
        };
      case 'solid':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          ...theme.shadows.light,
        };
      case 'flat':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      default:
        return {};
    }
  };

  return (
    <View style={[styles.card, getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
});
