import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

// FastAPI Backend URL - must match HomeScreen.js
const API_BASE_URL = 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [username, setUsername] = useState(null);

  // Load persisted token on app startup
  useEffect(() => {
    const bootstrapAsync = async () => {
      let token = null;
      let user = null;
      try {
        token = await AsyncStorage.getItem('userToken');
        user = await AsyncStorage.getItem('username');
      } catch (e) {
        console.error('Failed to load token from storage:', e);
      }
      setUserToken(token);
      setUsername(user);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const authContextValue = {
    isLoading,
    userToken,
    username,
    signIn: async (inputUsername, inputPassword) => {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: inputUsername, password: inputPassword })
        });

        if (response.ok) {
          const data = await response.json();
          const token = data.token;
          const user = data.username;
          try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('username', user);
          } catch (e) {
            console.error('Failed to persist token:', e);
          }
          setUserToken(token);
          setUsername(user);
          setIsLoading(false);
          return { success: true };
        } else {
          const errorData = await response.json().catch(() => ({}));
          setIsLoading(false);
          return { success: false, message: errorData.detail || 'Invalid username or password' };
        }
      } catch (e) {
        console.error('Login network error:', e);
        setIsLoading(false);
        return { success: false, message: 'Cannot connect to server. Is the backend running?' };
      }
    },
    signUp: async (newUsername, newPassword) => {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: newUsername, password: newPassword })
        });

        if (response.ok) {
          setIsLoading(false);
          return { success: true };
        } else {
          const errorData = await response.json().catch(() => ({}));
          setIsLoading(false);
          return { success: false, message: errorData.detail || 'Registration failed' };
        }
      } catch (e) {
        console.error('Registration network error:', e);
        setIsLoading(false);
        return { success: false, message: 'Cannot connect to server. Is the backend running?' };
      }
    },
    signOut: async () => {
      setIsLoading(true);
      // Call backend logout to invalidate session
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } catch (e) {
        console.error('Logout network error (non-fatal):', e);
      }
      // Always clear local state regardless of backend response
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('username');
      } catch (e) {
        console.error(e);
      }
      setUserToken(null);
      setUsername(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
