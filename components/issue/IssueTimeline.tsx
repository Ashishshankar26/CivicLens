import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IssueTimelineStep } from '@/types/issue';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { CheckCircle2, Clock, CircleDot, AlertTriangle } from 'lucide-react-native';

interface IssueTimelineProps {
  timeline: IssueTimelineStep[];
}

export const IssueTimeline: React.FC<IssueTimelineProps> = ({ timeline }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>ISSUE HEALTH LIFECYCLE</Text>

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
                    <CheckCircle2 size={14} color="#FFFFFF" strokeWidth={2.5} />
                  ) : isCurrent ? (
                    <CircleDot size={14} color={COLORS.primary} />
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
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 12,
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
    width: 22,
  },
  nodeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeCompleted: {
    backgroundColor: COLORS.success,
  },
  nodeCurrent: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
  },
  connectorLine: {
    width: 2,
    height: 38,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  connectorCompleted: {
    backgroundColor: COLORS.success,
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
    color: COLORS.primaryDark,
    fontWeight: '900',
  },
  stepTimestamp: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  stepSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
});
