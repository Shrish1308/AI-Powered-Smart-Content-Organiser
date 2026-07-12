/**
 * SmartRecall — usePushNotifications.js
 * Registers the device for Expo push notifications and stores the token
 * in the backend. Handles foreground notification display and tap responses.
 *
 * Works only on physical devices (Expo Go / standalone build).
 * On web or simulator, it logs a message and no-ops gracefully.
 */
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

const API_BASE_URL = 'http://10.105.160.215:8000';

// Dynamically import expo-notifications so the app doesn't crash on web
// if the module isn't available.
let Notifications = null;
let Device = null;
try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
} catch (_) {
  // expo-notifications not installed — web-only mode
}

// Configure foreground notification presentation (when app is open)
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Hook: call this inside NavigationRouter after the user is logged in.
 * @param {string|null} authToken - The JWT token from AuthContext
 * @param {function} onNotificationTap - Called with notification data when user taps
 */
export function usePushNotifications(authToken, onNotificationTap) {
  const notifListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    if (!authToken || !Notifications || !Device) return;

    // Register in the background — don't block rendering
    registerForPushNotificationsAsync(authToken).catch(console.warn);

    // Listener A: notification arrives while app is in foreground
    notifListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 SmartRecall notification received:', notification.request.content.body);
    });

    // Listener B: user taps a notification (foreground or background)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data || {};
      console.log('👆 Notification tapped:', data);
      if (onNotificationTap) {
        onNotificationTap(data);
      }
    });

    return () => {
      if (notifListener.current) {
        Notifications.removeNotificationSubscription(notifListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [authToken]);
}


async function registerForPushNotificationsAsync(authToken) {
  // Expo push tokens only work on physical devices
  if (!Device.isDevice) {
    console.log('ℹ️  Push notifications require a physical device (not simulator/web).');
    return;
  }

  // Web platform uses a different push mechanism — handled by in-app banners
  if (Platform.OS === 'web') {
    console.log('ℹ️  Expo push tokens not supported on web — using in-app banners instead.');
    return;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('⚠️  Notification permission denied by user.');
    return;
  }

  // Get the Expo Push Token (uniquely identifies this device + app)
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenData.data;
    console.log('🔔 Expo Push Token obtained:', expoPushToken);

    // Register token with the SmartRecall backend
    const response = await fetch(`${API_BASE_URL}/api/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: expoPushToken }),
    });

    if (response.ok) {
      console.log('✅ Push token registered with SmartRecall backend.');
    } else {
      console.warn('⚠️  Failed to register push token with backend.');
    }
  } catch (error) {
    console.warn('❌ Error obtaining/registering push token:', error);
  }
}
