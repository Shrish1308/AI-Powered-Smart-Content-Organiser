import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export const ModalHeader = ({ children, onClose }) => {
  return (
    <View style={styles.detailHeader}>
      <View style={styles.leftContainer}>
        {children}
      </View>
      {onClose && (
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  }
});
