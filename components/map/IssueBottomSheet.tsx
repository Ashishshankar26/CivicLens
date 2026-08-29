import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CivicIssue } from '@/types/issue';
import { StatusBadge } from '../ui/StatusBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { formatDistance, formatRelativeTime } from '@/utils/formatters';
import { calculateDistance } from '@/utils/distance';
import {
  X,
  MapPin,
  Clock,
  ArrowRight,
  Navigation,
} from 'lucide-react-native';

interface IssueBottomSheetProps {
  issue: CivicIssue;
  userCoords?: { latitude: number; longitude: number } | null;
  onViewDetails: (issueId: string) => void;
  onClose: () => void;
}

export const IssueBottomSheet: React.FC<IssueBottomSheetProps> = ({
  issue,
  userCoords,
  onViewDetails,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPosition = (insets.bottom > 0 ? insets.bottom : 10) + 76; // Clean clearance above floating navbar

  const distance =
    userCoords && userCoords.latitude && userCoords.longitude
      ? calculateDistance(
          userCoords.latitude,
          userCoords.longitude,
          issue.latitude,
          issue.longitude
        )
      : null;

  const priorityScore = issue.priorityScore || 65;
  const isUrgent = priorityScore >= 80;

  const handleOpenGoogleMaps = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${issue.latitude},${issue.longitude}(${encodeURIComponent(issue.locationName || 'Civic Hazard')})`,
      android: `geo:0,0?q=${issue.latitude},${issue.longitude}(${encodeURIComponent(issue.locationName || 'Civic Hazard')})`,
      default: `https://www.google.com/maps/search/?api=1&query=${issue.latitude},${issue.longitude}`,
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${issue.latitude},${issue.longitude}`);
      }
    });
  };

  return (
    <View style={[styles.glassContainer, { bottom: bottomPosition }]}>
      {/* Top Drag Indicator & Close */}
      <View style={styles.dragBarRow}>
        <View style={styles.dragPill} />
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <X size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        {/* Photo Thumbnail */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: issue.imageUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          {isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>🚨 URGENT</Text>
            </View>
          )}
        </View>

        {/* Content Column */}
        <View style={styles.contentCol}>
          <View style={styles.badgeRow}>
            <CategoryBadge category={issue.category} size="sm" />
            <StatusBadge status={issue.status} size="sm" />
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {issue.description}
          </Text>

          {/* Distance & Relative Time Glass Pill */}
          <View style={styles.telemetryRow}>
            {distance !== null && (
              <View style={styles.telemetryPill}>
                <MapPin size={11} color={COLORS.primary} />
                <Text style={styles.telemetryText}>{formatDistance(distance)}</Text>
              </View>
            )}

            <View style={styles.telemetryPill}>
              <Clock size={11} color={COLORS.textSecondary} />
              <Text style={styles.telemetryText}>{formatRelativeTime(issue.createdAt)}</Text>
            </View>
          </View>

          {/* Coordinates Subtitle */}
          <Text style={styles.coordsText}>
            📍 {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
          </Text>
        </View>
      </View>

      {/* Action Bar with Google Maps Navigation + Details */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={styles.googleMapsBtn}
          onPress={handleOpenGoogleMaps}
          activeOpacity={0.8}
        >
          <Navigation size={13} color={COLORS.primaryDark} />
          <Text style={styles.googleMapsText}>Google Maps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewDetailsBtn}
          onPress={() => onViewDetails(issue.id)}
          activeOpacity={0.85}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
          <ArrowRight size={13} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glassContainer: {
    position: 'absolute',
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.floating,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    zIndex: 50,
  },
  dragBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: -4,
    padding: 4,
  },
  cardBody: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  imageWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: 78,
    height: 78,
    borderRadius: RADIUS.md,
    backgroundColor: '#E2E8F0',
  },
  urgentBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  contentCol: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  description: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHighlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    gap: 3,
  },
  telemetryText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  coordsText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  googleMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
  },
  googleMapsText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 5,
    ...SHADOWS.small,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
});
