import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export const ChatInput = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Ask AI about notes...",
  isLoading = false,
  disabled = false,
}) => {
  const isSendDisabled = isLoading || disabled || !value.trim();

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        multiline={true}
        maxLength={500}
      />
      <TouchableOpacity 
        style={[styles.sendButton, isSendDisabled ? styles.disabledButton : {}]} 
        onPress={onSubmit}
        disabled={isSendDisabled}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.textInverse} size="small" />
        ) : (
          <Ionicons name="send" size={16} color={theme.colors.textInverse} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: theme.radius.lg,
    padding: theme.spacing[2],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: theme.spacing[3],
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing[2],
  },
  disabledButton: {
    backgroundColor: theme.colors.surfaceLight,
    opacity: 0.5,
  },
});
