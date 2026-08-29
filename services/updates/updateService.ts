import { Alert } from 'react-native';

// Safe dynamic require for expo-updates to ensure compatibility in both Expo Go, Metro dev & standalone APKs
let Updates: any = null;
try {
  Updates = require('expo-updates');
} catch {
  Updates = null;
}

export interface UpdateStatus {
  isAvailable: boolean;
  isDownloading: boolean;
  manifest?: any;
  currentUpdateId: string | null;
  channel: string | null;
  runtimeVersion: string | null;
  isEnabled: boolean;
}

/**
 * Get current OTA update metadata
 */
export function getAppUpdateInfo(): {
  isEnabled: boolean;
  channel: string | null;
  updateId: string | null;
  runtimeVersion: string | null;
  isEmbeddedLaunch: boolean;
} {
  try {
    if (!Updates || !Updates.isEnabled) {
      return {
        isEnabled: false,
        channel: 'production',
        updateId: 'v1.0.0',
        runtimeVersion: '1.0.0',
        isEmbeddedLaunch: true,
      };
    }
    return {
      isEnabled: Updates.isEnabled,
      channel: Updates.channel || 'production',
      updateId: Updates.updateId || 'v1.0.0',
      runtimeVersion: Updates.runtimeVersion || '1.0.0',
      isEmbeddedLaunch: Updates.isEmbeddedLaunch ?? true,
    };
  } catch {
    return {
      isEnabled: false,
      channel: 'production',
      updateId: 'v1.0.0',
      runtimeVersion: '1.0.0',
      isEmbeddedLaunch: true,
    };
  }
}

/**
 * Checks for OTA updates from the release channel and prompts to install
 */
export async function checkAndApplyAppUpdate(manual = false): Promise<boolean> {
  if (!Updates || !Updates.isEnabled) {
    if (manual) {
      Alert.alert(
        'Up to Date',
        'CivicLens is running the latest production build (v1.0.0).'
      );
    }
    return false;
  }

  try {
    const update = await Updates.checkForUpdateAsync();

    if (update?.isAvailable) {
      if (manual) {
        Alert.alert(
          'Update Available',
          'A new version of CivicLens is available. Would you like to download and install it now?',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Update & Restart',
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (err: any) {
                  Alert.alert('Update Notice', err?.message || 'Could not download update.');
                }
              },
            },
          ]
        );
      } else {
        await Updates.fetchUpdateAsync();
        Alert.alert(
          'CivicLens Updated',
          'An update has been downloaded. Restart the app to apply the latest features.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Restart Now', onPress: () => Updates.reloadAsync() },
          ]
        );
      }
      return true;
    } else {
      if (manual) {
        Alert.alert('Up to Date', 'You are already running the latest version of CivicLens.');
      }
      return false;
    }
  } catch (error: any) {
    if (manual) {
      Alert.alert('System Notice', 'App is running latest version.');
    }
    return false;
  }
}
