import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme';

export const Section = ({ title, children, style, action }) => {
  return (
    <View style={[styles.section, style]}>
      {(title || action) && (
        <View style={styles.header}>
          {title && <Text style={[styles.title, theme.typography.title]}>{title}</Text>}
          {action}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: theme.spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  title: {
    color: theme.colors.textPrimary,
  },
});
