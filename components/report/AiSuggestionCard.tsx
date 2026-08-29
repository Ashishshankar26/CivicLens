import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IssueCategory, IssueSeverity } from '@/types/issue';
import { CATEGORIES } from '@/constants/categories';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { Sparkles, Check, Edit3, ShieldAlert, RefreshCw, XCircle } from 'lucide-react-native';

interface AiSuggestionCardProps {
  isValidCivicIssue?: boolean;
  rejectionReason?: string;
  category?: IssueCategory;
  confidence: number;
  label: string;
  suggestedSeverity?: IssueSeverity;
  suggestedDescription?: string;
  onAccept: (category: IssueCategory, severity?: IssueSeverity, description?: string) => void;
  onReject: () => void;
  onRetakePhoto?: () => void;
  isAccepted: boolean;
}

export const AiSuggestionCard: React.FC<AiSuggestionCardProps> = ({
  isValidCivicIssue = true,
  rejectionReason,
  category = 'pothole',
  confidence,
  label,
  suggestedSeverity,
  suggestedDescription,
  onAccept,
  onReject,
  onRetakePhoto,
  isAccepted,
}) => {
  // If Gemini determined that the photo is NOT a valid civic issue (e.g. selfie, blank, indoor room, pet, food)
  if (!isValidCivicIssue) {
    return (
      <View style={styles.invalidContainer}>
        <View style={styles.invalidHeaderRow}>
          <View style={styles.invalidTitleRow}>
            <ShieldAlert size={16} color="#DC2626" />
            <Text style={styles.invalidTitle} numberOfLines={1}>AI VALIDATION</Text>
          </View>
          <View style={styles.rejectedPill}>
            <Text style={styles.rejectedPillText}>Issue Not Detected</Text>
          </View>
        </View>

        <View style={styles.invalidContent}>
          <Text style={styles.invalidHeading}>
            This photo cannot be submitted as a civic issue
          </Text>
          <Text style={styles.invalidReason}>
            {rejectionReason || 'The uploaded photo does not show a clear public road, lighting, or sanitation issue.'}
          </Text>
        </View>

        {onRetakePhoto && (
          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={onRetakePhoto}
            activeOpacity={0.85}
          >
            <RefreshCw size={14} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.retakeBtnText}>Retake / Upload Civic Issue Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const meta = CATEGORIES[category] || CATEGORIES.other;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <View style={[styles.container, isAccepted && styles.acceptedContainer]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Sparkles size={16} color={COLORS.primary} />
          <Text style={styles.title}>AI CLASSIFICATION</Text>
        </View>
        <View style={styles.confidencePill}>
          <Text style={styles.confidenceText}>{confidencePercent}% confidence</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.categoryInfo}>
          <Text style={styles.detectedLabel}>{label}</Text>
          <Text style={styles.detectedDesc}>
            Detected: <Text style={{ fontWeight: '700', color: meta.color }}>{meta.label}</Text>
            {suggestedSeverity ? ` • Severity: ${suggestedSeverity.toUpperCase()}` : ''}
          </Text>

          {suggestedDescription && (
            <View style={styles.descPreviewBox}>
              <Text style={styles.descPreviewLabel}>AI GENERATED SUMMARY:</Text>
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
            {isAccepted ? 'Suggestion Applied' : 'Apply AI Suggestion'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.overrideBtn}
          onPress={onReject}
          activeOpacity={0.8}
        >
          <Edit3 size={14} color={COLORS.textSecondary} />
          <Text style={styles.overrideText}>Edit Manually</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0FDFA',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#99F6E4',
    marginVertical: SPACING.sm,
  },
  acceptedContainer: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  invalidContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    marginVertical: SPACING.sm,
    gap: 10,
    ...SHADOWS.card,
  },
  invalidHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  invalidTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  invalidTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 0.5,
  },
  rejectedPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: RADIUS.full,
    borderWidth: 0.5,
    borderColor: '#FCA5A5',
  },
  rejectedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  invalidContent: {
    gap: 4,
  },
  invalidHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7F1D1D',
  },
  invalidReason: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 17,
  },
  retakeBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginTop: 4,
    ...SHADOWS.button,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },

  // Standard Suggestion Styles
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
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  descPreviewBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: RADIUS.sm,
    padding: 8,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  descPreviewLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  descPreviewText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  acceptedBtn: {
    backgroundColor: '#059669',
  },
  acceptText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  overrideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  overrideText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
