import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import {
  getLiveLeaderboard,
  getUserReputation,
} from '@/services/gamification/gamificationService';
import { LeaderboardUser, UserReputation } from '@/types/gamification';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import {
  Trophy,
  Crown,
  Medal,
  Shield,
  Flame,
  Star,
  Zap,
} from 'lucide-react-native';

export default function ModernLeaderboardScreen() {
  const { user } = useAuth();
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [rep, lead] = await Promise.all([
          getUserReputation(user?.uid),
          getLiveLeaderboard(),
        ]);
        setReputation(rep);
        setLeaderboard(lead);
      } catch (err) {
        console.warn('Leaderboard fetch notice:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  const top3 = leaderboard.slice(0, 3);
  const restUsers = leaderboard.slice(3);

  const currentUserEntry = leaderboard.find((u) => u.id === user?.uid);
  const currentUserRank = currentUserEntry ? `#${currentUserEntry.rank}` : '#1';
  const userLevel = reputation?.level || 1;
  const userLevelTitle = reputation?.levelTitle || 'Novice Scout 🌱';
  const userPoints = currentUserEntry
    ? currentUserEntry.points
    : (reputation?.reportsCount || 0) * 50 + (reputation?.confirmationsCount || 0) * 25 + (reputation?.resolvedCount || 0) * 100;
  const userStreakWeeks = reputation?.streakWeeks || (reputation?.streakDays ? Math.floor(reputation.streakDays / 7) : 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Sleek Minimal Top App Bar */}
      <View style={styles.header}>
        <View style={styles.headerIconBox}>
          <Trophy size={20} color={COLORS.primary} />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>District Leaderboard</Text>
          <Text style={styles.headerSub}>
            Top verified citizen road scouts & active contributors
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TOP 3 PODIUM */}
        <View style={styles.podiumWrapper}>
          {/* Rank 2 - Silver */}
          {top3[1] && (
            <View style={styles.podiumItem}>
              <View style={[styles.avatarRing, { borderColor: '#94A3B8' }]}>
                <Text style={styles.avatarRankText}>2</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {top3[1].displayName}
              </Text>
              <Text style={styles.podiumPoints}>{top3[1].points.toLocaleString()} pts</Text>
              <View style={[styles.podiumStand, styles.stand2]}>
                <Medal size={22} color="#64748B" />
                <Text style={styles.standRankLabel}>#2</Text>
              </View>
            </View>
          )}

          {/* Rank 1 - Gold (Elevated Center) */}
          {top3[0] && (
            <View style={[styles.podiumItem, styles.podiumItemGold]}>
              <Crown size={24} color="#D97706" style={styles.crownFloat} />
              <View style={[styles.avatarRing, styles.avatarGold]}>
                <Text style={[styles.avatarRankText, { color: '#B45309', fontSize: 18 }]}>1</Text>
              </View>
              <Text style={[styles.podiumName, styles.podiumNameGold]} numberOfLines={1}>
                {top3[0].displayName}
              </Text>
              <View style={styles.goldPointsPill}>
                <Star size={11} color="#B45309" />
                <Text style={styles.goldPointsText}>{top3[0].points.toLocaleString()} pts</Text>
              </View>
              <View style={[styles.podiumStand, styles.stand1]}>
                <Trophy size={28} color="#D97706" />
                <Text style={[styles.standRankLabel, { color: '#B45309', fontSize: 16 }]}>#1</Text>
              </View>
            </View>
          )}

          {/* Rank 3 - Bronze */}
          {top3[2] && (
            <View style={styles.podiumItem}>
              <View style={[styles.avatarRing, { borderColor: '#B45309' }]}>
                <Text style={[styles.avatarRankText, { color: '#B45309' }]}>3</Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {top3[2].displayName}
              </Text>
              <Text style={styles.podiumPoints}>{top3[2].points.toLocaleString()} pts</Text>
              <View style={[styles.podiumStand, styles.stand3]}>
                <Medal size={22} color="#B45309" />
                <Text style={[styles.standRankLabel, { color: '#B45309' }]}>#3</Text>
              </View>
            </View>
          )}
        </View>

        {/* RANKINGS LIST */}
        {restUsers.length > 0 && (
          <>
            <Text style={styles.listSectionHeading}>DISTRICT COMMUNITY RANKINGS</Text>
            <View style={styles.listCard}>
              {restUsers.map((item) => {
                const isMe = item.id === user?.uid;
                return (
                  <View
                    key={item.id}
                    style={[styles.rankRow, isMe && styles.rankRowMe]}
                  >
                    <View style={[styles.rankBadge, isMe && styles.rankBadgeMe]}>
                      <Text style={[styles.rankBadgeNum, isMe && styles.rankBadgeNumMe]}>
                        #{item.rank}
                      </Text>
                    </View>

                    <View style={styles.rankInfoCol}>
                      <View style={styles.rankNameRow}>
                        <Text style={[styles.rankName, isMe && styles.rankNameMe]}>
                          {item.displayName}
                        </Text>
                        {isMe && (
                          <View style={styles.meTag}>
                            <Text style={styles.meTagText}>YOU</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.rankLevelSub}>{item.levelTitle}</Text>
                    </View>

                    {/* Trust Score */}
                    <View style={styles.trustScorePill}>
                      <Shield size={11} color={COLORS.primary} />
                      <Text style={styles.trustScoreText}>{item.trustScore}</Text>
                    </View>

                    {/* Points */}
                    <View style={styles.pointsCol}>
                      <Text style={styles.pointsVal}>{item.points.toLocaleString()}</Text>
                      <Text style={styles.pointsLabel}>pts</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* STICKY BOTTOM USER STATUS CARD */}
      <View style={styles.stickyBar}>
        <View style={styles.stickyRankCircle}>
          <Text style={styles.stickyRankNum}>{currentUserRank}</Text>
        </View>

        <View style={styles.stickyInfoCol}>
          <Text style={styles.stickyName}>{user?.displayName || 'Citizen Scout'}</Text>
          <Text style={styles.stickySub}>
            Level {userLevel}: {userLevelTitle} • {userPoints.toLocaleString()} pts
          </Text>
        </View>

        <View style={styles.streakPill}>
          <Flame size={14} color="#DC2626" />
          <Text style={styles.streakText}>{userStreakWeeks}w streak</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 90,
  },
  podiumWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginVertical: SPACING.md,
    gap: 8,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumItemGold: {
    marginBottom: 0,
  },
  crownFloat: {
    marginBottom: 4,
  },
  avatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    ...SHADOWS.small,
    marginBottom: 6,
  },
  avatarGold: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: '#F59E0B',
    borderWidth: 3,
  },
  avatarRankText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  podiumNameGold: {
    fontSize: 13,
    color: '#92400E',
  },
  podiumPoints: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  goldPointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    gap: 3,
    marginBottom: 8,
  },
  goldPointsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  podiumStand: {
    width: '100%',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  stand1: {
    height: 100,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  stand2: {
    height: 80,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  stand3: {
    height: 65,
    backgroundColor: '#FFEDD5',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  standRankLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textSecondary,
  },
  listSectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 10,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 12,
  },
  rankRowMe: {
    backgroundColor: COLORS.primaryLight,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeMe: {
    backgroundColor: COLORS.primary,
  },
  rankBadgeNum: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textSecondary,
  },
  rankBadgeNumMe: {
    color: '#FFFFFF',
  },
  rankInfoCol: {
    flex: 1,
    gap: 1,
  },
  rankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  rankNameMe: {
    color: COLORS.primaryDark,
  },
  meTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
  },
  meTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  rankLevelSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  trustScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    gap: 3,
  },
  trustScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  pointsCol: {
    alignItems: 'flex-end',
    minWidth: 50,
  },
  pointsVal: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  pointsLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...SHADOWS.floating,
  },
  stickyRankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyRankNum: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  stickyInfoCol: {
    flex: 1,
  },
  stickyName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  stickySub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
});
