import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useIssues } from '@/contexts/IssuesContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUserReputation } from '@/services/gamification/gamificationService';
import { UserReputation, Badge } from '@/types/gamification';
import { BadgeDetailModal } from '@/components/gamification/BadgeDetailModal';
import { RealBadgeEmblem } from '@/components/ui/RealBadgeEmblem';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { formatRelativeTime } from '@/utils/formatters';
import {
  LayoutGrid,
  Route,
  Sparkles,
  Award,
  CheckCircle2,
  ChevronRight,
  Lock,
  CircleDotDashed,
  Recycle,
  Lightbulb,
  Construction,
  TriangleAlert,
  BadgeCheck,
  Compass,
  Plus,
  User,
  Globe,
} from 'lucide-react-native';

export default function SpotdexScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { issues, myReports, refreshIssues, isLoading } = useIssues();
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [topSegment, setTopSegment] = useState<'grid' | 'route'>('grid');
  const [registryScope, setRegistryScope] = useState<'my' | 'community'>('my');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    loadReputationData();
  }, [user, myReports, issues]);

  const loadReputationData = async () => {
    const rep = await getUserReputation(user?.uid);
    setReputation(rep);
  };

  const totalUserLogged = myReports.length;
  const totalAreaHazards = issues.length;
  const totalSightings = issues.reduce((acc, i) => acc + (i.confirmationCount || 0), 0);
  const totalPhotos = myReports.filter((i) => Boolean(i.imageUrl)).length;
  const totalBadgesEarned = reputation?.badges.filter((b) => b.isUnlocked).length || 0;
  const totalBadgesCount = reputation?.badges.length || 10;

  const percentClaimed = totalAreaHazards > 0
    ? Math.min(100, Math.round((totalUserLogged / totalAreaHazards) * 100))
    : 0;

  const newestPersonalEntry = myReports[0];

  const currentDataset = registryScope === 'my' ? myReports : issues;

  const filteredLog = currentDataset.filter((i) => {
    if (logFilter === 'all') return true;
    return i.category === logFilter;
  });

  const renderCategoryIcon = (cat: string, size = 22, color = '#0066FF') => {
    switch (cat) {
      case 'pothole':
        return <CircleDotDashed size={size} color={color} strokeWidth={2.4} />;
      case 'garbage':
        return <Recycle size={size} color={color} strokeWidth={2.4} />;
      case 'streetlight':
        return <Lightbulb size={size} color={color} strokeWidth={2.4} />;
      case 'road_damage':
        return <Construction size={size} color={color} strokeWidth={2.4} />;
      default:
        return <TriangleAlert size={size} color={color} strokeWidth={2.4} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'ios' ? 4 : 8) }]}>
      {/* TOP DYNAMIC PILL TOGGLE */}
      <View style={styles.topPillContainer}>
        <View style={styles.topPillSegment}>
          <TouchableOpacity
            style={[styles.topPillBtn, topSegment === 'grid' && styles.topPillBtnActive]}
            onPress={() => setTopSegment('grid')}
            activeOpacity={0.8}
          >
            <LayoutGrid size={17} color={topSegment === 'grid' ? '#FFFFFF' : COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topPillBtn, topSegment === 'route' && styles.topPillBtnActive]}
            onPress={() => setTopSegment('route')}
            activeOpacity={0.8}
          >
            <Route size={17} color={topSegment === 'route' ? '#FFFFFF' : COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={async () => {
              await refreshIssues();
              await loadReputationData();
            }}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* SPOTDEX HERO CARD (Live dynamic metrics) */}
        <View style={styles.heroCard}>
          <View style={styles.heroCardHeader}>
            <View style={styles.heroTitleRow}>
              <Sparkles size={14} color={COLORS.primary} />
              <Text style={styles.heroSubHeading}>CIVICDEX</Text>
            </View>
            <View style={styles.gridIconCircle}>
              <LayoutGrid size={15} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.heroCountText}>{totalUserLogged} spotted</Text>
          <View style={styles.heroProgressRow}>
            <Text style={styles.heroProgressSub}>
              {totalUserLogged} of {totalAreaHazards} district entries logged
            </Text>
            <Text style={styles.heroPercentText}>{percentClaimed}%</Text>
          </View>

          {/* Electric Blue Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${Math.max(6, percentClaimed)}%` }]} />
          </View>

          {/* 4 Telemetry Metrics */}
          <View style={styles.telemetryGrid}>
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryNum}>{totalUserLogged}</Text>
              <Text style={styles.telemetryLabel}>discovered</Text>
            </View>
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryNum}>{totalSightings}</Text>
              <Text style={styles.telemetryLabel}>sightings</Text>
            </View>
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryNum}>{totalPhotos}</Text>
              <Text style={styles.telemetryLabel}>photos</Text>
            </View>
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryNum}>{totalBadgesEarned}</Text>
              <Text style={styles.telemetryLabel}>badges</Text>
            </View>
          </View>
        </View>

        {/* LATEST DISCOVERY CARD (Personal Discovery or Starter Prompt) */}
        {newestPersonalEntry ? (
          <TouchableOpacity
            style={styles.newestCard}
            onPress={() =>
              router.push({
                pathname: '/issue/[id]',
                params: { id: newestPersonalEntry.id },
              })
            }
            activeOpacity={0.85}
          >
            <View style={styles.newestBadge}>
              <Sparkles size={11} color={COLORS.primary} />
              <Text style={styles.newestBadgeText}>YOUR LATEST DISCOVERY</Text>
            </View>

            <View style={styles.newestIconCenter}>
              <View
                style={[
                  styles.newestIconWrap,
                  {
                    backgroundColor:
                      newestPersonalEntry.category === 'pothole'
                        ? '#EFF6FF'
                        : newestPersonalEntry.category === 'garbage'
                        ? '#ECFDF5'
                        : newestPersonalEntry.category === 'streetlight'
                        ? '#FEF3C7'
                        : '#FEE2E2',
                  },
                ]}
              >
                {renderCategoryIcon(
                  newestPersonalEntry.category,
                  36,
                  newestPersonalEntry.category === 'pothole'
                    ? '#0066FF'
                    : newestPersonalEntry.category === 'garbage'
                    ? '#059669'
                    : newestPersonalEntry.category === 'streetlight'
                    ? '#D97706'
                    : '#DC2626'
                )}
              </View>
            </View>

            <Text style={styles.newestTitle} numberOfLines={1}>
              {newestPersonalEntry.locationName || 'Local Roadway Hazard'}
            </Text>
            <View style={styles.newestFooterRow}>
              <Text style={styles.newestSub}>
                {newestPersonalEntry.category.toUpperCase()} • Priority {newestPersonalEntry.priorityScore || 75}/100
              </Text>
              <Text style={styles.newestTime}>{formatRelativeTime(newestPersonalEntry.createdAt)}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.starterDiscoveryCard}>
            <View style={styles.starterIconCircle}>
              <Compass size={28} color={COLORS.primary} strokeWidth={2.2} />
            </View>
            <Text style={styles.starterTitle}>No Discoveries Logged Yet</Text>
            <Text style={styles.starterSub}>
              Spot a pothole, waste pile, or dark street lamp to record your first field discovery.
            </Text>
            <TouchableOpacity
              style={styles.starterActionBtn}
              onPress={() => router.push('/(tabs)/report')}
              activeOpacity={0.8}
            >
              <Plus size={15} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.starterActionText}>Report a Hazard</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* BADGES SECTION WITH INTERACTIVE MODAL */}
        <View style={styles.badgesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Badges & Milestones</Text>
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.badgesCountSub}>
            {totalBadgesEarned} of {totalBadgesCount} earned • Tap any badge to view milestone
          </Text>
          <Text style={styles.nextBadgeHint}>
            Level {reputation?.level || 1}: {reputation?.levelTitle || 'Novice Scout'}
          </Text>

          {/* Badges Horizontal Row with Live Progress */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
            {reputation?.badges.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={styles.badgeItem}
                onPress={() => setSelectedBadge(b)}
                activeOpacity={0.75}
              >
                <View style={styles.badgeEmblemWrapper}>
                  <RealBadgeEmblem id={b.id} size={54} isUnlocked={b.isUnlocked} />
                  {!b.isUnlocked && (
                    <View style={styles.lockBadgeMini}>
                      <Lock size={9} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Text style={[styles.badgeLabel, !b.isUnlocked && { color: COLORS.textMuted }]} numberOfLines={1}>
                  {b.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* CIVIC FIELD REGISTRY (Dynamic Scope + Filters) */}
        <View style={styles.logbookSection}>
          <View style={styles.logbookTitleRow}>
            <Text style={styles.sectionTitle}>Civic Field Registry</Text>
            <View style={styles.countBubble}>
              <Text style={styles.countBubbleText}>{currentDataset.length}</Text>
            </View>
          </View>
          <Text style={styles.logbookSub}>
            {registryScope === 'my'
              ? 'Your personal catalog of reported road hazards and confirmed sightings.'
              : 'Public district-wide feed of reported road issues and verified repairs.'}
          </Text>

          {/* Scope Segment Selector: My Discoveries vs Citywide Feed */}
          <View style={styles.scopeSegmentRow}>
            <TouchableOpacity
              style={[styles.scopeBtn, registryScope === 'my' && styles.scopeBtnActive]}
              onPress={() => setRegistryScope('my')}
              activeOpacity={0.8}
            >
              <User size={13} color={registryScope === 'my' ? '#FFFFFF' : COLORS.textSecondary} />
              <Text style={[styles.scopeBtnText, registryScope === 'my' && styles.scopeBtnTextActive]}>
                My Discoveries ({myReports.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scopeBtn, registryScope === 'community' && styles.scopeBtnActive]}
              onPress={() => setRegistryScope('community')}
              activeOpacity={0.8}
            >
              <Globe size={13} color={registryScope === 'community' ? '#FFFFFF' : COLORS.textSecondary} />
              <Text style={[styles.scopeBtnText, registryScope === 'community' && styles.scopeBtnTextActive]}>
                Citywide Feed ({issues.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.logFilterRow}>
            <TouchableOpacity
              style={[styles.filterPill, logFilter === 'all' && styles.filterPillActive]}
              onPress={() => setLogFilter('all')}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterPillText, logFilter === 'all' && styles.filterPillTextActive]}>
                All {currentDataset.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, logFilter === 'pothole' && styles.filterPillActive]}
              onPress={() => setLogFilter('pothole')}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterPillText, logFilter === 'pothole' && styles.filterPillTextActive]}>
                Potholes ({currentDataset.filter((i) => i.category === 'pothole').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, logFilter === 'garbage' && styles.filterPillActive]}
              onPress={() => setLogFilter('garbage')}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterPillText, logFilter === 'garbage' && styles.filterPillTextActive]}>
                Waste ({currentDataset.filter((i) => i.category === 'garbage').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, logFilter === 'streetlight' && styles.filterPillActive]}
              onPress={() => setLogFilter('streetlight')}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterPillText, logFilter === 'streetlight' && styles.filterPillTextActive]}>
                Lighting ({currentDataset.filter((i) => i.category === 'streetlight').length})
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* REGISTRY GRID CARDS OR EMPTY STATE */}
          {filteredLog.length === 0 ? (
            <View style={styles.emptyRegistryCard}>
              <Compass size={32} color={COLORS.textMuted} strokeWidth={1.8} />
              <Text style={styles.emptyRegistryTitle}>
                {registryScope === 'my' ? 'No Personal Discoveries Yet' : 'No District Hazards Found'}
              </Text>
              <Text style={styles.emptyRegistrySub}>
                {registryScope === 'my'
                  ? 'Submit your first road issue report to record an entry in your personal catalog.'
                  : 'No hazards found for the selected category filter.'}
              </Text>
              {registryScope === 'my' && (
                <TouchableOpacity
                  style={styles.emptyReportBtn}
                  onPress={() => router.push('/(tabs)/report')}
                  activeOpacity={0.8}
                >
                  <Plus size={14} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.emptyReportBtnText}>Report Road Hazard</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.logGrid}>
              {filteredLog.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.logCard}
                  onPress={() =>
                    router.push({
                      pathname: '/issue/[id]',
                      params: { id: item.id },
                    })
                  }
                  activeOpacity={0.85}
                >
                  <View style={styles.logCardTop}>
                    <Text style={styles.logCardNum}>#{String(idx + 1).padStart(3, '0')}</Text>
                    {item.status === 'resolved' ? (
                      <BadgeCheck size={16} color="#10B981" />
                    ) : (
                      <View style={[styles.activeDot, { backgroundColor: (item.priorityScore || 50) >= 80 ? '#EF4444' : '#0066FF' }]} />
                    )}
                  </View>

                  <View
                    style={[
                      styles.logIconBox,
                      {
                        backgroundColor:
                          item.category === 'pothole'
                            ? '#EFF6FF'
                            : item.category === 'garbage'
                            ? '#ECFDF5'
                            : item.category === 'streetlight'
                            ? '#FEF3C7'
                            : '#FEE2E2',
                      },
                    ]}
                  >
                    {renderCategoryIcon(
                      item.category,
                      26,
                      item.category === 'pothole'
                        ? '#0066FF'
                        : item.category === 'garbage'
                        ? '#059669'
                        : item.category === 'streetlight'
                        ? '#D97706'
                        : '#DC2626'
                    )}
                  </View>

                  <Text style={styles.logCardTitle} numberOfLines={1}>
                    {item.locationName}
                  </Text>
                  <Text style={styles.logCardTime}>{formatRelativeTime(item.createdAt)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* BADGE INSPECTION MODAL */}
      <BadgeDetailModal
        visible={Boolean(selectedBadge)}
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topPillContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  topPillSegment: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.full,
    padding: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  topPillBtn: {
    width: 44,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topPillBtnActive: {
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  heroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroSubHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  gridIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCountText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  heroProgressSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  heroPercentText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceHighlight,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  telemetryGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  telemetryCol: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryNum: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  telemetryLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  newestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  newestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
    marginBottom: 12,
  },
  newestBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: 0.6,
  },
  newestIconCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  newestIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newestTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  newestFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  newestSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  newestTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  badgesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  badgesCountSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  nextBadgeHint: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 2,
    marginBottom: 12,
  },
  badgesRow: {
    gap: 14,
    paddingVertical: 4,
  },
  badgeItem: {
    alignItems: 'center',
    gap: 6,
    width: 68,
  },
  badgeEmblemWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRingLocked: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
  },
  lockBadgeMini: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  logbookSection: {
    marginTop: 4,
    gap: 8,
  },
  logbookTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBubble: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  countBubbleText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  logbookSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  logFilterRow: {
    gap: 8,
    marginVertical: 4,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  logGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  logCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  logCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  logCardNum: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  logIconBox: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    marginBottom: 8,
  },
  logCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  logCardTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  starterDiscoveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    textAlign: 'center',
    gap: 8,
    ...SHADOWS.subtle,
  },
  starterIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  starterTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  starterSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.md,
  },
  starterActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    marginTop: 6,
    ...SHADOWS.small,
  },
  starterActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scopeSegmentRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: 4,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 4,
  },
  scopeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  scopeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  scopeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  scopeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  emptyRegistryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
    ...SHADOWS.subtle,
  },
  emptyRegistryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptyRegistrySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.sm,
  },
  emptyReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    marginTop: 6,
  },
  emptyReportBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
