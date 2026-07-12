import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export const Divider = ({ style }) => {
  return <View style={[styles.divider, style]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderGlass,
    marginVertical: theme.spacing[4],
  },
});
