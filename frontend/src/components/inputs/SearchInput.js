import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export const SearchInput = ({
  value,
  onChangeText,
  onSubmitEditing,
  placeholder = 'Search...',
  searching = false,
  style,
  inputStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
      />
      <TouchableOpacity 
        style={styles.searchButton} 
        onPress={onSubmitEditing} 
        disabled={searching}
      >
        {searching ? (
          <ActivityIndicator color={theme.colors.textInverse} size="small" />
        ) : (
          <Ionicons name="search" size={20} color={theme.colors.textInverse} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: theme.spacing[4],
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderTopLeftRadius: theme.radius.md,
    borderBottomLeftRadius: theme.radius.md,
    padding: theme.spacing[3],
    color: theme.colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRightWidth: 0,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    borderTopRightRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
