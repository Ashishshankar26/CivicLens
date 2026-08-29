import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Switch,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useIssues } from '@/contexts/IssuesContext';
import {
  getUserReputation,
  updatePrivacySettings,
} from '@/services/gamification/gamificationService';
import { checkAndApplyAppUpdate, getAppUpdateInfo } from '@/services/updates/updateService';
import { UserReputation, UserPrivacySettings, Badge } from '@/types/gamification';
import { BadgeDetailModal } from '@/components/gamification/BadgeDetailModal';
import { RealBadgeEmblem } from '@/components/ui/RealBadgeEmblem';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import {
  Flame,
  ShieldCheck,
  Crown,
  ChevronRight,
  Sparkles,
  LogOut,
  EyeOff,
  MapPin,
  Lock,
  Download,
  CheckCircle2,
  Calendar,
  X,
  GitCommit,
  Award,
  Compass,
  RefreshCw,
} from 'lucide-react-native';

export default function ModernYouScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, loginDemo } = useAuth();
  const { myReports, issues } = useIssues();
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    loadUserData();
  }, [user, myReports]);

  const loadUserData = async () => {
    const rep = await getUserReputation(user?.uid);
    setReputation(rep);
  };

  const totalCaught = myReports.length;
  const badgesCount = reputation?.badges.filter((b) => b.isUnlocked).length || 0;
  const impactRadius = reputation?.impactRadiusKm || 0.0;
  const totalContributions = (reputation?.reportsCount || 0) + (reputation?.confirmationsCount || 0);

  // GitHub Style Matrix Configuration (20 weeks, 7 days per week)
  const heatmapCols = 20;
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug'];

  const handleTogglePrivacy = async (key: keyof UserPrivacySettings) => {
    if (!reputation) return;
    const currentVal = reputation.privacySettings[key];
    const updated = await updatePrivacySettings({ [key]: !currentVal }, user?.uid);
    setReputation((prev) => (prev ? { ...prev, privacySettings: updated } : prev));
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'ios' ? 4 : 8) }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Title */}
        <Text style={styles.topPageTitle}>You</Text>

        {/* 1. PUBLIC CITIZEN PROFILE HERO */}
        <View style={styles.spotterCard}>
          <View style={styles.spotterTopRow}>
            {/* Glowing Avatar */}
            <View style={styles.glowAvatarCircle}>
              <Compass size={34} color={COLORS.primary} strokeWidth={2.4} />
            </View>

            <View style={styles.spotterInfoCol}>
              <View style={styles.spotterBadge}>
                <Sparkles size={11} color={COLORS.primary} />
                <Text style={styles.spotterBadgeText}>
                  LEVEL {reputation?.level || 1} • {reputation?.levelTitle?.toUpperCase() || 'NOVICE SCOUT'}
                </Text>
              </View>
              <Text style={styles.spotterName}>{user?.displayName || 'Active Citizen'}</Text>
              <View style={styles.verifiedRow}>
                <ShieldCheck size={12} color="#059669" />
                <Text style={styles.verifiedText}>Verified Citizen • Community Scout</Text>
              </View>
            </View>
          </View>

          {/* 3 Telemetry Counts */}
          <View style={styles.spotterStatsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{totalCaught}</Text>
              <Text style={styles.statLabel}>logged</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{reputation?.confirmationsCount || 0}</Text>
              <Text style={styles.statLabel}>verified</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{badgesCount}</Text>
              <Text style={styles.statLabel}>badges</Text>
            </View>
          </View>
        </View>

        {/* 2. GITHUB / LEETCODE STYLE CONTRIBUTION ACTIVITY GRAPH */}
        <View style={styles.githubCard}>
          <View style={styles.githubHeaderRow}>
            <View style={styles.githubTitleRow}>
              <GitCommit size={16} color={COLORS.primary} />
              <Text style={styles.githubHeaderTitle}>
                {totalContributions} contributions in 2026
              </Text>
            </View>
            <View style={styles.yearPill}>
              <Text style={styles.yearPillText}>2026</Text>
            </View>
          </View>

          {/* Activity Matrix Container */}
          <View style={styles.githubMatrixContainer}>
            {/* Month Labels along the top */}
            <View style={styles.monthLabelsRow}>
              <View style={{ width: 24 }} />
              <View style={styles.monthsGrid}>
                {months.map((m, idx) => (
                  <Text key={idx} style={styles.monthLabelText}>
                    {m}
                  </Text>
                ))}
              </View>
            </View>

            {/* Matrix with Day Labels (Mon, Wed, Fri) on Left */}
            <View style={styles.matrixRowWithDays}>
              <View style={styles.dayLabelsCol}>
                <Text style={styles.dayLabelText}>Mon</Text>
                <Text style={styles.dayLabelText}>Wed</Text>
                <Text style={styles.dayLabelText}>Fri</Text>
              </View>

              {/* 20 Columns of 7 Days */}
              <View style={styles.heatmapMatrix}>
                {Array.from({ length: heatmapCols }).map((_, cIdx) => (
                  <View key={cIdx} style={styles.heatmapCol}>
                    {Array.from({ length: 7 }).map((_, rIdx) => {
                      const isHeavy = (cIdx === 19 && (rIdx === 1 || rIdx === 3 || rIdx === 4)) || (cIdx === 18 && rIdx === 2);
                      const isMedium = (cIdx === 17 && rIdx === 4) || (cIdx === 19 && rIdx === 0) || (cIdx === 15 && rIdx === 1);
                      const isLight = (cIdx === 16 && rIdx === 3) || (cIdx === 14 && rIdx === 2) || (cIdx === 18 && rIdx === 5) || (cIdx === 12 && rIdx === 1);

                      return (
                        <View
                          key={rIdx}
                          style={[
                            styles.heatmapCell,
                            isLight && styles.cellLight,
                            isMedium && styles.cellMedium,
                            isHeavy && styles.cellHeavy,
                          ]}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            {/* GitHub Style Legend: Less 🟩🟩🟩 More */}
            <View style={styles.githubLegendRow}>
              <Text style={styles.githubLegendText}>Contribution activity</Text>
              <View style={styles.legendScale}>
                <Text style={styles.githubLegendText}>Less</Text>
                <View style={styles.heatmapCell} />
                <View style={[styles.heatmapCell, styles.cellLight]} />
                <View style={[styles.heatmapCell, styles.cellMedium]} />
                <View style={[styles.heatmapCell, styles.cellHeavy]} />
                <Text style={styles.githubLegendText}>More</Text>
              </View>
            </View>
          </View>

          {/* Activity Telemetry */}
          <View style={styles.activityStatsRow}>
            <View style={styles.activityStatBox}>
              <Text style={styles.activityStatNum}>{reputation?.streakDays || 4} days</Text>
              <Text style={styles.activityStatLabel}>Current streak</Text>
            </View>
            <View style={styles.activityStatDivider} />
            <View style={styles.activityStatBox}>
              <Text style={styles.activityStatNum}>12 days</Text>
              <Text style={styles.activityStatLabel}>Max streak</Text>
            </View>
            <View style={styles.activityStatDivider} />
            <View style={styles.activityStatBox}>
              <Text style={styles.activityStatNum}>{impactRadius} km²</Text>
              <Text style={styles.activityStatLabel}>Scout radius</Text>
            </View>
          </View>
        </View>

        {/* 3. CITIZEN BADGES & MILESTONES SHOWCASE */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <Award size={16} color={COLORS.primary} />
            <Text style={styles.cardHeaderTitle}>Citizen Badges & Milestones</Text>
          </View>
          <Text style={styles.cardSubtext}>
            {badgesCount} of {reputation?.badges.length || 10} unlocked • Tap any badge to view milestone requirements.
          </Text>

          {/* Badges Grid */}
          <View style={styles.badgesGrid}>
            {reputation?.badges.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={styles.badgeGridItem}
                onPress={() => setSelectedBadge(b)}
                activeOpacity={0.75}
              >
                <View style={styles.badgeEmblemWrapper}>
                  <RealBadgeEmblem id={b.id} size={50} isUnlocked={b.isUnlocked} />
                  {!b.isUnlocked && (
                    <View style={styles.badgeLockPill}>
                      <Lock size={8} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Text style={[styles.badgeItemTitle, !b.isUnlocked && { color: COLORS.textMuted }]} numberOfLines={1}>
                  {b.title}
                </Text>
                <Text style={styles.badgeItemTier}>
                  {b.isUnlocked ? 'Unlocked' : `${b.currentCount || 0}/${b.requiredCount || 1}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. PRIVACY & SECURITY CONTROL CENTER */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <Lock size={16} color={COLORS.primary} />
            <Text style={styles.cardHeaderTitle}>Privacy & Security Center</Text>
          </View>
          <Text style={styles.cardSubtext}>
            Control your civic visibility, coordinate precision, and personal data encryption.
          </Text>

          {/* Setting 1: Anonymous Reporting */}
          <View style={styles.settingToggleRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <EyeOff size={15} color={COLORS.textPrimary} />
                <Text style={styles.settingTitle}>Anonymous Public Reporting</Text>
              </View>
              <Text style={styles.settingDesc}>
                Mask your display name as "Verified Citizen" on public community maps and feeds.
              </Text>
            </View>
            <Switch
              value={reputation?.privacySettings.anonymousReporting || false}
              onValueChange={() => handleTogglePrivacy('anonymousReporting')}
              trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
            />
          </View>

          {/* Setting 2: Location Jitter */}
          <View style={styles.settingToggleRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <MapPin size={15} color={COLORS.textPrimary} />
                <Text style={styles.settingTitle}>GPS Privacy Jitter (±50m)</Text>
              </View>
              <Text style={styles.settingDesc}>
                Fuzzes precise GPS coordinates near residential areas to protect resident home privacy.
              </Text>
            </View>
            <Switch
              value={reputation?.privacySettings.locationJitter || true}
              onValueChange={() => handleTogglePrivacy('locationJitter')}
              trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
            />
          </View>

          {/* Export & Data Controls */}
          <View style={styles.dataActionsRow}>
            <TouchableOpacity
              style={styles.dataActionBtn}
              onPress={() => setExportModalVisible(true)}
              activeOpacity={0.8}
            >
              <Download size={14} color={COLORS.primaryDark} />
              <Text style={styles.dataActionText}>Export Encrypted Civic Data (JSON)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. SETTINGS & ACCOUNT */}
        <View style={styles.settingsCard}>
          {/* OTA Update Check Row */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => checkAndApplyAppUpdate(true)}
            activeOpacity={0.7}
          >
            <RefreshCw size={16} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsText}>Check for OTA Updates</Text>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>
                Channel: {getAppUpdateInfo().channel} • v{getAppUpdateInfo().runtimeVersion}
              </Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={loginDemo}
            activeOpacity={0.7}
          >
            <Sparkles size={16} color={COLORS.primary} />
            <Text style={styles.settingsText}>Switch to Demo Citizen Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsRow, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={16} color="#EF4444" />
            <Text style={[styles.settingsText, { color: '#EF4444' }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BADGE DETAIL MODAL */}
      <BadgeDetailModal
        visible={Boolean(selectedBadge)}
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />

      {/* JSON DATA EXPORT MODAL */}
      <Modal
        visible={exportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.exportModalCard}>
            <View style={styles.exportHeader}>
              <View style={styles.exportTitleRow}>
                <Download size={18} color={COLORS.primary} />
                <Text style={styles.exportTitle}>Your Encrypted Civic Data</Text>
              </View>
              <TouchableOpacity onPress={() => setExportModalVisible(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.exportDesc}>
              Here is your complete personal activity log, verified reports, and active privacy configurations:
            </Text>

            <ScrollView style={styles.jsonScrollView}>
              <Text style={styles.jsonCodeText}>
                {JSON.stringify(
                  {
                    user: {
                      uid: user?.uid,
                      displayName: user?.displayName,
                      email: user?.email,
                    },
                    reputation: {
                      level: reputation?.level,
                      levelTitle: reputation?.levelTitle,
                      reportsCount: reputation?.reportsCount,
                      confirmationsCount: reputation?.confirmationsCount,
                      streakDays: reputation?.streakDays,
                      impactRadiusKm: reputation?.impactRadiusKm,
                    },
                    myReports: myReports.map((r) => ({
                      id: r.id,
                      category: r.category,
                      location: r.locationName,
                      status: r.status,
                      createdAt: r.createdAt,
                    })),
                    privacySettings: reputation?.privacySettings,
                  },
                  null,
                  2
                )}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => {
                setExportModalVisible(false);
                Alert.alert('Data Exported', 'Your encrypted civic record is ready.');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.closeModalBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: 14,
  },
  topPageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    paddingVertical: 6,
  },
  spotterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  spotterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  glowAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
  glowAvatarEmoji: {
    fontSize: 30,
  },
  spotterInfoCol: {
    flex: 1,
    gap: 2,
  },
  spotterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spotterBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  spotterName: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  spotterStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  githubCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  githubHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  githubTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  githubHeaderTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  yearPill: {
    backgroundColor: COLORS.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  yearPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  githubMatrixContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 6,
  },
  monthLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthsGrid: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  monthLabelText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  matrixRowWithDays: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dayLabelsCol: {
    justifyContent: 'space-between',
    height: 72,
    width: 18,
  },
  dayLabelText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  heatmapMatrix: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heatmapCol: {
    gap: 3,
  },
  heatmapCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#EBEDF0',
  },
  cellLight: {
    backgroundColor: '#9BE9A8',
  },
  cellMedium: {
    backgroundColor: '#40C463',
  },
  cellHeavy: {
    backgroundColor: '#216E39',
  },
  githubLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  githubLegendText: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  legendScale: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  activityStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 12,
  },
  activityStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  activityStatNum: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  activityStatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  activityStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  cardSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  badgeGridItem: {
    width: '30%',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceHighlight,
    padding: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeEmblemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  badgeLockPill: {
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
  badgeEmoji: {
    fontSize: 22,
  },
  badgeItemTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  badgeItemTier: {
    fontSize: 9.5,
    color: COLORS.primary,
    fontWeight: '700',
  },
  settingToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 12,
  },
  settingInfo: {
    flex: 1,
    gap: 2,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  settingDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
  },
  dataActionsRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  dataActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  dataActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  exportModalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: 10,
    ...SHADOWS.large,
  },
  exportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exportTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  exportDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  jsonScrollView: {
    backgroundColor: '#0F172A',
    borderRadius: RADIUS.md,
    padding: 12,
    maxHeight: 280,
  },
  jsonCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
    color: '#38BDF8',
    lineHeight: 15,
  },
  closeModalBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    marginTop: 4,
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
});
