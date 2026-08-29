import { CivicIssue, NearbyDuplicate } from '@/types/issue';

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 * @returns Distance in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const calculateDistance = calculateDistanceMeters;

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Detects whether any active issues of the same category exist within a specified radius
 * (default 50 meters) of the target GPS coordinates.
 */
export function findNearbyDuplicates(
  latitude: number,
  longitude: number,
  category: string,
  existingIssues: CivicIssue[],
  maxRadiusMeters: number = 50
): NearbyDuplicate[] {
  const duplicates: NearbyDuplicate[] = [];

  for (const issue of existingIssues) {
    // Only check active issues of the exact same category
    if (issue.status !== 'active' || issue.category !== category) {
      continue;
    }

    const dist = calculateDistanceMeters(
      latitude,
      longitude,
      issue.latitude,
      issue.longitude
    );

    if (dist <= maxRadiusMeters) {
      duplicates.push({
        issue,
        distanceMeters: dist,
      });
    }
  }

  // Sort by closest first
  return duplicates.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
