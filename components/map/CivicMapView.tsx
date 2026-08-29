import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region, MapType } from 'react-native-maps';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { CivicIssue } from '@/types/issue';
import { IssueMarker } from './IssueMarker';
import { DEFAULT_REGION } from '@/constants/mockData';
import {
  predictPotholeHotspots,
  PotholePredictionHotspot,
  RainfallAnalyticsSummary,
} from '@/services/analytics/potholePredictionService';

interface CivicMapViewProps {
  issues: CivicIssue[];
  selectedIssueId?: string | null;
  onSelectIssue: (issue: CivicIssue) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  mapType?: MapType;
  recenterTrigger?: number;
  showHotspots?: boolean;
  onSelectHotspot?: (hotspot: PotholePredictionHotspot) => void;
}

export const CivicMapView: React.FC<CivicMapViewProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  userCoords,
  mapType = 'standard',
  recenterTrigger,
  showHotspots = true,
  onSelectHotspot,
}) => {
  const mapRef = useRef<MapView>(null);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [potholeAnalytics, setPotholeAnalytics] = useState<RainfallAnalyticsSummary | null>(null);

  // Load Open-Meteo real historical rain data & predict pothole hotspots
  useEffect(() => {
    async function loadPredictiveHotspots() {
      const lat = userCoords?.latitude || DEFAULT_REGION.latitude;
      const lng = userCoords?.longitude || DEFAULT_REGION.longitude;
      try {
        const summary = await predictPotholeHotspots(lat, lng, issues);
        setPotholeAnalytics(summary);
      } catch (e) {
        console.warn('Failed to load pothole predictions:', e);
      }
    }
    loadPredictiveHotspots();
  }, [userCoords?.latitude, userCoords?.longitude, issues.length]);

  // Check if running inside Expo Go
  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    Constants.appOwnership === 'expo';

  const initialRegion: Region = {
    latitude: userCoords?.latitude || DEFAULT_REGION.latitude,
    longitude: userCoords?.longitude || DEFAULT_REGION.longitude,
    latitudeDelta: DEFAULT_REGION.latitudeDelta,
    longitudeDelta: DEFAULT_REGION.longitudeDelta,
  };

  const hasAutoCentered = useRef<boolean>(false);

  useEffect(() => {
    if (userCoords && mapRef.current && !hasAutoCentered.current) {
      hasAutoCentered.current = true;
      mapRef.current.animateToRegion(
        {
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
          latitudeDelta: 0.018,
          longitudeDelta: 0.018,
        },
        700
      );
    }
  }, [userCoords?.latitude, userCoords?.longitude]);

  useEffect(() => {
    if (recenterTrigger && mapRef.current) {
      const target = userCoords || {
        latitude: DEFAULT_REGION.latitude,
        longitude: DEFAULT_REGION.longitude,
      };

      mapRef.current.animateToRegion(
        {
          latitude: target.latitude,
          longitude: target.longitude,
          latitudeDelta: 0.018,
          longitudeDelta: 0.018,
        },
        600
      );
    }
  }, [recenterTrigger]);

  useEffect(() => {
    if (selectedIssueId && mapRef.current) {
      const targetIssue = issues.find((i) => i.id === selectedIssueId);
      if (targetIssue) {
        mapRef.current.animateToRegion(
          {
            latitude: targetIssue.latitude,
            longitude: targetIssue.longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          },
          450
        );
      }
    }
  }, [selectedIssueId]);

  const handleRegionChangeComplete = (region: Region) => {
    const delta = region.latitudeDelta;
    if (delta < 0.012) {
      setZoomScale(1.4); // Zoomed in close: extra large flag
    } else if (delta < 0.025) {
      setZoomScale(1.15); // Close-medium: large flag
    } else if (delta < 0.055) {
      setZoomScale(1.0); // Standard zoom: standard flag
    } else if (delta < 0.12) {
      setZoomScale(0.8); // Zoomed out: compact flag
    } else {
      setZoomScale(0.65); // Far out: mini flag
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        mapType={mapType}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={Boolean(userCoords)}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={false}
      >

        {/* Render Predictive Pothole Hotspot Circles & Markers */}
        {showHotspots &&
          potholeAnalytics?.hotspots.map((hs) => {
            const isCritical = hs.riskLevel === 'CRITICAL';
            const isHigh = hs.riskLevel === 'HIGH';
            const strokeColor = isCritical
              ? '#EF4444'
              : isHigh
              ? '#F97316'
              : '#EAB308';
            const fillColor = isCritical
              ? 'rgba(239, 68, 68, 0.22)'
              : isHigh
              ? 'rgba(249, 115, 22, 0.20)'
              : 'rgba(234, 179, 8, 0.18)';

            return (
              <React.Fragment key={hs.id}>
                <Circle
                  center={{ latitude: hs.latitude, longitude: hs.longitude }}
                  radius={hs.radiusMeters}
                  fillColor={fillColor}
                  strokeColor={strokeColor}
                  strokeWidth={2}
                />
                <Marker
                  coordinate={{ latitude: hs.latitude, longitude: hs.longitude }}
                  onPress={() => onSelectHotspot && onSelectHotspot(hs)}
                  zIndex={90}
                >
                  <View style={[styles.hotspotBadge, { backgroundColor: strokeColor }]}>
                    <Text style={styles.hotspotText}>⚡ {hs.riskScore}% POTHOLE RISK</Text>
                  </View>
                </Marker>
              </React.Fragment>
            );
          })}

        {issues.map((issue) => {
          const isSelected = issue.id === selectedIssueId;
          return (
            <Marker
              key={issue.id}
              coordinate={{
                latitude: issue.latitude,
                longitude: issue.longitude,
              }}
              onPress={() => onSelectIssue(issue)}
              anchor={{ x: 0.5, y: 1.0 }}
              tracksViewChanges={isSelected}
              zIndex={isSelected ? 999 : issue.status === 'resolved' ? 10 : (issue.priorityScore || 50)}
            >
              <IssueMarker
                issue={issue}
                isSelected={isSelected}
                zoomScale={zoomScale}
              />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  hotspotBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  hotspotText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
