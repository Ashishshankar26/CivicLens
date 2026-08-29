import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { MapPin, ShieldCheck, RefreshCw } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  activeCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'CivicLens',
  subtitle = 'See it. Report it. Improve it.',
  activeCount,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <View style={styles.brandRow}>
          <View style={styles.iconBadge}>
            <MapPin size={18} color="#FFF" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.verifiedPill}>
                <ShieldCheck size={11} color={COLORS.primary} />
                <Text style={styles.verifiedText}>COMMUNITY</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          {activeCount !== undefined && (
            <View style={styles.countBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.countText}>{activeCount} Active</Text>
            </View>
          )}

          {onRefresh && (
            <TouchableOpacity
              onPress={onRefresh}
              disabled={isRefreshing}
              style={styles.refreshBtn}
              activeOpacity={0.7}
            >
              <RefreshCw
                size={16}
                color={COLORS.textSecondary}
                style={isRefreshing ? styles.spinning : undefined}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    gap: 3,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.activeLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.active,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  refreshBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceHighlight,
  },
  spinning: {
    opacity: 0.5,
  },
});
