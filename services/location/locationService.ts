import * as Location from 'expo-location';
import { DEFAULT_REGION } from '@/constants/mockData';

export interface LocationResult {
  latitude: number;
  longitude: number;
  locationName: string;
  accuracy?: number | null;
}

/**
 * Requests location permissions and fetches the current device GPS position.
 * If permission is denied or location services are disabled, returns a safe fallback.
 */
export async function getCurrentLocation(): Promise<{
  success: boolean;
  location: LocationResult;
  permissionGranted: boolean;
  errorMessage?: string;
}> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return {
        success: false,
        permissionGranted: false,
        errorMessage: 'Location permission is required to automatically locate your report.',
        location: {
          latitude: DEFAULT_REGION.latitude,
          longitude: DEFAULT_REGION.longitude,
          locationName: 'Central Civic District (Default)',
        },
      };
    }

    // Fetch high-accuracy GPS coordinates
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude, accuracy } = position.coords;

    // Reverse geocode to get a human-readable street/area name
    let locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const parts = [
          place.street || place.name,
          place.district || place.subregion || place.city,
        ].filter(Boolean);

        if (parts.length > 0) {
          locationName = parts.join(', ');
        }
      }
    } catch {
      // Reverse geocoding optional fallback
    }

    return {
      success: true,
      permissionGranted: true,
      location: {
        latitude,
        longitude,
        locationName,
        accuracy,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      permissionGranted: false,
      errorMessage: error?.message || 'Unable to retrieve GPS coordinates.',
      location: {
        latitude: DEFAULT_REGION.latitude,
        longitude: DEFAULT_REGION.longitude,
        locationName: 'Central Civic District (Fallback)',
      },
    };
  }
}
