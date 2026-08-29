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
  const iconSize = size === 'sm' ? 11 : size === 'lg' ? 16 : 13;

  return (
    <View
      style={[
        styles.badge,
        isActive ? styles.activeBadge : styles.resolvedBadge,
        size === 'sm' && styles.badgeSm,
        size === 'lg' && styles.badgeLg,
      ]}
    >
      {isActive && <View style={[styles.liveDot, size === 'sm' && styles.liveDotSm]} />}
      {isActive ? (
        <AlertCircle size={iconSize} color="#DC2626" strokeWidth={2.5} />
      ) : (
        <CheckCircle2 size={iconSize} color="#059669" strokeWidth={2.5} />
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
    paddingVertical: 2.5,
    gap: 3,
  },
  badgeLg: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    gap: 6,
  },
  activeBadge: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  resolvedBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  text: {
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 9.5,
  },
  textLg: {
    fontSize: 13,
  },
  activeText: {
    color: '#DC2626',
  },
  resolvedText: {
    color: '#059669',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EF4444',
  },
  liveDotSm: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
