import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_LOCATION_KEY = '@civiclens_last_known_location';

export const FALLBACK_DEFAULT_REGION = {
  latitude: 28.6139,
  longitude: 77.2090,
  latitudeDelta: 0.038,
  longitudeDelta: 0.038,
};

export interface LocationResult {
  latitude: number;
  longitude: number;
  locationName: string;
  accuracy?: number | null;
}

export async function getLastKnownLocation(): Promise<LocationResult | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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
      const cached = await getLastKnownLocation();
      return {
        success: false,
        permissionGranted: false,
        errorMessage: 'Location permission is required to automatically locate your report.',
        location: cached || {
          latitude: FALLBACK_DEFAULT_REGION.latitude,
          longitude: FALLBACK_DEFAULT_REGION.longitude,
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

    const locResult: LocationResult = {
      latitude,
      longitude,
      locationName,
      accuracy,
    };

    // Cache the location for immediate startup on next launch
    try {
      await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(locResult));
    } catch {
      // Storage cache optional
    }

    return {
      success: true,
      permissionGranted: true,
      location: locResult,
    };
  } catch (error: any) {
    const cached = await getLastKnownLocation();
    return {
      success: false,
      permissionGranted: false,
      errorMessage: error?.message || 'Unable to retrieve GPS coordinates.',
      location: cached || {
        latitude: FALLBACK_DEFAULT_REGION.latitude,
        longitude: FALLBACK_DEFAULT_REGION.longitude,
        locationName: 'Central Civic District (Fallback)',
      },
    };
  }
}
