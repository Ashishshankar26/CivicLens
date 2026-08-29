import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IssueTimelineStep } from '@/types/issue';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { CheckCircle2, CircleDot, Activity, ShieldCheck } from 'lucide-react-native';

interface IssueTimelineProps {
  timeline: IssueTimelineStep[];
}

export const IssueTimeline: React.FC<IssueTimelineProps> = ({ timeline }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Activity size={16} color={COLORS.primary} strokeWidth={2.4} />
          <Text style={styles.sectionTitle}>LIFECYCLE TIMELINE</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>LIVE TELEMETRY</Text>
        </View>
      </View>

      <View style={styles.timelineList}>
        {timeline.map((step, idx) => {
          const isLast = idx === timeline.length - 1;
          const isCompleted = step.completed;
          const isCurrent = step.current;

          return (
            <View key={step.id} style={styles.stepRow}>
              {/* Indicator Column */}
              <View style={styles.indicatorCol}>
                <View
                  style={[
                    styles.nodeCircle,
                    isCompleted && styles.nodeCompleted,
                    isCurrent && styles.nodeCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={13} color="#FFFFFF" strokeWidth={2.8} />
                  ) : isCurrent ? (
                    <CircleDot size={13} color="#FFFFFF" strokeWidth={2.8} />
                  ) : (
                    <View style={styles.emptyDot} />
                  )}
                </View>

                {!isLast && (
                  <View
                    style={[
                      styles.connectorLine,
                      isCompleted && styles.connectorCompleted,
                    ]}
                  />
                )}
              </View>

              {/* Text Column */}
              <View style={styles.textCol}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isCompleted && styles.stepTitleCompleted,
                      isCurrent && styles.stepTitleCurrent,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.stepTimestamp}>{step.timestamp}</Text>
                </View>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  liveBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  timelineList: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 24,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
    ...SHADOWS.subtle,
  },
  nodeCurrent: {
    backgroundColor: COLORS.primary,
    borderColor: '#0047B3',
    ...SHADOWS.subtle,
  },
  emptyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#94A3B8',
  },
  connectorLine: {
    width: 2,
    height: 38,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  connectorCompleted: {
    backgroundColor: '#10B981',
  },
  textCol: {
    flex: 1,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  stepTitleCompleted: {
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  stepTitleCurrent: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  stepTimestamp: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  stepSubtitle: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 1,
  },
});
