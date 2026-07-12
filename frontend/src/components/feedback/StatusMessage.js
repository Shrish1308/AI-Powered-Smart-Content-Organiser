import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export const StatusMessage = ({ type = 'info', message, style }) => {
  if (!message) return null;

  const getStyle = () => {
    switch (type) {
      case 'error': return styles.errorBox;
      case 'success': return styles.successBox;
      case 'warning': return styles.warningBox;
      default: return styles.infoBox;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error': return theme.colors.error;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      default: return theme.colors.info;
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'error': return 'alert-circle';
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  return (
    <View style={[styles.box, getStyle(), style]}>
      <Ionicons name={getIconName()} size={16} color={getIconColor()} style={styles.icon} />
      <Text style={[styles.text, theme.typography.caption, { color: getIconColor() }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[3],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginTop: theme.spacing[3],
  },
  icon: {
    marginRight: theme.spacing[2],
  },
  text: {
    flex: 1,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  warningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  infoBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
});
