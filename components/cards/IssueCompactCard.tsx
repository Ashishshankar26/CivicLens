import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { CivicIssue } from '@/types/issue';
import { StatusBadge } from '../ui/StatusBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import { formatRelativeTime } from '@/utils/formatters';
import { MapPin, Users, ChevronRight, ShieldCheck } from 'lucide-react-native';

interface IssueCompactCardProps {
  issue: CivicIssue;
  onPress: (issueId: string) => void;
}

export function IssueCompactCard({ issue, onPress }: IssueCompactCardProps) {
  const isResolved = issue.status === 'resolved';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isResolved && styles.cardResolved,
      ]}
      onPress={() => onPress(issue.id)}
      activeOpacity={0.85}
    >
      <Image
        source={{
          uri:
            issue.imageUrl ||
            'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
        }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <CategoryBadge category={issue.category} size="sm" />
          <StatusBadge status={issue.status} size="sm" />
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {issue.description || `${issue.category.replace('_', ' ')} detected`}
        </Text>

        <View style={styles.metaRow}>
          <MapPin size={11} color={COLORS.textMuted} />
          <Text style={styles.locationText} numberOfLines={1}>
            {issue.locationName || `${issue.latitude.toFixed(3)}, ${issue.longitude.toFixed(3)}`}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.timeText}>{formatRelativeTime(issue.createdAt)}</Text>

          <View style={styles.rightMetrics}>
            {isResolved ? (
              <View style={styles.resolvedPill}>
                <ShieldCheck size={11} color="#059669" />
                <Text style={styles.resolvedPillText}>Resolved</Text>
              </View>
            ) : (
              <View style={styles.confirmPill}>
                <Users size={10} color={COLORS.primaryDark} />
                <Text style={styles.confirmPillText}>
                  {issue.confirmationCount || 0}
                </Text>
              </View>
            )}
            <ChevronRight size={13} color="#94A3B8" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.5)',
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  cardResolved: {
    borderColor: 'rgba(52, 199, 89, 0.3)',
    backgroundColor: '#F8FDF9',
  },
  thumbnail: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
  timeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  rightMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confirmPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  confirmPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  resolvedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  resolvedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
});
