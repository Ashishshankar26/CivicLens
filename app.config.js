/**
 * @author Ashish Shankar <ashishshankar26>
 * @description Dynamic Expo Configuration for CivicLens 2.0
 * Safely injects environment variables without committing raw secrets into Git.
 */

module.exports = ({ config }) => {
  const googleMapsApiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    '';

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
  };
};
