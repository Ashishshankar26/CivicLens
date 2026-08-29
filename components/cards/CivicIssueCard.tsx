import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { CivicIssue } from '@/types/issue';
import { StatusBadge } from '../ui/StatusBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import { formatDistance, formatRelativeTime } from '@/utils/formatters';
import { calculateDistance } from '@/utils/distance';
import { calculatePriorityScore } from '@/utils/priority';
import { MapPin, Users, Flame, ChevronRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CivicIssueCardProps {
  issue: CivicIssue;
  userCoords?: { latitude: number; longitude: number } | null;
  onPress: (issueId: string) => void;
  variant?: 'featured' | 'standard' | 'mapOverlay';
  onConfirm?: (issueId: string) => void;
}

export function CivicIssueCard({
  issue,
  userCoords,
  onPress,
  variant = 'standard',
  onConfirm,
}: CivicIssueCardProps) {
  const distance = userCoords
    ? calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        issue.latitude,
        issue.longitude
      )
    : null;

  const priorityScore = issue.priorityScore || calculatePriorityScore(
    issue.severity,
    issue.trafficLevel || 'medium',
    issue.confirmationCount || 0,
    issue.gettingWorseCount || 0,
    issue.createdAt
  ).total;

  const isUrgent = issue.severity === 'high' || priorityScore >= 75;

  if (variant === 'mapOverlay') {
    return (
      <TouchableOpacity
        style={styles.mapOverlayCard}
        onPress={() => onPress(issue.id)}
        activeOpacity={0.88}
      >
        <Image
          source={{
            uri:
              issue.imageUrl ||
              'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
          }}
          style={styles.mapOverlayImage}
          resizeMode="cover"
        />

        <View style={styles.mapOverlayBody}>
          <View style={styles.badgeRow}>
            <CategoryBadge category={issue.category} size="sm" />
            <StatusBadge status={issue.status} size="sm" />
            {isUrgent && (
              <View style={styles.urgentPill}>
                <Flame size={10} color="#DC2626" />
                <Text style={styles.urgentPillText}>High Priority</Text>
              </View>
            )}
          </View>

          <Text style={styles.mapOverlayTitle} numberOfLines={1}>
            {issue.description || `${issue.category.replace('_', ' ')} detected`}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={11} color={COLORS.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>
                {issue.locationName || `${issue.latitude.toFixed(3)}, ${issue.longitude.toFixed(3)}`}
              </Text>
            </View>

            {distance !== null && (
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
              </View>
            )}
          </View>

          <View style={styles.footerRow}>
            <View style={styles.confirmBadge}>
              <Users size={11} color={COLORS.primaryDark} />
              <Text style={styles.confirmBadgeText}>
                {issue.confirmationCount || 0} Confirmations
              </Text>
            </View>
            <View style={styles.actionLink}>
              <Text style={styles.actionLinkText}>Details</Text>
              <ChevronRight size={12} color={COLORS.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => onPress(issue.id)}
        activeOpacity={0.9}
      >
        <View style={styles.featuredImageContainer}>
          <Image
            source={{
              uri:
                issue.imageUrl ||
                'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
            }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlayGradient} />
          
          <View style={styles.featuredTopRow}>
            <CategoryBadge category={issue.category} size="sm" />
            <StatusBadge status={issue.status} size="sm" />
          </View>

          {distance !== null && (
            <View style={styles.featuredDistancePill}>
              <MapPin size={10} color="#FFFFFF" />
              <Text style={styles.featuredDistanceText}>{formatDistance(distance)}</Text>
            </View>
          )}
        </View>

        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle} numberOfLines={1}>
            {issue.description || `${issue.category.replace('_', ' ')} detected`}
          </Text>

          <Text style={styles.featuredLocation} numberOfLines={1}>
            {issue.locationName || 'Local Roadway'}
          </Text>

          <View style={styles.featuredBottomRow}>
            <View style={styles.confirmBadge}>
              <Users size={11} color={COLORS.primaryDark} />
              <Text style={styles.confirmBadgeText}>
                {issue.confirmationCount || 0} Confirmations
              </Text>
            </View>
            <Text style={styles.timeText}>{formatRelativeTime(issue.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Standard Card
  return (
    <TouchableOpacity
      style={styles.standardCard}
      onPress={() => onPress(issue.id)}
      activeOpacity={0.88}
    >
      <Image
        source={{
          uri:
            issue.imageUrl ||
            'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
        }}
        style={styles.standardImage}
        resizeMode="cover"
      />

      <View style={styles.standardContent}>
        <View style={styles.badgeRow}>
          <CategoryBadge category={issue.category} size="sm" />
          <StatusBadge status={issue.status} size="sm" />
        </View>

        <Text style={styles.standardTitle} numberOfLines={1}>
          {issue.description || `${issue.category.replace('_', ' ')} detected`}
        </Text>

        <View style={styles.metaRow}>
          <MapPin size={11} color={COLORS.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {issue.locationName || `${issue.latitude.toFixed(3)}, ${issue.longitude.toFixed(3)}`}
          </Text>
          {distance !== null && (
            <Text style={styles.metaDistance}>• {formatDistance(distance)}</Text>
          )}
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.timeText}>{formatRelativeTime(issue.createdAt)}</Text>
          <View style={styles.confirmBadge}>
            <Users size={10} color={COLORS.primaryDark} />
            <Text style={styles.confirmBadgeText}>{issue.confirmationCount || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Featured (Carousel) Variant
  featuredCard: {
    width: SCREEN_WIDTH * 0.72,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...SHADOWS.card,
    marginRight: 14,
  },
  featuredImageContainer: {
    height: 120,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
  },
  featuredTopRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredDistancePill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  featuredDistanceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  featuredContent: {
    padding: 12,
    gap: 4,
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  featuredLocation: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  featuredBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  // Map Overlay Variant
  mapOverlayCard: {
    width: SCREEN_WIDTH - 36,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.95)',
    flexDirection: 'row',
    padding: 10,
    gap: 12,
    ...SHADOWS.floating,
  },
  mapOverlayImage: {
    width: 86,
    height: 86,
    borderRadius: RADIUS.md,
    backgroundColor: '#E2E8F0',
  },
  mapOverlayBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mapOverlayTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.1,
  },

  // Standard Variant
  standardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    padding: 10,
    gap: 10,
    ...SHADOWS.card,
  },
  standardImage: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.sm,
    backgroundColor: '#E2E8F0',
  },
  standardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  standardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Common styles
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  urgentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 0.5,
    borderColor: '#FECACA',
  },
  urgentPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  metaText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  metaDistance: {
    fontSize: 10.5,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  distanceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: RADIUS.sm,
  },
  confirmBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
