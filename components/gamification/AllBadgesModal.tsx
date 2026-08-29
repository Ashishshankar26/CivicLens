import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, BadgeCategory } from '@/types/gamification';
import { RealBadgeEmblem } from '@/components/ui/RealBadgeEmblem';
import { BadgeDetailModal } from '@/components/gamification/BadgeDetailModal';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import {
  X,
  Sparkles,
  Lock,
  Compass,
  Construction,
  Lightbulb,
  Recycle,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Trophy,
  LucideIcon,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface CategoryMeta {
  id: BadgeCategory;
  title: string;
  subtitle: string;
  accentColor: string;
  headerBg: string;
  icon: LucideIcon;
}

const CATEGORY_SECTIONS: CategoryMeta[] = [
  {
    id: 'onboarding',
    title: 'Onboarding & Novice',
    subtitle: 'First steps on the scout trail',
    accentColor: '#0284C7',
    headerBg: '#E0F2FE',
    icon: Compass,
  },
  {
    id: 'potholes',
    title: 'Roads & Asphalt Guardians',
    subtitle: 'Crater spotters & surface medics',
    accentColor: '#EA580C',
    headerBg: '#FFEDD5',
    icon: Construction,
  },
  {
    id: 'lighting',
    title: 'Lighting & Night Operations',
    subtitle: 'Luminary spotters & dark watches',
    accentColor: '#D97706',
    headerBg: '#FEF3C7',
    icon: Lightbulb,
  },
  {
    id: 'waste',
    title: 'Sanitation & Cleanliness',
    subtitle: 'Eco sentinels & waste trackers',
    accentColor: '#059669',
    headerBg: '#ECFDF5',
    icon: Recycle,
  },
  {
    id: 'verification',
    title: 'Community Verifications',
    subtitle: 'Field inspectors & validators',
    accentColor: '#4F46E5',
    headerBg: '#EEF2FF',
    icon: ShieldCheck,
  },
  {
    id: 'resolution',
    title: 'Restorations & Repair Proof',
    subtitle: 'Repair witnesses & city restorers',
    accentColor: '#DB2777',
    headerBg: '#FCE7F3',
    icon: CheckCircle2,
  },
  {
    id: 'streak',
    title: 'Consistency & Streaks',
    subtitle: 'Daily momentum & weekend scouts',
    accentColor: '#DC2626',
    headerBg: '#FEE2E2',
    icon: Flame,
  },
  {
    id: 'milestones',
    title: 'Century Hexagons & AI Vision',
    subtitle: 'Milestone clubs & neural scans',
    accentColor: '#9333EA',
    headerBg: '#FAF5FF',
    icon: Trophy,
  },
];

interface AllBadgesModalProps {
  visible: boolean;
  badges: Badge[];
  onClose: () => void;
}

export const AllBadgesModal: React.FC<AllBadgesModalProps> = ({
  visible,
  badges,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  if (!visible) return null;

  const totalUnlocked = badges.filter((b) => b.isUnlocked).length;
  const totalBadges = badges.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Platform.OS === 'ios' ? 12 : insets.top + 8 }]}>
        {/* Top Drag Indicator */}
        <View style={styles.dragHandle} />

        {/* Top Modal Header */}
        <View style={styles.modalHeader}>
          <View style={styles.headerTitleCol}>
            <View style={styles.headerTagRow}>
              <Sparkles size={13} color={COLORS.primary} />
              <Text style={styles.headerTagText}>CITIZEN ACHIEVEMENTS</Text>
            </View>
            <Text style={styles.headerMainTitle}>All Badges ({totalBadges})</Text>
            <Text style={styles.headerSubtitle}>
              {totalUnlocked} of {totalBadges} unlocked • Tap any badge to see milestone targets
            </Text>
          </View>

          <TouchableOpacity
            style={styles.closeCircleBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <X size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Progress Pill Bar */}
        <View style={styles.progressSummaryCard}>
          <View style={styles.summaryTopRow}>
            <Text style={styles.summaryLabel}>Overall Mastery</Text>
            <Text style={styles.summaryPercent}>
              {Math.round((totalUnlocked / (totalBadges || 1)) * 100)}%
            </Text>
          </View>
          <View style={styles.summaryProgressBar}>
            <View
              style={[
                styles.summaryProgressFill,
                { width: `${Math.round((totalUnlocked / (totalBadges || 1)) * 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* Section-Wise Categorical Showcase */}
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {CATEGORY_SECTIONS.map((section) => {
            const sectionBadges = badges.filter((b) => b.category === section.id);
            if (sectionBadges.length === 0) return null;

            const unlockedInSection = sectionBadges.filter((b) => b.isUnlocked).length;

            return (
              <View key={section.id} style={styles.categoryBlock}>
                {/* Parallelogram / Angled Section Header Card */}
                <View style={styles.parallelogramCardWrapper}>
                  <View
                    style={[
                      styles.parallelogramHeaderCard,
                      {
                        backgroundColor: section.headerBg,
                        borderLeftColor: section.accentColor,
                      },
                    ]}
                  >
                    <View style={styles.categoryLeftContent}>
                      <View
                        style={[
                          styles.categoryEmojiBubble,
                          { backgroundColor: '#FFFFFF', borderColor: section.accentColor },
                        ]}
                      >
                        <section.icon size={15} color={section.accentColor} strokeWidth={2.4} />
                      </View>
                      <View style={styles.categoryTitleGroup}>
                        <Text style={[styles.categoryTitle, { color: section.accentColor }]}>
                          {section.title.toUpperCase()}
                        </Text>
                        <Text style={styles.categorySubtitle}>{section.subtitle}</Text>
                      </View>
                    </View>

                    {/* Unlocked Tally Pill */}
                    <View
                      style={[
                        styles.tallyPill,
                        {
                          backgroundColor: section.accentColor,
                        },
                      ]}
                    >
                      <Text style={styles.tallyPillText}>
                        {unlockedInSection}/{sectionBadges.length}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Badges Grid for this Category */}
                <View style={styles.badgesGrid}>
                  {sectionBadges.map((badge) => (
                    <TouchableOpacity
                      key={badge.id}
                      style={[
                        styles.badgeItemCard,
                        badge.isUnlocked && styles.badgeItemCardUnlocked,
                      ]}
                      onPress={() => setSelectedBadge(badge)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.emblemContainer}>
                        <RealBadgeEmblem id={badge.id} size={54} isUnlocked={badge.isUnlocked} />
                        {!badge.isUnlocked && (
                          <View style={styles.lockIconOverlay}>
                            <Lock size={8} color="#FFFFFF" />
                          </View>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.badgeItemTitle,
                          !badge.isUnlocked && { color: COLORS.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        {badge.title}
                      </Text>

                      <View
                        style={[
                          styles.statusChip,
                          badge.isUnlocked
                            ? { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }
                            : { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusChipText,
                            badge.isUnlocked ? { color: '#059669' } : { color: COLORS.textMuted },
                          ]}
                        >
                          {badge.isUnlocked
                            ? 'UNLOCKED'
                            : `${badge.currentCount || 0}/${badge.requiredCount || 1}`}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Selected Badge Interactive Detail Modal */}
        <BadgeDetailModal
          visible={Boolean(selectedBadge)}
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: 10,
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: 10,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  headerTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  headerMainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  progressSummaryCard: {
    marginHorizontal: SPACING.md,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  summaryPercent: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
  },
  summaryProgressBar: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  summaryProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3.5,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: 20,
    paddingTop: 4,
  },
  categoryBlock: {
    gap: 10,
  },
  parallelogramCardWrapper: {
    overflow: 'hidden',
    borderRadius: RADIUS.md,
  },
  parallelogramHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoryEmojiBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  categoryEmoji: {
    fontSize: 15,
  },
  categoryTitleGroup: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  categorySubtitle: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  tallyPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  tallyPillText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  badgeItemCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  badgeItemCardUnlocked: {
    borderColor: 'rgba(0, 102, 255, 0.25)',
    backgroundColor: '#FAFCFF',
  },
  emblemContainer: {
    position: 'relative',
    marginVertical: 4,
  },
  lockIconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeItemTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  statusChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 0.8,
  },
  statusChipText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
});
