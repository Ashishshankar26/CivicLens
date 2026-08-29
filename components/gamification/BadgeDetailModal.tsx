import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Badge } from '@/types/gamification';
import { RealBadgeEmblem } from '@/components/ui/RealBadgeEmblem';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { CheckCircle2, Lock, Sparkles, X, Target } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface BadgeDetailModalProps {
  visible: boolean;
  badge: Badge | null;
  onClose: () => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  visible,
  badge,
  onClose,
}) => {
  if (!badge) return null;

  const current = badge.currentCount || 0;
  const required = badge.requiredCount || 1;
  const progressPercent = Math.min(100, Math.round((current / required) * 100));

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'master':
        return '#EC4899';
      case 'diamond':
        return '#6366F1';
      case 'platinum':
        return '#0284C7';
      case 'gold':
        return '#D97706';
      case 'silver':
        return '#64748B';
      case 'bronze':
      default:
        return '#0066FF';
    }
  };

  const tierColor = getTierColor(badge.tier);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Glowing Badge Ring */}
          <View style={styles.badgeRingWrapper}>
            <RealBadgeEmblem id={badge.id} size={86} isUnlocked={badge.isUnlocked} />
          </View>

          {/* Title & Status */}
          <View style={styles.badgeHeaderCol}>
            <View style={[styles.tierTag, badge.isUnlocked ? styles.tierUnlocked : styles.tierLocked]}>
              <Sparkles size={11} color={badge.isUnlocked ? tierColor : COLORS.textMuted} />
              <Text style={[styles.tierTagText, { color: badge.isUnlocked ? tierColor : COLORS.textMuted }]}>
                {badge.tier?.toUpperCase() || 'BRONZE'} TIER
              </Text>
            </View>
            <Text style={styles.badgeTitle}>{badge.title}</Text>
            <Text style={styles.badgeRewardTitle}>Reward: {badge.rewardTitle || 'Member Scout'}</Text>
          </View>

          {/* Description */}
          <Text style={styles.badgeDescription}>{badge.description}</Text>

          {/* Progress or Unlocked Banner */}
          {badge.isUnlocked ? (
            <View style={styles.unlockedBox}>
              <CheckCircle2 size={18} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.unlockedTitle}>Milestone Achieved!</Text>
                <Text style={styles.unlockedSub}>
                  Unlocked on {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : 'Verified'}.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.progressBox}>
              <View style={styles.progressHeaderRow}>
                <View style={styles.progressTargetRow}>
                  <Target size={13} color={COLORS.primary} />
                  <Text style={styles.progressTargetText}>Progress to Unlock</Text>
                </View>
                <Text style={styles.progressNumText}>
                  {current} / {required} ({progressPercent}%)
                </Text>
              </View>

              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${Math.max(8, progressPercent)}%` }]} />
              </View>

              <Text style={styles.remainingHint}>
                Need {Math.max(0, required - current)} more completed actions to unlock this badge.
              </Text>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Close</Text>
          </TouchableOpacity>
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
  card: {
    width: Math.min(width - 40, 360),
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.floating,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  badgeRingWrapper: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  outerGlowRing: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  glowBlue: {
    backgroundColor: '#DBEAFE',
  },
  glowLocked: {
    backgroundColor: '#E2E8F0',
  },
  badgeIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
  },
  badgeUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  badgeLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    opacity: 0.8,
  },
  badgeHeaderCol: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  tierTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  tierUnlocked: {
    backgroundColor: COLORS.primaryLight,
  },
  tierLocked: {
    backgroundColor: '#F1F5F9',
  },
  tierTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  badgeTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  badgeRewardTitle: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  badgeDescription: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  unlockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.lg,
    padding: 12,
    gap: 10,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  unlockedTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#065F46',
  },
  unlockedSub: {
    fontSize: 10.5,
    color: '#047857',
    marginTop: 1,
  },
  progressBox: {
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.lg,
    padding: 12,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressTargetText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  progressNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  remainingHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: RADIUS.full,
    width: '100%',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
});
