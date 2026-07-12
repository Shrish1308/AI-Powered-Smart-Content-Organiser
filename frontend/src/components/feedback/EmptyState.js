import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export const EmptyState = ({ iconName = 'folder-open-outline', message, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={iconName} size={48} color={theme.colors.textTertiary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[6],
    marginTop: theme.spacing[8],
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: theme.spacing[4],
    lineHeight: 20,
  },
});
