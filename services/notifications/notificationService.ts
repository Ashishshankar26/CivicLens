import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = '@civiclens_push_token';
const NOTIFICATIONS_ENABLED_KEY = '@civiclens_notifications_enabled';

// Configure foreground notification presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Initialize Push Notification Channels and Request Permissions
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  try {
    // 1. Android Specific High-Priority Notification Channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('civic-alerts', {
        name: 'Civic Safety Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0066FF',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync('updates', {
        name: 'App Updates & Milestones',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 150, 150, 150],
        lightColor: '#10B981',
      });
    }

    // 2. Request System Permissions
    const permissions: any = await Notifications.getPermissionsAsync();
    let isGranted = permissions?.status === 'granted' || permissions?.granted === true;

    if (!isGranted) {
      const requested: any = await Notifications.requestPermissionsAsync();
      isGranted = requested?.status === 'granted' || requested?.granted === true;
    }

    if (!isGranted) {
      console.warn('[CivicLens Push] Notification permissions not granted');
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
      return null;
    }

    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');

    // 3. Obtain Expo Push Token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'civiclens',
      });
      token = tokenData.data;
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      console.log('[CivicLens Push] Registered token:', token);
    } catch {
      // Local fallback token for development
      token = 'local-device-push-active';
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    }

    return token;
  } catch (error) {
    console.warn('[CivicLens Push] Error registering push notifications:', error);
    return null;
  }
}

/**
 * Triggers a local/in-app alert notification
 */
export async function scheduleCivicNotification({
  title,
  body,
  data,
  channelId = 'civic-alerts',
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: 'civic-alerts' | 'updates';
}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
        color: '#0066FF',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // deliver immediately
    });
  } catch (err) {
    console.warn('[CivicLens Push] Error scheduling notification:', err);
  }
}

/**
 * 1. Push Alert: New Hazard / Escalation in Neighborhood
 */
export async function sendHazardAlertPushNotification(
  category: string,
  locationName: string,
  isUrgent = false
) {
  const emoji = isUrgent ? '🚨 URGENT' : '⚠️ CIVIC ALERT';
  await scheduleCivicNotification({
    title: `${emoji}: New ${category.replace('_', ' ').toUpperCase()} Reported`,
    body: `A road safety issue was flagged near ${locationName}. Tap to view location on map.`,
    data: { type: 'hazard_alert', category, locationName },
    channelId: 'civic-alerts',
  });
}

/**
 * 2. Push Alert: Road Hazard Restored / Verified
 */
export async function sendRepairVerifiedPushNotification(
  category: string,
  locationName: string
) {
  await scheduleCivicNotification({
    title: `✅ Road Restored: ${category.replace('_', ' ').toUpperCase()}`,
    body: `Civic repairs completed near ${locationName}. Photo proof has been verified!`,
    data: { type: 'repair_verified', category, locationName },
    channelId: 'updates',
  });
}

/**
 * 3. Push Alert: Badge Unlocked
 */
export async function sendBadgeUnlockedPushNotification(badgeTitle: string) {
  await scheduleCivicNotification({
    title: `🏆 Milestone Unlocked: ${badgeTitle}`,
    body: `Congratulations! You unlocked a new civic badge and earned citizen reputation points.`,
    data: { type: 'badge_unlocked', badgeTitle },
    channelId: 'updates',
  });
}

/**
 * 4. Push Alert: OTA App Update Available
 */
export async function sendOtaUpdatePushNotification(version = '1.0.0') {
  await scheduleCivicNotification({
    title: `📲 CivicLens Update Available`,
    body: `Version ${version} is ready with fresh map features and bug fixes. Tap to apply.`,
    data: { type: 'ota_update', version },
    channelId: 'updates',
  });
}
