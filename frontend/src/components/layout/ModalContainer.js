import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, Dimensions } from 'react-native';
import { theme } from '../../theme';

export const ModalContainer = ({ children, style }) => {
  return (
    <View style={styles.overlayContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.detailGlassCard, style]}>
          {children}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  detailGlassCard: {
    backgroundColor: 'rgba(20, 26, 40, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: theme.spacing[6],
  },
});
