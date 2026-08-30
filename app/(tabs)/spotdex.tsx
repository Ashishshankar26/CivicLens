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
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useIssues } from '@/contexts/IssuesContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUserReputation } from '@/services/gamification/gamificationService';
import { UserReputation, Badge } from '@/types/gamification';
import { BadgeDetailModal } from '@/components/gamification/BadgeDetailModal';
import { AllBadgesModal } from '@/components/gamification/AllBadgesModal';
import { RealBadgeEmblem } from '@/components/ui/RealBadgeEmblem';
import { IssueCompactCard } from '@/components/cards/IssueCompactCard';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import {
  Camera,
  Compass,
  Award,
  Wind,
  Search,
  Flame,
  Droplets,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  Plus,
  RefreshCw,
  Clock,
  MapPin,
  Sparkles,
  Lock,
} from 'lucide-react-native';

export default function SpotdexScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { issues, myReports, refreshIssues, isLoading } = useIssues();
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [registryScope, setRegistryScope] = useState<'my' | 'community'>('my');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [allBadgesModalVisible, setAllBadgesModalVisible] = useState<boolean>(false);

  useEffect(() => {
    loadReputationData();
  }, [user, myReports, issues]);

  const loadReputationData = async () => {
    const rep = await getUserReputation(user?.uid, myReports);
    setReputation(rep);
  };

  const totalUserLogged = myReports.length;
  const totalAreaHazards = issues.length;
  const potholeCount = issues.filter((i) => i.category === 'pothole').length || 14;
  const garbageCount = issues.filter((i) => i.category === 'garbage').length || 28;
  const roadDamageCount = issues.filter((i) => i.category === 'road_damage' || i.category === 'other').length || 12;

  const totalBadgesEarned = reputation?.badges.filter((b) => b.isUnlocked).length || 0;
  const totalBadgesCount = reputation?.badges.length || 54;
  const badgePercent = Math.round((totalBadgesEarned / totalBadgesCount) * 100);

  const verificationRate = issues.length > 0
    ? Math.round((issues.filter((i) => (i.confirmationCount || 0) > 0).length / issues.length) * 100)
    : 86;

  const currentDataset = registryScope === 'my' ? myReports : issues;

  const filteredLog = currentDataset.filter((i) => {
    if (logFilter === 'all') return true;
    return i.category === logFilter;
  });

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'ios' ? 4 : 8) }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshIssues} tintColor="#007AFF" />}
      >
        {/* ==========================================
            WIDGET 1: TOP HERO WIDGET (BEVEL HEALTH CARD)
            ========================================== */}
        <View style={styles.bevelHeroWidget}>
          {/* Top Header Row */}
          <View style={styles.bevelTopHeaderRow}>
            <Text style={styles.bevelWidgetTitle}>Today's SpotDex</Text>
            <View style={styles.bevelMetricPill}>
              <Text style={styles.bevelMetricValue}>876 Index</Text>
            </View>
          </View>

          {/* Middle Row: 3 Matrix Dots + Circular Score Ring */}
          <View style={styles.bevelMiddleRow}>
            {/* Left 3 Category Dot Columns */}
            <View style={styles.dotMatrixContainer}>
              {/* Category 1: Potholes */}
              <View style={styles.dotColGroup}>
                <View style={styles.dotGrid}>
                  {[...Array(12)].map((_, idx) => (
                    <View key={idx} style={[styles.matrixDot, { backgroundColor: '#3B82F6' }]} />
                  ))}
                </View>
                <View style={styles.dotLabelRow}>
                  <Text style={{ fontSize: 10 }}>🔵</Text>
                  <Text style={[styles.dotLabelText, { color: '#2563EB' }]}>{potholeCount}g</Text>
                </View>
              </View>

              {/* Category 2: Garbage */}
              <View style={styles.dotColGroup}>
                <View style={styles.dotGrid}>
                  {[...Array(16)].map((_, idx) => (
                    <View key={idx} style={[styles.matrixDot, { backgroundColor: '#F59E0B' }]} />
                  ))}
                </View>
                <View style={styles.dotLabelRow}>
                  <Text style={{ fontSize: 10 }}>🌾</Text>
                  <Text style={[styles.dotLabelText, { color: '#D97706' }]}>{garbageCount}g</Text>
                </View>
              </View>

              {/* Category 3: Road Damage */}
              <View style={styles.dotColGroup}>
                <View style={styles.dotGrid}>
                  {[...Array(14)].map((_, idx) => (
                    <View key={idx} style={[styles.matrixDot, { backgroundColor: '#EC4899' }]} />
                  ))}
                </View>
                <View style={styles.dotLabelRow}>
                  <Text style={{ fontSize: 10 }}>🥩</Text>
                  <Text style={[styles.dotLabelText, { color: '#DB2777' }]}>{roadDamageCount}g</Text>
                </View>
              </View>
            </View>

            {/* Right Speedometer Gauge Ring */}
            <View style={styles.scoreRingWidget}>
              <View style={styles.dashedRingOuter}>
                <Text style={styles.ringBigScore}>60</Text>
                <Text style={styles.ringScoreSub}>Fair</Text>
              </View>
            </View>
          </View>

          {/* Bottom Action Bar (5 Tool Segments) */}
          <View style={styles.bevelToolbarRow}>
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => router.push('/(tabs)/report')}
              activeOpacity={0.7}
            >
              <Camera size={18} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.7}
            >
              <Compass size={18} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => setAllBadgesModalVisible(true)}
              activeOpacity={0.7}
            >
              <Award size={18} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.7}
            >
              <Wind size={18} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => setRegistryScope(registryScope === 'my' ? 'community' : 'my')}
              activeOpacity={0.7}
            >
              <Search size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ==========================================
            WIDGET 2: NET SAFETY & GRADIENT SPECTRUM CARD
            ========================================== */}
        <View style={styles.bevelSpectrumWidget}>
          <View style={styles.spectrumHeaderRow}>
            <View>
              <Text style={styles.spectrumBigNumber}>67% Safety</Text>
              <Text style={styles.spectrumSubTitle}>Net Civic Impact</Text>
            </View>
            <View style={styles.spectrumBadgesRight}>
              <View style={styles.iconPillText}>
                <Flame size={13} color="#F97316" />
                <Text style={[styles.spectrumPillVal, { color: '#F97316' }]}>809</Text>
              </View>
              <View style={styles.iconPillText}>
                <ShieldCheck size={13} color="#3B82F6" />
                <Text style={[styles.spectrumPillVal, { color: '#3B82F6' }]}>876</Text>
              </View>
            </View>
          </View>

          {/* Continuous Multi-Color Spectrum Slider */}
          <View style={styles.spectrumTrackContainer}>
            <LinearGradient
              colors={['#FF9500', '#FCD34D', '#FFFFFF', '#A5B4FC', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bevelSpectrumBar}
            />
            {/* Center Thumb Marker */}
            <View style={styles.spectrumCenterThumb}>
              <Text style={styles.thumbCenterText}>0</Text>
            </View>
          </View>

          {/* Scale Ticks Row */}
          <View style={styles.scaleTicksRow}>
            <Text style={styles.scaleTickText}>-500</Text>
            <Text style={styles.scaleTickText}>-250</Text>
            <Text style={styles.scaleTickText}>0</Text>
            <Text style={styles.scaleTickText}>250</Text>
            <Text style={styles.scaleTickText}>500</Text>
          </View>
        </View>

        {/* ==========================================
            WIDGETS 3 & 4: MIDDLE 2-COLUMN GRID
            ========================================== */}
        <View style={styles.gridTwoColumns}>
          {/* Left Square Card (3 Concentric Progress Gauge Rings) */}
          <View style={styles.squareCardWidget}>
            <View style={styles.tripleGaugeHeader}>
              <Text style={styles.gaugeDateTitle}>Today</Text>
              <Text style={styles.gaugeDateSub}>{todayDateStr}</Text>
            </View>

            <View style={styles.tripleRingsContainer}>
              {/* Ring 1 (Top Right) */}
              <View style={[styles.miniRingWrapper, styles.miniRingTopRight]}>
                <View style={[styles.miniRingCircle, { borderColor: '#F59E0B' }]}>
                  <Text style={styles.miniRingText}>0%</Text>
                </View>
              </View>

              {/* Ring 2 (Bottom Left) */}
              <View style={[styles.miniRingWrapper, styles.miniRingBottomLeft]}>
                <View style={[styles.miniRingCircle, { borderColor: '#10B981' }]}>
                  <Text style={styles.miniRingText}>86%</Text>
                </View>
              </View>

              {/* Ring 3 (Bottom Right) */}
              <View style={[styles.miniRingWrapper, styles.miniRingBottomRight]}>
                <View style={[styles.miniRingCircle, { borderColor: '#6366F1' }]}>
                  <Text style={styles.miniRingText}>65%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Square Card (Single Focus Ring & Metrics) */}
          <View style={styles.squareCardWidget}>
            <View style={styles.singleRingCenterWrap}>
              <View style={styles.focusRingCircle}>
                <Text style={styles.focusRingScore}>85%</Text>
                <Text style={styles.focusRingLabel}>Resolved</Text>
              </View>
            </View>

            <View style={styles.focusCardFooterRow}>
              <View>
                <Text style={styles.focusFooterLabel}>Avg Speed</Text>
                <Text style={styles.focusFooterVal}>30m</Text>
              </View>
              <View>
                <Text style={styles.focusFooterLabel}>Fixed</Text>
                <Text style={styles.focusFooterVal}>808</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ==========================================
            WIDGETS 5 & 6: BOTTOM 2-COLUMN GRID
            ========================================== */}
        <View style={styles.gridTwoColumns}>
          {/* Left Square Card (Lush Green Karma Bank) */}
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.greenBankWidget}
          >
            <View style={styles.bankHeaderRow}>
              <Zap size={14} color="#FFFFFF" />
              <Text style={styles.bankTitleText}>Civic Karma Bank</Text>
            </View>

            <Text style={styles.bankBigPercent}>93%</Text>
            <Text style={styles.bankSubText}>Last updated: 100% active</Text>

            {/* Battery Bars Row */}
            <View style={styles.batteryBarsRow}>
              {[...Array(14)].map((_, i) => (
                <View key={i} style={[styles.batteryBarPill, i > 11 && { opacity: 0.4 }]} />
              ))}
            </View>

            {/* Bottom Badges Row */}
            <View style={styles.bankPillsRow}>
              <View style={styles.bankPillGreen}>
                <Text style={styles.bankPillGreenText}>+40% Verified</Text>
              </View>
              <View style={styles.bankPillRed}>
                <Text style={styles.bankPillRedText}>-7% Pending</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Right Square Card (Rain Depth & Drainage Risk Arc) */}
          <View style={styles.squareCardWidget}>
            <View style={styles.rainHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Droplets size={14} color="#0284C7" />
                <Text style={styles.rainTitle}>Rain Depth</Text>
              </View>
              <TouchableOpacity style={styles.rainResetBtn}>
                <RefreshCw size={12} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.rainBigValue}>1845.8 mm</Text>
            <Text style={styles.rainSubText}>154% monsoon threshold</Text>

            {/* Semi-Circular Arc Gauge */}
            <View style={styles.arcGaugeContainer}>
              <View style={styles.arcGaugeCircle}>
                <TouchableOpacity
                  style={styles.arcPlusBtn}
                  onPress={() => router.push('/(tabs)')}
                  activeOpacity={0.8}
                >
                  <Plus size={18} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ==========================================
            COMMUNITY LOGBOOK & HAZARDS REGISTRY
            ========================================== */}
        <View style={styles.logbookSection}>
          <View style={styles.logbookHeaderRow}>
            <Text style={styles.logbookMainTitle}>Civic Hazards Registry</Text>
            
            {/* Segmented Control Pill */}
            <View style={styles.scopeSegmentRow}>
              <TouchableOpacity
                style={[styles.scopeBtn, registryScope === 'my' && styles.scopeBtnActive]}
                onPress={() => setRegistryScope('my')}
                activeOpacity={0.8}
              >
                <Text style={[styles.scopeBtnText, registryScope === 'my' && styles.scopeBtnTextActive]}>
                  My Log ({myReports.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.scopeBtn, registryScope === 'community' && styles.scopeBtnActive]}
                onPress={() => setRegistryScope('community')}
                activeOpacity={0.8}
              >
                <Text style={[styles.scopeBtnText, registryScope === 'community' && styles.scopeBtnTextActive]}>
                  Community ({issues.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* List of Compact Cards */}
          {filteredLog.length === 0 ? (
            <View style={styles.emptyRegistryCard}>
              <Compass size={28} color="#94A3B8" />
              <Text style={styles.emptyRegistryTitle}>No Logged Hazards Yet</Text>
              <Text style={styles.emptyRegistrySub}>
                Be the first to report road hazards or pothole risks in your neighborhood.
              </Text>
              <TouchableOpacity
                style={styles.emptyReportBtn}
                onPress={() => router.push('/(tabs)/report')}
                activeOpacity={0.85}
              >
                <Camera size={15} color="#FFFFFF" />
                <Text style={styles.emptyReportBtnText}>Spot New Hazard</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredLog.slice(0, 8).map((issue) => (
              <IssueCompactCard
                key={issue.id}
                issue={issue}
                onPress={(id) => router.push(`/issue/${id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Badges Modals */}
      <BadgeDetailModal visible={Boolean(selectedBadge)} badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      <AllBadgesModal
        visible={allBadgesModalVisible}
        badges={reputation?.badges || []}
        onClose={() => setAllBadgesModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5EA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  /* Widget 1: Bevel Hero Widget */
  bevelHeroWidget: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  bevelTopHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bevelWidgetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  bevelMetricPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bevelMetricValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.4,
  },
  bevelMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotMatrixContainer: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-end',
  },
  dotColGroup: {
    gap: 6,
    alignItems: 'center',
  },
  dotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 44,
    gap: 3.5,
  },
  matrixDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dotLabelText: {
    fontSize: 11,
    fontWeight: '800',
  },
  scoreRingWidget: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedRingOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBigScore: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1C1C1E',
  },
  ringScoreSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
  },
  bevelToolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  toolbarBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },

  /* Widget 2: Bevel Spectrum Widget */
  bevelSpectrumWidget: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  spectrumHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  spectrumBigNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1C1C1E',
    letterSpacing: -0.6,
  },
  spectrumSubTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 1,
  },
  spectrumBadgesRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconPillText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spectrumPillVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  spectrumTrackContainer: {
    height: 18,
    marginTop: 6,
    justifyContent: 'center',
    position: 'relative',
  },
  bevelSpectrumBar: {
    height: 10,
    borderRadius: 5,
    width: '100%',
  },
  spectrumCenterThumb: {
    position: 'absolute',
    left: '50%',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbCenterText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366F1',
  },
  scaleTicksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  scaleTickText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
  },

  /* 2-Column Grid Layout */
  gridTwoColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  squareCardWidget: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 14,
    justifyContent: 'space-between',
    minHeight: 155,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  tripleGaugeHeader: {
    gap: 1,
  },
  gaugeDateTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8E8E93',
  },
  gaugeDateSub: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  tripleRingsContainer: {
    height: 80,
    position: 'relative',
  },
  miniRingWrapper: {
    position: 'absolute',
  },
  miniRingTopRight: {
    top: 0,
    right: 4,
  },
  miniRingBottomLeft: {
    bottom: 0,
    left: 4,
  },
  miniRingBottomRight: {
    bottom: 0,
    right: 4,
  },
  miniRingCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  miniRingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1C1C1E',
  },

  /* Single Focus Ring Card */
  singleRingCenterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  focusRingCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusRingScore: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1C1C1E',
  },
  focusRingLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8E93',
  },
  focusCardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  focusFooterLabel: {
    fontSize: 9.5,
    color: '#8E8E93',
    fontWeight: '600',
  },
  focusFooterVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1C1E',
  },

  /* Lush Green Karma Bank Widget */
  greenBankWidget: {
    flex: 1,
    borderRadius: 24,
    padding: 14,
    justifyContent: 'space-between',
    minHeight: 155,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  bankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bankTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bankBigPercent: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  bankSubText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  batteryBarsRow: {
    flexDirection: 'row',
    gap: 2.5,
    marginVertical: 4,
  },
  batteryBarPill: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  bankPillsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  bankPillGreen: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bankPillGreenText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bankPillRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bankPillRedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Rain Depth & Arc Widget */
  rainHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rainTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  rainResetBtn: {
    padding: 2,
  },
  rainBigValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1C1C1E',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  rainSubText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0284C7',
  },
  arcGaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  arcGaugeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#0284C7',
    borderBottomColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arcPlusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Logbook Section */
  logbookSection: {
    marginTop: 4,
    gap: 10,
  },
  logbookHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logbookMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.4,
  },
  scopeSegmentRow: {
    flexDirection: 'row',
    backgroundColor: '#7676801F',
    borderRadius: 9,
    padding: 2,
    gap: 2,
  },
  scopeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },
  scopeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scopeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3C3C4399',
  },
  scopeBtnTextActive: {
    color: '#007AFF',
    fontWeight: '700',
  },
  emptyRegistryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyRegistryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  emptyRegistrySub: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  emptyReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 6,
  },
  emptyReportBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
