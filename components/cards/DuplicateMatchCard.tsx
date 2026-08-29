import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { CivicIssue } from '@/types/issue';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import { CategoryBadge } from '../ui/CategoryBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { formatDistance } from '@/utils/formatters';
import { MapPin, Users, CheckCircle2, ShieldAlert } from 'lucide-react-native';

interface DuplicateMatchCardProps {
  existingIssue: CivicIssue;
  distanceMeters: number;
  onConfirmExisting: (issueId: string) => void;
  onReportAnyway: () => void;
}

export function DuplicateMatchCard({
  existingIssue,
  distanceMeters,
  onConfirmExisting,
  onReportAnyway,
}: DuplicateMatchCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.alertHeader}>
        <View style={styles.alertIcon}>
          <ShieldAlert size={16} color="#EA580C" />
        </View>
        <View style={styles.alertTextGroup}>
          <Text style={styles.alertTitle}>Possible Match Nearby</Text>
          <Text style={styles.alertSubtitle}>
            A matching issue was found {formatDistance(distanceMeters)} from your location.
          </Text>
        </View>
      </View>

      <View style={styles.issuePreviewRow}>
        <Image
          source={{
            uri:
              existingIssue.imageUrl ||
              'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
          }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        <View style={styles.issueDetails}>
          <View style={styles.badgeRow}>
            <CategoryBadge category={existingIssue.category} size="sm" />
            <StatusBadge status={existingIssue.status} size="sm" />
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {existingIssue.description || 'Reported civic issue at this location.'}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.confirmBadge}>
              <Users size={10} color={COLORS.primaryDark} />
              <Text style={styles.confirmBadgeText}>
                {existingIssue.confirmationCount || 0} Confirmations
              </Text>
            </View>
            <Text style={styles.distanceText}>{formatDistance(distanceMeters)}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.confirmPrimaryBtn}
          onPress={() => onConfirmExisting(existingIssue.id)}
          activeOpacity={0.85}
        >
          <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.confirmPrimaryBtnText}>Confirm Existing Issue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reportAnywayBtn}
          onPress={onReportAnyway}
          activeOpacity={0.8}
        >
          <Text style={styles.reportAnywayBtnText}>Create New Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    padding: 14,
    ...SHADOWS.card,
    gap: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTextGroup: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9A3412',
    letterSpacing: -0.2,
  },
  alertSubtitle: {
    fontSize: 11,
    color: '#C2410C',
    fontWeight: '500',
    marginTop: 1,
  },
  issuePreviewRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF7ED',
    padding: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.sm,
    backgroundColor: '#E2E8F0',
  },
  issueDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  description: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginVertical: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  confirmBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2410C',
  },
  actionsRow: {
    gap: 8,
  },
  confirmPrimaryBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    ...SHADOWS.button,
  },
  confirmPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  reportAnywayBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  reportAnywayBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
});
