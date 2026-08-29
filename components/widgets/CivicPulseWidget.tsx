import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import { Activity, ShieldCheck, Flame, Users } from 'lucide-react-native';

interface CivicPulseWidgetProps {
  activeCount: number;
  confirmedCount: number;
  resolvedCount: number;
  districtName?: string;
}

export function CivicPulseWidget({
  activeCount,
  confirmedCount,
  resolvedCount,
  districtName = 'Local Area',
}: CivicPulseWidgetProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Activity size={15} color={COLORS.primary} />
          <Text style={styles.title}>Civic Pulse</Text>
        </View>
        <View style={styles.districtPill}>
          <Text style={styles.districtText} numberOfLines={1}>
            {districtName}
          </Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {/* Metric 1: Active Hazards */}
        <View style={[styles.metricBox, styles.metricBoxActive]}>
          <View style={styles.metricIconWrapActive}>
            <Flame size={14} color="#EA580C" />
          </View>
          <Text style={styles.metricValue}>{activeCount}</Text>
          <Text style={styles.metricLabel}>Active Hazards</Text>
        </View>

        {/* Metric 2: Verified */}
        <View style={[styles.metricBox, styles.metricBoxConfirm]}>
          <View style={styles.metricIconWrapConfirm}>
            <Users size={14} color="#0284C7" />
          </View>
          <Text style={styles.metricValue}>{confirmedCount}</Text>
          <Text style={styles.metricLabel}>Verifications</Text>
        </View>

        {/* Metric 3: Resolved */}
        <View style={[styles.metricBox, styles.metricBoxResolved]}>
          <View style={styles.metricIconWrapResolved}>
            <ShieldCheck size={14} color="#059669" />
          </View>
          <Text style={styles.metricValue}>{resolvedCount}</Text>
          <Text style={styles.metricLabel}>Resolved</Text>
        </View>
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
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  districtPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  districtText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    padding: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    gap: 2,
  },
  metricBoxActive: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  metricBoxConfirm: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  metricBoxResolved: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  metricIconWrapActive: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricIconWrapConfirm: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricIconWrapResolved: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
