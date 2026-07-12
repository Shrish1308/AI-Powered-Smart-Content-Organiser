import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Card } from './Card';
import { CategoryBadge } from '../data/CategoryBadge';
import { TagChip } from '../data/TagChip';

export const MemoryCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card variant="flat" style={styles.card}>
        <View style={styles.header}>
          <CategoryBadge category={item.category} />
          {item.similarity !== undefined ? (
            <View style={styles.similarityBadge}>
              <Ionicons name="analytics" size={12} color={theme.colors.success} style={{ marginRight: 4 }} />
              <Text style={styles.similarityText}>
                {Math.round(item.similarity * 100)}% match
              </Text>
            </View>
          ) : (
            <Text style={styles.dateText}>
              {item.created_at ? item.created_at.split(' ')[0] : 'Today'}
            </Text>
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.content}</Text>
        {item.summary ? (
          <Text style={styles.summaryText} numberOfLines={2}>{item.summary}</Text>
        ) : null}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map(tag => (
              <TagChip key={tag} tag={tag} />
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing[3],
    padding: theme.spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  similarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  similarityText: {
    color: theme.colors.success,
    fontSize: 10,
    fontWeight: '600',
  },
  dateText: {
    color: theme.colors.textTertiary,
    fontSize: 11,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: theme.spacing[2],
  },
  summaryText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: theme.spacing[3],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing[2],
  },
});
