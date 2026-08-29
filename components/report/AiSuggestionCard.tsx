import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IssueCategory, IssueSeverity } from '@/types/issue';
import { CATEGORIES } from '@/constants/categories';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { Sparkles, Check, Edit3, FileText } from 'lucide-react-native';

interface AiSuggestionCardProps {
  category: IssueCategory;
  confidence: number;
  label: string;
  suggestedSeverity?: IssueSeverity;
  suggestedDescription?: string;
  onAccept: (category: IssueCategory, severity?: IssueSeverity, description?: string) => void;
  onReject: () => void;
  isAccepted: boolean;
}

export const AiSuggestionCard: React.FC<AiSuggestionCardProps> = ({
  category,
  confidence,
  label,
  suggestedSeverity,
  suggestedDescription,
  onAccept,
  onReject,
  isAccepted,
}) => {
  const meta = CATEGORIES[category] || CATEGORIES.other;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <View style={[styles.container, isAccepted && styles.acceptedContainer]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Sparkles size={16} color={COLORS.primary} />
          <Text style={styles.title}>AI VISION DETECTION</Text>
        </View>
        <View style={styles.confidencePill}>
          <Text style={styles.confidenceText}>{confidencePercent}% confidence</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.categoryInfo}>
          <Text style={styles.detectedLabel}>{label}</Text>
          <Text style={styles.detectedDesc}>
            Suggested Category: <Text style={{ fontWeight: '700', color: meta.color }}>{meta.label}</Text>
            {suggestedSeverity ? ` • Severity: ${suggestedSeverity.toUpperCase()}` : ''}
          </Text>

          {suggestedDescription && (
            <View style={styles.descPreviewBox}>
              <Text style={styles.descPreviewLabel}>AI SUMMARY PREVIEW:</Text>
              <Text style={styles.descPreviewText} numberOfLines={2}>
                "{suggestedDescription}"
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.acceptBtn, isAccepted && styles.acceptedBtn]}
          onPress={() => onAccept(category, suggestedSeverity, suggestedDescription)}
          activeOpacity={0.8}
        >
          <Check size={14} color="#FFF" strokeWidth={2.5} />
          <Text style={styles.acceptText}>
            {isAccepted ? 'Suggestion & Summary Applied' : 'Apply AI Category & Summary'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.overrideBtn}
          onPress={onReject}
          activeOpacity={0.8}
        >
          <Edit3 size={14} color={COLORS.textSecondary} />
          <Text style={styles.overrideText}>Manual</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0FDFA', // Light teal
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#99F6E4',
    marginVertical: SPACING.sm,
  },
  acceptedContainer: {
    backgroundColor: '#ECFDF5', // Soft emerald
    borderColor: '#6EE7B7',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.6,
  },
  confidencePill: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  contentRow: {
    marginBottom: 12,
  },
  categoryInfo: {
    gap: 4,
  },
  detectedLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  detectedDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  descPreviewBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    padding: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginTop: 4,
    gap: 2,
  },
  descPreviewLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  descPreviewText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  acceptedBtn: {
    backgroundColor: COLORS.success,
  },
  acceptText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  overrideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  overrideText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
});
