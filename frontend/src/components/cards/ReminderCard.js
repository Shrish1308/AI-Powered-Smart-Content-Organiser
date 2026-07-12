import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from './Card';
import { CategoryBadge } from '../data/CategoryBadge';

export const ReminderCard = ({ item, onComplete, variant = 'default' }) => {
  const isCompleted = item.status === 'completed';

  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.contentWrapper}>
          <Text style={styles.compactMessage}>{item.message}</Text>
          <Text style={styles.compactDate}>Alert scheduled: {item.reminder_date}</Text>
        </View>
        {!isCompleted && (
          <TouchableOpacity onPress={() => onComplete(item.id)} style={styles.actionButton}>
            <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.success} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Default Variant
  return (
    <Card variant="flat" style={[styles.card, isCompleted ? styles.completedCard : {}]}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <CategoryBadge 
            category={item.note_category || 'Alert'} 
            style={styles.alertBadge} 
          />
          <Text style={styles.date}>Alert Date: {item.reminder_date}</Text>
        </View>
        <Text style={[styles.message, isCompleted ? styles.completedMessage : {}]}>
          {item.message}
        </Text>
      </View>
      {!isCompleted ? (
        <TouchableOpacity onPress={() => onComplete(item.id)} style={styles.actionButton}>
          <Ionicons name="checkbox-outline" size={24} color={theme.colors.success} />
        </TouchableOpacity>
      ) : (
        <View style={styles.actionButton}>
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.textTertiary} />
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
    padding: theme.spacing[4],
  },
  completedCard: {
    opacity: 0.6,
  },
  contentWrapper: {
    flex: 1,
    marginRight: theme.spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  alertBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: theme.colors.warning,
  },
  date: {
    color: theme.colors.textTertiary,
    fontSize: 11,
  },
  message: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  completedMessage: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  compactMessage: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  compactDate: {
    color: theme.colors.textTertiary,
    fontSize: 11,
    marginTop: 4,
  },
});
