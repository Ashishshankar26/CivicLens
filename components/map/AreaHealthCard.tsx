import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { Shield, Activity, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react-native';

interface AreaHealthCardProps {
  areaName: string;
  healthScore: number; // 0 to 100
  activeCount: number;
  resolvedCount: number;
  urgentCount: number;
  isAuthorityMode: boolean;
  onToggleAuthorityMode: () => void;
}

export const AreaHealthCard: React.FC<AreaHealthCardProps> = ({
  areaName,
  healthScore,
  activeCount,
  resolvedCount,
  urgentCount,
  isAuthorityMode,
  onToggleAuthorityMode,
}) => {
  const getHealthColor = () => {
    if (healthScore >= 80) return '#10B981'; // Green
    if (healthScore >= 60) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const getHealthLabel = () => {
    if (healthScore >= 80) return 'Good Road Health';
    if (healthScore >= 60) return 'Moderate Infrastructure';
    return 'Action Needed';
  };

  return (
    <View style={styles.container}>
      {/* Top Telemetry Header */}
      <View style={styles.topRow}>
        <View style={styles.areaInfoCol}>
          <View style={styles.locationTitleRow}>
            <View style={[styles.statusDot, { backgroundColor: getHealthColor() }]} />
            <Text style={styles.areaTitle} numberOfLines={1}>
              {areaName || 'Urban District Intelligence'}
            </Text>
          </View>
          <Text style={styles.healthSub}>{getHealthLabel()}</Text>
        </View>

        {/* Score Circular Badge */}
        <View style={[styles.scoreBadge, { borderColor: getHealthColor() }]}>
          <Text style={[styles.scoreNumber, { color: getHealthColor() }]}>
            {healthScore}
          </Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
      </View>

      {/* Metric Mini Pills */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricVal}>{activeCount}</Text>
          <Text style={styles.metricLabel}>Active</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricVal, { color: '#EF4444' }]}>{urgentCount}</Text>
          <Text style={styles.metricLabel}>Urgent</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricVal, { color: '#10B981' }]}>{resolvedCount}</Text>
          <Text style={styles.metricLabel}>Fixed</Text>
        </View>

        {/* Mode Toggle Button */}
        <TouchableOpacity
          style={[styles.authorityToggle, isAuthorityMode && styles.authorityToggleActive]}
          onPress={onToggleAuthorityMode}
          activeOpacity={0.8}
        >
          <Shield size={12} color={isAuthorityMode ? '#FFFFFF' : COLORS.primaryDark} />
          <Text style={[styles.authorityText, isAuthorityMode && styles.authorityTextActive]}>
            {isAuthorityMode ? 'Authority Mode' : 'Citizen View'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    marginHorizontal: SPACING.md,
    marginTop: 8,
    borderRadius: RADIUS.lg,
    padding: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    ...SHADOWS.small,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  areaInfoCol: {
    flex: 1,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  areaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  healthSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 14,
    marginTop: 1,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: COLORS.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    gap: 1,
  },
  scoreNumber: {
    fontSize: 14,
    fontWeight: '900',
  },
  scoreMax: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHighlight,
    padding: 6,
    borderRadius: RADIUS.md,
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  metricLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
  },
  authorityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  authorityToggleActive: {
    backgroundColor: '#0F172A',
  },
  authorityText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  authorityTextActive: {
    color: '#FFFFFF',
  },
});
