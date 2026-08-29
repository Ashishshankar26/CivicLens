import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IssueSeverity } from '@/types/issue';
import { SEVERITIES } from '@/constants/severities';
import { RADIUS, SPACING } from '@/constants/theme';

interface SeverityBadgeProps {
  severity: IssueSeverity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
}) => {
  const meta = SEVERITIES[severity] || SEVERITIES.medium;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: meta.backgroundColor },
        size === 'sm' && styles.badgeSm,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text
        style={[
          styles.text,
          { color: meta.color },
          size === 'sm' && styles.textSm,
        ]}
      >
        {meta.label.toUpperCase()}
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
    gap: 5,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  textSm: {
    fontSize: 9,
  },
});
