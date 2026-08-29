import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

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
    return {
      isEnabled: Updates.isEnabled,
      channel: Updates.channel || 'development',
      updateId: Updates.updateId || 'local-build',
      runtimeVersion: Updates.runtimeVersion || '1.0.0',
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
    };
  } catch {
    return {
      isEnabled: false,
      channel: 'development',
      updateId: 'local-build',
      runtimeVersion: '1.0.0',
      isEmbeddedLaunch: true,
    };
  }
}

/**
 * Checks for OTA updates from the release channel and prompts to install
 */
export async function checkAndApplyAppUpdate(manual = false): Promise<boolean> {
  if (!Updates.isEnabled) {
    if (manual) {
      Alert.alert(
        'Development Mode',
        'OTA Updates are active on standalone APK builds. In development mode, changes are delivered live via Metro bundler.'
      );
    }
    return false;
  }

  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      if (manual) {
        Alert.alert(
          'Update Available 🚀',
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
                  Alert.alert('Update Failed', err?.message || 'Could not download update.');
                }
              },
            },
          ]
        );
      } else {
        // Automatic silent background download
        await Updates.fetchUpdateAsync();
        Alert.alert(
          'CivicLens Updated 🌟',
          'An OTA update has been downloaded. Restart the app to apply the latest features.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Restart Now', onPress: () => Updates.reloadAsync() },
          ]
        );
      }
      return true;
    } else {
      if (manual) {
        Alert.alert('Up to Date ✨', 'You are already running the latest version of CivicLens.');
      }
      return false;
    }
  } catch (error: any) {
    if (manual) {
      Alert.alert('Check Notice', error?.message || 'Could not check for OTA updates right now.');
    }
    return false;
  }
}
