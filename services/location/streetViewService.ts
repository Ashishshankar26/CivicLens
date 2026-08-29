import { Platform, Linking } from 'react-native';

/**
 * Opens Google Street View interactive panorama for given coordinates
 */
export async function openGoogleStreetView(
  latitude: number,
  longitude: number,
  locationName = 'Hazard Location'
): Promise<boolean> {
  try {
    const androidUri = `google.streetview:cbll=${latitude},${longitude}`;
    const webUri = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}&heading=0&pitch=0&fov=90`;

    if (Platform.OS === 'android') {
      const supported = await Linking.canOpenURL(androidUri);
      if (supported) {
        await Linking.openURL(androidUri);
        return true;
      }
    }

    // Fallback to Web/iOS Street View URL
    await Linking.openURL(webUri);
    return true;
  } catch (error) {
    console.warn('[Street View] Error launching panorama:', error);
    const webUri = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`;
    await Linking.openURL(webUri);
    return false;
  }
}
