import React, { useContext, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import { usePushNotifications } from './src/hooks/usePushNotifications';

function NavigationRouter() {
  const { userToken, isLoading } = useContext(AuthContext);
  const [authScreen, setAuthScreen] = useState('login'); // 'login' or 'register'
  // Stores the note_id from a notification tap so HomeScreen can highlight it
  const [notificationTarget, setNotificationTarget] = useState(null);

  // Handle notification tap — navigate to the relevant note
  const handleNotificationTap = useCallback((data) => {
    if (data?.note_id) {
      setNotificationTarget(data.note_id);
    }
  }, []);

  // Register for push notifications once logged in
  usePushNotifications(userToken, handleNotificationTap);

  // Splash/Loading screen on startup
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />
        <View style={styles.logoIcon}>
          <Ionicons name="sparkles" size={48} color="#c084fc" />
        </View>
        <Text style={styles.logoText}>SmartRecall</Text>
        <ActivityIndicator size="small" color="#8b5cf6" style={{ marginTop: 24 }} />
      </View>
    );
  }

  // Auth Guards: If no token, present auth screens
  if (!userToken) {
    if (authScreen === 'login') {
      return <LoginScreen onToggleAuth={() => setAuthScreen('register')} />;
    } else {
      return <RegisterScreen onToggleAuth={() => setAuthScreen('login')} />;
    }
  }

  // Protected application workspace
  return (
    <HomeScreen
      notificationTarget={notificationTarget}
      onNotificationTargetCleared={() => setNotificationTarget(null)}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationRouter />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0b0f19',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
