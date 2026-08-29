import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { formatCoordinates } from '@/utils/formatters';
import { MapPin, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react-native';

interface LocationPreviewCardProps {
  latitude: number | null;
  longitude: number | null;
  locationName?: string;
  isLoading?: boolean;
  onRefreshLocation: () => void;
  permissionGranted?: boolean;
}

export const LocationPreviewCard: React.FC<LocationPreviewCardProps> = ({
  latitude,
  longitude,
  locationName,
  isLoading = false,
  onRefreshLocation,
  permissionGranted = true,
}) => {
  const hasCoordinates = latitude !== null && longitude !== null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <MapPin size={16} color={COLORS.primary} />
          <Text style={styles.title}>GPS LOCATION</Text>
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefreshLocation}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <RefreshCw size={12} color={COLORS.primary} />
              <Text style={styles.refreshText}>Update GPS</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {hasCoordinates ? (
        <View style={styles.coordsBox}>
          <View style={styles.statusRow}>
            <CheckCircle2 size={15} color={COLORS.success} />
            <Text style={styles.statusText}>Location Detected</Text>
          </View>

          <Text style={styles.locationName} numberOfLines={2}>
            {locationName || 'Precise GPS Pin Loaded'}
          </Text>

          <View style={styles.coordsPill}>
            <Text style={styles.coordsText}>
              Coordinates: {formatCoordinates(latitude!, longitude!)}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.warningBox}>
          <AlertTriangle size={16} color={COLORS.warning} />
          <Text style={styles.warningText}>
            {permissionGranted
              ? 'Detecting GPS position...'
              : 'Location permission required to automatically place your pin.'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
  },
  refreshText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  coordsBox: {
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 4,
    gap: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  locationName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  coordsPill: {
    marginTop: 2,
  },
  coordsText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
    lineHeight: 16,
  },
});
