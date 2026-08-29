import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserReputation } from '@/types/gamification';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import {
  Flame,
  Star,
  Shield,
  Trophy,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react-native';

interface ImpactStatsCardProps {
  reputation: UserReputation;
  rank?: number;
  onViewLeaderboard?: () => void;
}

export const ImpactStatsCard: React.FC<ImpactStatsCardProps> = ({
  reputation,
  rank = 4,
  onViewLeaderboard,
}) => {
  const xp = reputation.xp || 750;
  const nextXp = reputation.nextLevelXp || 1000;
  const xpPercent = Math.min(100, Math.round((xp / nextXp) * 100));

  return (
    <View style={styles.card}>
      {/* Top Banner Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.sectionHeader}>YOUR CIVIC IMPACT</Text>
          <Text style={styles.levelTitle}>{reputation.levelTitle}</Text>
        </View>

        <View style={styles.rankPill}>
          <Trophy size={13} color="#D97706" />
          <Text style={styles.rankText}>Rank #{rank}</Text>
        </View>
      </View>

      {/* 4-Metric Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Flame size={15} color="#DC2626" />
          </View>
          <Text style={styles.statNumber}>{reputation.streakWeeks} Wks</Text>
          <Text style={styles.statLabel}>Active Streak</Text>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Star size={15} color="#D97706" />
          </View>
          <Text style={styles.statNumber}>{(reputation.points || 1250).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Civic Points</Text>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
            <Shield size={15} color="#059669" />
          </View>
          <Text style={styles.statNumber}>{reputation.trustScore}/100</Text>
          <Text style={styles.statLabel}>Trust Score</Text>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryLight }]}>
            <Zap size={15} color={COLORS.primaryDark} />
          </View>
          <Text style={styles.statNumber}>{reputation.reportsCount}</Text>
          <Text style={styles.statLabel}>Verified Fixes</Text>
        </View>
      </View>

      {/* Level XP Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Level {reputation.level} Progress</Text>
          <Text style={styles.progressValue}>
            {reputation.xp} / {reputation.nextLevelXp} XP
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${xpPercent}%` }]} />
        </View>
      </View>

      {/* View Leaderboard CTA */}
      {onViewLeaderboard && (
        <TouchableOpacity
          style={styles.leaderboardBtn}
          onPress={onViewLeaderboard}
          activeOpacity={0.8}
        >
          <Text style={styles.leaderboardBtnText}>View Citizen Leaderboard</Text>
          <ChevronRight size={15} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
    marginVertical: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleCol: {
    gap: 1,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  levelTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.md,
    padding: 8,
    alignItems: 'center',
    gap: 2,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.md,
    padding: 10,
    gap: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  progressValue: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  progressBarTrack: {
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
  },
  leaderboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 4,
  },
  leaderboardBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
});
