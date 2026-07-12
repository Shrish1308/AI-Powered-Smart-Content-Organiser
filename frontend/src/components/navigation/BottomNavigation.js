import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export const BottomNavigation = ({ activeTab, onTabPress }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'library', label: 'Library', icon: 'grid' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'chat', label: 'AI Chat', icon: 'sparkles' },
    { id: 'reminders', label: 'Nudges', icon: 'alarm' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const color = isActive ? theme.colors.secondary : theme.colors.iconSecondary;
        return (
          <TouchableOpacity 
            key={tab.id}
            style={[styles.tabItem, isActive ? styles.activeTabItem : {}]}
            onPress={() => onTabPress(tab.id)}
          >
            <Ionicons name={tab.icon} size={20} color={color} />
            <Text style={[styles.tabText, isActive ? styles.activeTabText : {}]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderGlass,
    paddingVertical: theme.spacing[2],
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    flex: 1,
  },
  activeTabItem: {
    // Subtle glow under active tab in web
  },
  tabText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.secondary,
    fontWeight: '600',
  },
});
