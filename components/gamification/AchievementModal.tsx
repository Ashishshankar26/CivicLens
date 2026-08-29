import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Badge } from '@/types/gamification';
import { RealBadgeEmblem } from '@/components/ui/RealBadgeEmblem';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { CheckCircle2, ShieldCheck, Sparkles, Award, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface AchievementModalProps {
  visible: boolean;
  unlockedBadge?: Badge | null;
  leveledUp?: boolean;
  newLevelTitle?: string;
  onClose: () => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  visible,
  unlockedBadge,
  leveledUp,
  newLevelTitle,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.modalCard,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Glowing Triple Ring Celebration Header */}
          <View style={styles.glowHeaderWrapper}>
            <View style={styles.pulseOuterRing} />
            <View style={styles.pulseMiddleRing} />
            <View style={styles.glowCenterCircle}>
              {unlockedBadge ? (
                <RealBadgeEmblem id={unlockedBadge.id} size={74} isUnlocked={true} />
              ) : leveledUp ? (
                <Award size={38} color="#0066FF" strokeWidth={2.4} />
              ) : (
                <CheckCircle2 size={38} color="#0066FF" strokeWidth={2.4} />
              )}
            </View>
          </View>

          {/* Celebration Header */}
          <View style={styles.celebrationPill}>
            <Sparkles size={12} color="#0066FF" />
            <Text style={styles.celebrationPillText}>
              {leveledUp
                ? 'CITIZEN LEVEL UPGRADE'
                : unlockedBadge
                ? 'NEW BADGE UNLOCKED'
                : 'COMMUNITY CONTRIBUTION LOGGED'}
            </Text>
          </View>

          <Text style={styles.celebrationTitle}>
            {leveledUp
              ? 'Level Promoted!'
              : unlockedBadge
              ? unlockedBadge.title
              : 'Action Verified & Recorded!'}
          </Text>

          {/* Unlocked Badge Detail Card */}
          {unlockedBadge && (
            <View style={styles.badgeDetailBox}>
              <Text style={styles.badgeRewardTag}>
                Tier: {unlockedBadge.tier?.toUpperCase() || 'BRONZE'} • {unlockedBadge.rewardTitle || 'Citizen Scout'}
              </Text>
              <Text style={styles.badgeDesc}>{unlockedBadge.description}</Text>
            </View>
          )}

          {/* Level Progression Card */}
          {leveledUp && (
            <View style={styles.levelDetailBox}>
              <Text style={styles.levelSub}>New Citizen Rank</Text>
              <Text style={styles.newLevelName}>{newLevelTitle || 'Road Guardian 🛡️'}</Text>
              <Text style={styles.levelHint}>
                Your road verifications carry higher community weight.
              </Text>
            </View>
          )}

          {!unlockedBadge && !leveledUp && (
            <Text style={styles.generalSubText}>
              Your on-site observation helps fellow citizens stay alert and safe on city roadways.
            </Text>
          )}

          {/* High-Contrast Action Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onClose}
            activeOpacity={0.88}
          >
            <Text style={styles.actionBtnText}>Continue Scouting</Text>
          </TouchableOpacity>
        </Animated.View>
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
    alignItems: 'center',
    ...SHADOWS.floating,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  glowHeaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    position: 'relative',
    height: 100,
    width: 100,
  },
  pulseOuterRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
  },
  pulseMiddleRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(0, 102, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 102, 255, 0.35)',
  },
  glowCenterCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0066FF',
    ...SHADOWS.medium,
  },
  badgeEmojiBig: {
    fontSize: 34,
  },
  celebrationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 6,
  },
  celebrationPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: 0.6,
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  badgeDetailBox: {
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.lg,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 6,
    gap: 4,
  },
  badgeRewardTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  badgeDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  levelDetailBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.lg,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginVertical: 6,
    gap: 2,
  },
  levelSub: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  newLevelName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  levelHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  generalSubText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginVertical: 6,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: RADIUS.full,
    width: '100%',
    alignItems: 'center',
    marginTop: 14,
    ...SHADOWS.small,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
});
