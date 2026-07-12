import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export const Header = ({ title, subtitle, rightElement, leftIcon, onLeftPress, style }) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.leftContainer}>
        {leftIcon && (
          <TouchableOpacity onPress={onLeftPress} style={styles.leftButton}>
            <Ionicons name={leftIcon} size={24} color={theme.colors.iconPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          {title && <Text style={[styles.title, theme.typography.headline]}>{title}</Text>}
          {subtitle && <Text style={[styles.subtitle, theme.typography.caption]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.rightContainer}>
        {rightElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftButton: {
    marginRight: theme.spacing[3],
  },
  titleContainer: {
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing[1],
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
});
