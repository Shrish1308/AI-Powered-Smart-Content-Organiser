import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export const CategoryBadge = ({ category, style }) => {
  return (
    <Text style={[styles.badge, style]}>{category || 'General'}</Text>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    color: theme.colors.secondary,
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
});
