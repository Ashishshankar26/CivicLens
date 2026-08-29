import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, MapType } from 'react-native-maps';
import { CivicIssue } from '@/types/issue';
import { IssueMarker } from './IssueMarker';
import { DEFAULT_REGION } from '@/constants/mockData';

interface CivicMapViewProps {
  issues: CivicIssue[];
  selectedIssueId?: string | null;
  onSelectIssue: (issue: CivicIssue) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  mapType?: MapType;
  recenterTrigger?: number;
}

export const CivicMapView: React.FC<CivicMapViewProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  userCoords,
  mapType = 'standard',
  recenterTrigger,
}) => {
  const mapRef = useRef<MapView>(null);
  const [zoomScale, setZoomScale] = useState<number>(1.0);

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
});
