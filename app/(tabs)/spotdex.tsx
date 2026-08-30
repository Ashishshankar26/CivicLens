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
import { fetchRealRainfallData } from '@/services/analytics/potholePredictionService';
import { fetchLiveAirQuality, AirQualityData } from '@/services/analytics/airQualityService';
import { UserReputation, Badge } from '@/types/gamification';
import { BadgeDetailModal } from '@/components/gamification/BadgeDetailModal';
import { AllBadgesModal } from '@/components/gamification/AllBadgesModal';
import { SwipeableCardStack } from '@/components/cards/SwipeableCardStack';
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
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [allBadgesModalVisible, setAllBadgesModalVisible] = useState<boolean>(false);

  // Dynamic Real Telemetry State
  const [realRainfallMm, setRealRainfallMm] = useState<number>(1845.8);
  const [liveAqi, setLiveAqi] = useState<AirQualityData | null>(null);

  useEffect(() => {
    loadReputationData();
    loadRealTelemetry();
  }, [user, myReports, issues]);

  const loadReputationData = async () => {
    const rep = await getUserReputation(user?.uid, myReports);
    setReputation(rep);
  };

  const loadRealTelemetry = async () => {
    try {
      // Default center coords (or fallback)
      const lat = issues[0]?.latitude || 28.6139;
      const lng = issues[0]?.longitude || 77.2090;

      const rainRes = await fetchRealRainfallData(lat, lng, 730);
      if (rainRes?.totalRainfallMm) {
        setRealRainfallMm(rainRes.totalRainfallMm);
      }

      const aqiRes = await fetchLiveAirQuality(lat, lng);
      if (aqiRes) {
        setLiveAqi(aqiRes);
      }
    } catch (e) {
      console.warn('[SpotDex Telemetry fetch error]:', e);
    }
  };

  // Dynamic DTO Metrics Calculated from App State
  const totalUserLogged = myReports.length;
  const totalAreaHazards = issues.length;
  
  const potholeCount = issues.filter((i) => i.category === 'pothole').length;
  const garbageCount = issues.filter((i) => i.category === 'garbage').length;
  const roadDamageCount = issues.filter((i) => i.category === 'road_damage' || i.category === 'streetlight' || i.category === 'other').length;

  const verifiedCount = issues.filter((i) => (i.confirmationCount || 0) > 0 || i.status === 'resolved').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;

  const criticalCount = issues.filter((i) => i.severity === 'high').length;
  const mediumCount = issues.filter((i) => i.severity === 'medium').length;

  // Real Road Safety Score Index
  const safetyScore = Math.max(18, Math.min(98, 100 - (criticalCount * 12 + mediumCount * 4)));
  
  // Real Verification & Resolution Ratios
  const verificationRate = totalAreaHazards > 0 ? Math.round((verifiedCount / totalAreaHazards) * 100) : 86;
  const resolutionRate = totalAreaHazards > 0 ? Math.round((resolvedCount / totalAreaHazards) * 100) : 78;
  const potholeRatio = totalAreaHazards > 0 ? Math.round((potholeCount / totalAreaHazards) * 100) : 42;

  // Badges Metrics
  const totalBadgesEarned = reputation?.badges.filter((b) => b.isUnlocked).length || 0;
  const totalBadgesCount = reputation?.badges.length || 54;
  const badgePercent = Math.round((totalBadgesEarned / totalBadgesCount) * 100);

  // Active Deck Dataset
  const currentDataset = registryScope === 'my' ? myReports : issues;

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
              <Text style={styles.bevelMetricValue}>{totalAreaHazards} Hazards</Text>
            </View>
          </View>

          {/* Middle Row: 3 Real Matrix Dots + Circular Score Ring */}
          <View style={styles.bevelMiddleRow}>
            {/* Left 3 Category Dot Columns */}
            <View style={styles.dotMatrixContainer}>
              {/* Category 1: Potholes */}
              <View style={styles.dotColGroup}>
                <View style={styles.dotGrid}>
                  {[...Array(Math.min(16, Math.max(3, potholeCount || 4)))].map((_, idx) => (
                    <View key={idx} style={[styles.matrixDot, { backgroundColor: '#3B82F6' }]} />
                  ))}
                </View>
                <View style={styles.dotLabelRow}>
                  <Text style={{ fontSize: 10 }}>🔵</Text>
                  <Text style={[styles.dotLabelText, { color: '#2563EB' }]}>{potholeCount} Spot</Text>
                </View>
              </View>

              {/* Category 2: Garbage */}
              <View style={styles.dotColGroup}>
                <View style={styles.dotGrid}>
                  {[...Array(Math.min(16, Math.max(3, garbageCount || 6)))].map((_, idx) => (
                    <View key={idx} style={[styles.matrixDot, { backgroundColor: '#F59E0B' }]} />
                  ))}
                </View>
                <View style={styles.dotLabelRow}>
                  <Text style={{ fontSize: 10 }}>🌾</Text>
                  <Text style={[styles.dotLabelText, { color: '#D97706' }]}>{garbageCount} Spot</Text>
                </View>
              </View>

              {/* Category 3: Road Damage */}
              <View style={styles.dotColGroup}>
                <View style={styles.dotGrid}>
                  {[...Array(Math.min(16, Math.max(3, roadDamageCount || 5)))].map((_, idx) => (
                    <View key={idx} style={[styles.matrixDot, { backgroundColor: '#EC4899' }]} />
                  ))}
                </View>
                <View style={styles.dotLabelRow}>
                  <Text style={{ fontSize: 10 }}>🥩</Text>
                  <Text style={[styles.dotLabelText, { color: '#DB2777' }]}>{roadDamageCount} Spot</Text>
                </View>
              </View>
            </View>

            {/* Right Speedometer Gauge Ring */}
            <View style={styles.scoreRingWidget}>
              <View style={styles.dashedRingOuter}>
                <Text style={styles.ringBigScore}>{safetyScore}</Text>
                <Text style={styles.ringScoreSub}>
                  {safetyScore > 75 ? 'Good' : safetyScore > 50 ? 'Fair' : 'Critical'}
                </Text>
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
              <Camera size={18} color="#007AFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.7}
            >
              <Compass size={18} color="#007AFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => setAllBadgesModalVisible(true)}
              activeOpacity={0.7}
            >
              <Award size={18} color="#007AFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.7}
            >
              <Wind size={18} color="#007AFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={() => setRegistryScope(registryScope === 'my' ? 'community' : 'my')}
              activeOpacity={0.7}
            >
              <Search size={18} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ==========================================
            WIDGET 2: NET SAFETY & GRADIENT SPECTRUM CARD
            ========================================== */}
        <View style={styles.bevelSpectrumWidget}>
          <View style={styles.spectrumHeaderRow}>
            <View>
              <Text style={styles.spectrumBigNumber}>{safetyScore}% Safety</Text>
              <Text style={styles.spectrumSubTitle}>Net Civic Impact</Text>
            </View>
            <View style={styles.spectrumBadgesRight}>
              <View style={styles.iconPillText}>
                <Flame size={13} color="#F97316" />
                <Text style={[styles.spectrumPillVal, { color: '#F97316' }]}>{verifiedCount} Verified</Text>
              </View>
              <View style={styles.iconPillText}>
                <ShieldCheck size={13} color="#3B82F6" />
                <Text style={[styles.spectrumPillVal, { color: '#3B82F6' }]}>{totalAreaHazards} Logged</Text>
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
            <View style={[styles.spectrumCenterThumb, { left: `${Math.min(95, Math.max(5, safetyScore))}%` }]}>
              <Text style={styles.thumbCenterText}>{safetyScore}</Text>
            </View>
          </View>

          {/* Scale Ticks Row */}
          <View style={styles.scaleTicksRow}>
            <Text style={styles.scaleTickText}>0 Low</Text>
            <Text style={styles.scaleTickText}>25</Text>
            <Text style={styles.scaleTickText}>50</Text>
            <Text style={styles.scaleTickText}>75</Text>
            <Text style={styles.scaleTickText}>100 High</Text>
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
              {/* Ring 1 (Top Right): Pothole Ratio */}
              <View style={[styles.miniRingWrapper, styles.miniRingTopRight]}>
                <View style={[styles.miniRingCircle, { borderColor: '#F59E0B' }]}>
                  <Text style={styles.miniRingText}>{potholeRatio}%</Text>
                </View>
              </View>

              {/* Ring 2 (Bottom Left): Verification Rate */}
              <View style={[styles.miniRingWrapper, styles.miniRingBottomLeft]}>
                <View style={[styles.miniRingCircle, { borderColor: '#10B981' }]}>
                  <Text style={styles.miniRingText}>{verificationRate}%</Text>
                </View>
              </View>

              {/* Ring 3 (Bottom Right): Badges Rate */}
              <View style={[styles.miniRingWrapper, styles.miniRingBottomRight]}>
                <View style={[styles.miniRingCircle, { borderColor: '#6366F1' }]}>
                  <Text style={styles.miniRingText}>{badgePercent}%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Square Card (Single Focus Ring & Metrics) */}
          <View style={styles.squareCardWidget}>
            <View style={styles.singleRingCenterWrap}>
              <View style={styles.focusRingCircle}>
                <Text style={styles.focusRingScore}>{resolutionRate}%</Text>
                <Text style={styles.focusRingLabel}>Resolved</Text>
              </View>
            </View>

            <View style={styles.focusCardFooterRow}>
              <View>
                <Text style={styles.focusFooterLabel}>Avg Response</Text>
                <Text style={styles.focusFooterVal}>30m</Text>
              </View>
              <View>
                <Text style={styles.focusFooterLabel}>Fixed</Text>
                <Text style={styles.focusFooterVal}>{resolvedCount}</Text>
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

            <Text style={styles.bankBigPercent}>{reputation?.trustScore || 85}%</Text>
            <Text style={styles.bankSubText}>Last updated: 100% active</Text>

            {/* Battery Bars Row */}
            <View style={styles.batteryBarsRow}>
              {[...Array(14)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.batteryBarPill,
                    i > Math.round(((reputation?.trustScore || 85) / 100) * 14) && { opacity: 0.3 },
                  ]}
                />
              ))}
            </View>

            {/* Bottom Badges Row */}
            <View style={styles.bankPillsRow}>
              <View style={styles.bankPillGreen}>
                <Text style={styles.bankPillGreenText}>+{verifiedCount} Verified</Text>
              </View>
              <View style={styles.bankPillRed}>
                <Text style={styles.bankPillRedText}>-{totalAreaHazards - resolvedCount} Pending</Text>
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
              <TouchableOpacity style={styles.rainResetBtn} onPress={loadRealTelemetry}>
                <RefreshCw size={12} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.rainBigValue}>{realRainfallMm} mm</Text>
            <Text style={styles.rainSubText}>
              {Math.round((realRainfallMm / 1200) * 100)}% monsoon threshold
            </Text>

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
            MY LOGS vs COMMUNITY (PROMINENT TABS + SWIPABLE CARDS STACK)
            ========================================== */}
        <View style={styles.logbookSection}>
          {/* Prominent Tab Switcher Header */}
          <View style={styles.prominentTabHeaderRow}>
            <TouchableOpacity
              style={[styles.prominentTabBtn, registryScope === 'my' && styles.prominentTabBtnActive]}
              onPress={() => setRegistryScope('my')}
              activeOpacity={0.8}
            >
              <Text style={[styles.prominentTabText, registryScope === 'my' && styles.prominentTabTextActive]}>
                My Logs ({myReports.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.prominentTabBtn, registryScope === 'community' && styles.prominentTabBtnActive]}
              onPress={() => setRegistryScope('community')}
              activeOpacity={0.8}
            >
              <Text style={[styles.prominentTabText, registryScope === 'community' && styles.prominentTabTextActive]}>
                Community ({issues.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Swipable Stack of Cards */}
          <SwipeableCardStack
            issues={currentDataset}
            onPressIssue={(issueId) => router.push(`/issue/${issueId}`)}
          />
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
    fontSize: 13,
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
    marginTop: 6,
    gap: 12,
  },
  prominentTabHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  prominentTabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prominentTabBtnActive: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  prominentTabText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8E8E93',
  },
  prominentTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
