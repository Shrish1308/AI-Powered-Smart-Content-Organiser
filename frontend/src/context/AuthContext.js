import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

// Simple in-memory mock user database for frontend-only simulation
// In real app, this would be backend-driven
const MOCK_USER_DB = [
  { username: 'testuser', password: 'testpassword' }
];

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
      
      // Look up user in simulated database
      const foundUser = MOCK_USER_DB.find(
        (u) => u.username.toLowerCase() === inputUsername.toLowerCase() && u.password === inputPassword
      );

      if (foundUser) {
        const token = `mock-token-${foundUser.username}`;
        try {
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('username', foundUser.username);
        } catch (e) {
          console.error(e);
        }
        setUserToken(token);
        setUsername(foundUser.username);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, message: 'Invalid username or password' };
      }
    },
    signUp: async (newUsername, newPassword) => {
      setIsLoading(true);
      
      const userExists = MOCK_USER_DB.some(
        (u) => u.username.toLowerCase() === newUsername.toLowerCase()
      );

      if (userExists) {
        setIsLoading(false);
        return { success: false, message: 'Username is already taken' };
      }

      // Register user in simulated database
      MOCK_USER_DB.push({ username: newUsername, password: newPassword });
      setIsLoading(false);
      return { success: true };
    },
    signOut: async () => {
      setIsLoading(true);
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
