/**
 * @author Ashish Shankar <ashishshankar26>
 * @copyright (c) 2026 Ashish Shankar. All rights reserved.
 * @description CivicLens 2.0 Root Layout Architecture
 */
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { IssuesProvider } from '@/contexts/IssuesContext';
import { checkAndApplyAppUpdate } from '@/services/updates/updateService';
import { registerForPushNotificationsAsync } from '@/services/notifications/notificationService';
import { initOwnershipWatermark } from '@/utils/signature';

export default function RootLayout() {
  useEffect(() => {
    initOwnershipWatermark();
    registerForPushNotificationsAsync();
    checkAndApplyAppUpdate(false);
  }, []);
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <IssuesProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#F8FAFC' },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen
              name="issue/[id]"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </IssuesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
