import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export const TextInputBase = ({
  label,
  iconName,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, theme.typography.label]}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        {iconName && (
          <Ionicons 
            name={iconName} 
            size={18} 
            color={error ? theme.colors.error : theme.colors.iconSecondary} 
            style={styles.icon} 
          />
        )}
        <TextInput
          style={[styles.input, theme.typography.body, style]}
          placeholderTextColor={theme.colors.textTertiary}
          {...props}
        />
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
          <Text style={[styles.errorText, theme.typography.caption]}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },
  label: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing[2],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderGlass,
    paddingHorizontal: theme.spacing[3],
    minHeight: 48,
  },
  inputWrapperError: {
    borderColor: theme.colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  icon: {
    marginRight: theme.spacing[2],
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    color: theme.colors.textPrimary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing[1],
  },
  errorText: {
    color: theme.colors.error,
    marginLeft: theme.spacing[1],
  },
});
