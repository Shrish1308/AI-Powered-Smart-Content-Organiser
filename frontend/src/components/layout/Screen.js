import React from 'react';
import { SafeAreaView, StatusBar, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../../theme';

export const Screen = ({ children, style, safeArea = true, keyboardAvoiding = true }) => {
  const Container = safeArea ? SafeAreaView : View;
  
  const content = (
    <Container style={[styles.container, style]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      {children}
    </Container>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardContainer}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
});
