import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export const TagChip = ({ tag, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>#{tag}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
});
