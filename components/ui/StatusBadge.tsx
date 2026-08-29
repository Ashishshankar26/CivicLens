import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IssueStatus } from '@/types/issue';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isActive = status === 'active';
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  return (
    <View
      style={[
        styles.badge,
        isActive ? styles.activeBadge : styles.resolvedBadge,
        size === 'sm' && styles.badgeSm,
        size === 'lg' && styles.badgeLg,
      ]}
    >
      {isActive ? (
        <AlertCircle size={iconSize} color={COLORS.active} strokeWidth={2.5} />
      ) : (
        <CheckCircle2 size={iconSize} color={COLORS.resolved} strokeWidth={2.5} />
      )}
      <Text
        style={[
          styles.text,
          isActive ? styles.activeText : styles.resolvedText,
          size === 'sm' && styles.textSm,
          size === 'lg' && styles.textLg,
        ]}
      >
        {isActive ? 'ACTIVE' : 'RESOLVED'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  badgeLg: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    gap: 6,
  },
  activeBadge: {
    backgroundColor: COLORS.activeLight,
  },
  resolvedBadge: {
    backgroundColor: COLORS.resolvedLight,
  },
  text: {
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 10,
  },
  textLg: {
    fontSize: 14,
  },
  activeText: {
    color: '#065F46', // Dark emerald
  },
  resolvedText: {
    color: '#334155', // Slate 700
  },
});
