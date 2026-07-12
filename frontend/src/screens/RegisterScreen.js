import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

import { theme } from '../theme';
import { Screen } from '../components/layout/Screen';
import { Card } from '../components/cards/Card';
import { TextInputBase } from '../components/inputs/TextInputBase';
import { Button } from '../components/buttons/Button';
import { StatusMessage } from '../components/feedback/StatusMessage';

export default function RegisterScreen({ onToggleAuth }) {
  const { signUp } = useContext(AuthContext);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignUp = async () => {
    if (!usernameInput.trim() || !passwordInput.trim() || !confirmPasswordInput.trim()) {
      setErrorMsg('All fields are required');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await signUp(usernameInput, passwordInput);
      if (res.success) {
        setSuccessMsg('Registration successful! Redirecting to login...');
        setTimeout(() => {
          onToggleAuth();
        }, 1500);
      } else {
        setErrorMsg(res.message);
      }
    } catch (e) {
      setErrorMsg('Something went wrong during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoIcon}>
            <Ionicons name="sparkles" size={36} color={theme.colors.secondary} />
          </View>
          <Text style={[styles.logoText, theme.typography.headline]}>SmartRecall</Text>
          <Text style={[styles.subLogoText, theme.typography.caption]}>AI Knowledge Hub</Text>
        </View>

        <Card variant="glass">
          <Text style={[styles.cardTitle, theme.typography.title]}>Create Account</Text>
          <Text style={[styles.cardSubtitle, theme.typography.body, { color: theme.colors.textSecondary }]}>
            Sign up to start organizing your files & links
          </Text>

          <TextInputBase
            label="Username"
            iconName="person-outline"
            placeholder="Create username..."
            value={usernameInput}
            onChangeText={setUsernameInput}
            autoCapitalize="none"
          />

          <TextInputBase
            label="Password"
            iconName="lock-closed-outline"
            placeholder="Create password..."
            secureTextEntry
            value={passwordInput}
            onChangeText={setPasswordInput}
            autoCapitalize="none"
          />

          <TextInputBase
            label="Confirm Password"
            iconName="lock-closed-outline"
            placeholder="Confirm password..."
            secureTextEntry
            value={confirmPasswordInput}
            onChangeText={setConfirmPasswordInput}
            autoCapitalize="none"
          />

          <StatusMessage type="error" message={errorMsg} />
          <StatusMessage type="success" message={successMsg} />

          <Button 
            title="Sign Up" 
            onPress={handleSignUp} 
            loading={loading}
            style={{ marginTop: theme.spacing[3] }}
          />

          <Button 
            title="Already have an account? Sign In" 
            variant="ghost" 
            onPress={onToggleAuth}
            style={{ marginTop: theme.spacing[2] }}
            textStyle={{ color: theme.colors.secondary }}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: theme.spacing[6],
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
    marginTop: theme.spacing[2],
  },
  logoIcon: {
    width: 68,
    height: 68,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryOverlay,
    marginBottom: theme.spacing[4],
  },
  logoText: {
    color: theme.colors.textPrimary,
  },
  subLogoText: {
    color: theme.colors.textTertiary,
    marginTop: theme.spacing[1],
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing[2],
  },
  cardSubtitle: {
    marginBottom: theme.spacing[6],
  },
});
