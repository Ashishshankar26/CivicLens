import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import { CivicIssue } from '@/types/issue';
import { formatRelativeTime } from '@/utils/formatters';
import { CategoryBadge } from '../ui/CategoryBadge';
import { ShieldCheck, PlusCircle, CheckCircle2, ChevronRight } from 'lucide-react-native';

interface ActivityStreamWidgetProps {
  issues: CivicIssue[];
  onPressIssue: (issueId: string) => void;
}

export function ActivityStreamWidget({ issues, onPressIssue }: ActivityStreamWidgetProps) {
  // Sort issues by recency (either resolvedAt or createdAt)
  const recentItems = [...issues]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Activity</Text>
        <Text style={styles.subtext}>Community reports & verifications</Text>
      </View>

      <View style={styles.list}>
        {recentItems.map((item, index) => {
          const isResolved = item.status === 'resolved';
          const isConfirmed = (item.confirmationCount || 0) > 0;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemRow,
                index < recentItems.length - 1 && styles.itemRowBorder,
              ]}
              onPress={() => onPressIssue(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.iconCol}>
                {isResolved ? (
                  <View style={[styles.iconWrap, styles.iconWrapResolved]}>
                    <ShieldCheck size={13} color="#059669" />
                  </View>
                ) : isConfirmed ? (
                  <View style={[styles.iconWrap, styles.iconWrapConfirm]}>
                    <CheckCircle2 size={13} color="#0284C7" />
                  </View>
                ) : (
                  <View style={[styles.iconWrap, styles.iconWrapNew]}>
                    <PlusCircle size={13} color="#EA580C" />
                  </View>
                )}
              </View>

              <View style={styles.contentCol}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {isResolved
                      ? `Resolved: ${item.category.replace('_', ' ')}`
                      : isConfirmed
                      ? `Verified: ${item.category.replace('_', ' ')}`
                      : `Reported: ${item.category.replace('_', ' ')}`}
                  </Text>
                  <Text style={styles.itemTime}>{formatRelativeTime(item.createdAt)}</Text>
                </View>

                <Text style={styles.itemLocation} numberOfLines={1}>
                  {item.locationName || `${item.latitude.toFixed(3)}, ${item.longitude.toFixed(3)}`}
                </Text>
              </View>

              <ChevronRight size={13} color="#CBD5E1" />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    ...SHADOWS.card,
    gap: 10,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  subtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  list: {
    gap: 0,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapResolved: {
    backgroundColor: '#ECFDF5',
  },
  iconWrapConfirm: {
    backgroundColor: '#E0F2FE',
  },
  iconWrapNew: {
    backgroundColor: '#FFEDD5',
  },
  contentCol: {
    flex: 1,
    gap: 2,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
    flex: 1,
    marginRight: 8,
  },
  itemTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  itemLocation: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
