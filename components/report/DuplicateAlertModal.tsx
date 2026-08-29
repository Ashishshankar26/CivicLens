import React from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { NearbyDuplicate } from '@/types/issue';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { formatDistance } from '@/utils/formatters';
import { AlertTriangle, ArrowRight, CheckCircle2, MapPin } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface DuplicateAlertModalProps {
  visible: boolean;
  duplicate: NearbyDuplicate | null;
  onViewExisting: (issueId: string) => void;
  onReportAnyway: () => void;
  onClose: () => void;
}

export const DuplicateAlertModal: React.FC<DuplicateAlertModalProps> = ({
  visible,
  duplicate,
  onViewExisting,
  onReportAnyway,
  onClose,
}) => {
  if (!duplicate) return null;

  const { issue, distanceMeters } = duplicate;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header Icon */}
          <View style={styles.warningHeader}>
            <View style={styles.warningIconCircle}>
              <AlertTriangle size={24} color="#D97706" />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.warningTitle}>NEARBY REPORT DETECTED</Text>
              <View style={styles.distanceRow}>
                <MapPin size={11} color={COLORS.primary} />
                <Text style={styles.distanceBadge}>
                  {formatDistance(distanceMeters)} away from your location
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.explanationText}>
            A similar <Text style={{ fontWeight: '800', color: COLORS.primaryDark }}>{issue.category.toUpperCase()}</Text> was recently reported at this location.
          </Text>

          {/* Existing Issue Preview Card */}
          <View style={styles.existingIssueCard}>
            <Image
              source={{ uri: issue.imageUrl }}
              style={styles.existingImage}
              resizeMode="cover"
            />
            <View style={styles.existingDetails}>
              <Text style={styles.existingDesc} numberOfLines={2}>
                "{issue.description}"
              </Text>
              <Text style={styles.existingConfirmations}>
                {issue.confirmationCount} community verifications
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.viewExistingBtn}
              onPress={() => onViewExisting(issue.id)}
              activeOpacity={0.85}
            >
              <CheckCircle2 size={16} color="#FFF" />
              <Text style={styles.viewExistingText}>View Existing Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportAnywayBtn}
              onPress={onReportAnyway}
              activeOpacity={0.8}
            >
              <Text style={styles.reportAnywayText}>Submit as New Report</Text>
              <ArrowRight size={14} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: Math.min(width - 40, 360),
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.floating,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  warningIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  headerTextCol: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  distanceBadge: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  explanationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  existingIssueCard: {
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  existingImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#0F172A',
  },
  existingDetails: {
    padding: 10,
    gap: 4,
  },
  existingDesc: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 16,
    fontWeight: '600',
  },
  existingConfirmations: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  actionButtons: {
    gap: 8,
  },
  viewExistingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: RADIUS.full,
    gap: 8,
    ...SHADOWS.small,
  },
  viewExistingText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  reportAnywayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceHighlight,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportAnywayText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
});
