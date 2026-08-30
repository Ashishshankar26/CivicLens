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
import { scheduleCivicNotification } from '@/services/notifications/notificationService';
import { UserReputation, UserPrivacySettings, Badge } from '@/types/gamification';
import { BadgeDetailModal } from '@/components/gamification/BadgeDetailModal';
import { AllBadgesModal } from '@/components/gamification/AllBadgesModal';
import { EditProfileModal, AVATAR_OPTIONS } from '@/components/profile/EditProfileModal';
import { RealBadgeEmblem } from '@/components/ui/RealBadgeEmblem';
import { ModernAlertModal, ModernAlertConfig } from '@/components/ui/ModernAlertModal';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import {
  Flame,
  Shield,
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
  Bell,
  Layers,
  ArrowRight,
  Pencil,
  Zap,
  Car,
  Bike,
  Star,
  Camera,
} from 'lucide-react-native';

export default function ModernYouScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, loginDemo, updateProfile } = useAuth();
  const { myReports, issues } = useIssues();
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [allBadgesModalVisible, setAllBadgesModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<ModernAlertConfig | null>(null);

  useEffect(() => {
    loadUserData();
  }, [user, myReports]);

  const loadUserData = async () => {
    const rep = await getUserReputation(user?.uid, myReports);
    setReputation(rep);
  };

  const activeAvatarObj = AVATAR_OPTIONS.find((a) => a.id === user?.avatarKey) || AVATAR_OPTIONS[0];
  const AvatarIconComponent = activeAvatarObj.Icon;

  const totalCaught = myReports.length;
  const badgesCount = reputation?.badges.filter((b) => b.isUnlocked).length || 0;
  const impactRadius = reputation?.impactRadiusKm || 0.0;

  // 1. Compile real activity dates map from actual reports and logged actions
  const realActivityDates = React.useMemo(() => {
    const datesMap: Record<string, number> = {};

    // Real reports created by this user
    myReports.forEach((report) => {
      if (report.createdAt) {
        try {
          const iso = new Date(report.createdAt).toISOString().split('T')[0];
          datesMap[iso] = (datesMap[iso] || 0) + 1;
        } catch {}
      }
    });

    // Real community verifications / votes / resolutions
    (reputation?.activityLogs || []).forEach((log) => {
      if (log.timestamp) {
        try {
          const iso = new Date(log.timestamp).toISOString().split('T')[0];
          datesMap[iso] = (datesMap[iso] || 0) + 1;
        } catch {}
      }
    });

    return datesMap;
  }, [myReports, reputation]);

  // 2. Real total contributions count directly from actual activity
  const totalContributions = React.useMemo(() => {
    const sum = Object.values(realActivityDates).reduce((a, b) => a + b, 0);
    return sum > 0 ? sum : totalCaught;
  }, [realActivityDates, totalCaught]);

  // 3. Genuine streak calculation from real active dates
  const { currentStreak, maxStreak } = React.useMemo(() => {
    const activeDates = new Set(
      Object.keys(realActivityDates).filter((k) => realActivityDates[k] > 0)
    );

    if (activeDates.size === 0) {
      return { currentStreak: 0, maxStreak: 0 };
    }

    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split('T')[0];

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    let streak = 0;
    let checkDate: Date | null = null;

    if (activeDates.has(todayStr)) {
      checkDate = new Date();
    } else if (activeDates.has(yesterdayStr)) {
      checkDate = yesterdayDate;
    }

    if (checkDate) {
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (activeDates.has(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Compute all-time max consecutive day run
    const sortedDates = Array.from(activeDates).sort();
    let maxRun = 0;
    let tempRun = 0;
    let prevTimestamp: number | null = null;

    sortedDates.forEach((dStr) => {
      const ts = new Date(dStr).getTime();
      if (prevTimestamp === null) {
        tempRun = 1;
      } else {
        const diffDays = Math.round((ts - prevTimestamp) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempRun++;
        } else if (diffDays > 1) {
          tempRun = 1;
        }
      }
      if (tempRun > maxRun) maxRun = tempRun;
      prevTimestamp = ts;
    });

    return {
      currentStreak: streak,
      maxStreak: Math.max(maxRun, streak),
    };
  }, [realActivityDates]);

  // GitHub Style Matrix Configuration (20 weeks, 7 days per week)
  const heatmapCols = 20;
  const today = new Date();
  const currentDayOfWeek = (today.getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  const getCellContributionLevel = (colIdx: number, rowIdx: number) => {
    const weeksAgo = 19 - colIdx;
    const daysAgo = weeksAgo * 7 + (currentDayOfWeek - rowIdx);
    if (daysAgo < 0) return 0;

    const cellDate = new Date(today);
    cellDate.setDate(cellDate.getDate() - daysAgo);
    const dateStr = cellDate.toISOString().split('T')[0];
    return realActivityDates[dateStr] || 0;
  };

  // Generate dynamic 5 months labels based on past 20 weeks
  const getDynamicMonthLabels = () => {
    const labels: string[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
    }
    return labels;
  };
  const months = getDynamicMonthLabels();

  const handleTogglePrivacy = async (key: keyof UserPrivacySettings) => {
    if (!reputation) return;
    const currentVal = reputation.privacySettings[key];
    const updated = await updatePrivacySettings({ [key]: !currentVal }, user?.uid);
    setReputation((prev) => (prev ? { ...prev, privacySettings: updated } : prev));
  };

  const handleLogout = () => {
    setAlertConfig({
      visible: true,
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of CivicLens on this device?',
      icon: 'logout',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setAlertConfig(null);
        await logout();
        router.replace('/(auth)/login');
      },
      onCancel: () => setAlertConfig(null),
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'ios' ? 4 : 8) }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Title */}
        <Text style={styles.topPageTitle}>Profile</Text>

        {/* 1. PUBLIC CITIZEN PROFILE HERO */}
        <View style={styles.spotterCard}>
          <View style={styles.spotterCardTopStripe} />
          
          {/* Edit Profile Action Pill */}
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => setEditModalVisible(true)}
            activeOpacity={0.8}
          >
            <Pencil size={13} color="#007AFF" />
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>

          <View style={styles.spotterTopRow}>
            {/* Glowing Selected Avatar */}
            <View style={[styles.glowAvatarCircle, { backgroundColor: activeAvatarObj.bg, borderColor: activeAvatarObj.color }]}>
              <AvatarIconComponent size={34} color={activeAvatarObj.color} strokeWidth={2.4} />
            </View>

            <View style={styles.spotterInfoCol}>
              <View style={styles.spotterBadge}>
                <Sparkles size={11} color={COLORS.primary} />
                <Text style={styles.spotterBadgeText}>
                  LEVEL {reputation?.level || 1} • {reputation?.levelTitle?.toUpperCase() || 'NOVICE SCOUT'}
                </Text>
              </View>
              <Text style={styles.spotterName}>{user?.displayName || 'Active Citizen'}</Text>
              {user?.bio ? (
                <Text style={styles.spotterBioText} numberOfLines={2}>"{user.bio}"</Text>
              ) : null}
              <View style={styles.verifiedRow}>
                <ShieldCheck size={12} color="#059669" />
                <Text style={styles.verifiedText}>Verified Citizen • Active Contributor</Text>
              </View>
              <View style={styles.trustMeterRow}>
                <Shield size={11} color={COLORS.primary} />
                <Text style={styles.trustMeterText}>
                  Trust Rating: {reputation?.trustScore || 85}% • {reputation?.trustTier || 'Verified Guardian'}
                </Text>
              </View>
            </View>
          </View>

          {/* 3 Telemetry Counts */}
          <View style={styles.spotterStatsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{totalCaught}</Text>
              <Text style={styles.statLabel}>Reported</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{reputation?.confirmationsCount || 0}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{badgesCount}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>

          {/* Level XP Progress Bar */}
          <View style={styles.xpProgressContainer}>
            <View style={styles.xpLabelRow}>
              <Text style={styles.xpLabelText}>Rank XP Progress</Text>
              <Text style={styles.xpValueText}>
                {reputation?.points || 120} / {((reputation?.level || 1) * 200)} XP
              </Text>
            </View>
            <View style={styles.xpTrack}>
              <View
                style={[
                  styles.xpFill,
                  {
                    width: `${Math.min(
                      100,
                      Math.max(10, (((reputation?.points || 120) % 200) / 200) * 100)
                    )}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* 2. GITHUB / LEETCODE STYLE CONTRIBUTION ACTIVITY GRAPH */}
        <View style={styles.githubCard}>
          <View style={styles.githubHeaderRow}>
            <View style={styles.githubTitleRow}>
              <GitCommit size={16} color={COLORS.primary} />
              <Text style={styles.githubHeaderTitle}>
                {totalContributions} contributions in {new Date().getFullYear()}
              </Text>
            </View>
            <View style={styles.yearPill}>
              <Text style={styles.yearPillText}>{new Date().getFullYear()}</Text>
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
                      const count = getCellContributionLevel(cIdx, rIdx);
                      const isLight = count === 1;
                      const isMedium = count === 2;
                      const isHeavy = count >= 3;

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

            {/* Contribution Intensity Legend */}
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
              <Text style={styles.activityStatNum}>{currentStreak} days</Text>
              <Text style={styles.activityStatLabel}>Current streak</Text>
            </View>
            <View style={styles.activityStatDivider} />
            <View style={styles.activityStatBox}>
              <Text style={styles.activityStatNum}>{maxStreak} days</Text>
              <Text style={styles.activityStatLabel}>Max streak</Text>
            </View>
            <View style={styles.activityStatDivider} />
            <View style={styles.activityStatBox}>
              <Text style={styles.activityStatNum}>{impactRadius} km²</Text>
              <Text style={styles.activityStatLabel}>Scout radius</Text>
            </View>
          </View>
        </View>

        {/* 3. RECENT BADGES & MILESTONES (COMPACT SHOWCASE) */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.headerLeftGroup}>
              <Award size={16} color={COLORS.primary} />
              <Text style={styles.cardHeaderTitle}>Recent Badges & Milestones</Text>
            </View>
            <View style={styles.badgeCountBadge}>
              <Text style={styles.badgeCountBadgeText}>
                {badgesCount}/{reputation?.badges.length || 54} EARNED
              </Text>
            </View>
          </View>
          <Text style={styles.cardSubtext}>
            Your latest unlocked achievements and active milestone progression.
          </Text>

          {/* Compact Horizontal Badges Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentBadgesRow}
          >
            {(reputation?.badges || [])
              .filter((b) => b.isUnlocked)
              .slice(0, 4)
              .map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={styles.recentBadgePill}
                  onPress={() => setSelectedBadge(b)}
                  activeOpacity={0.8}
                >
                  <View style={styles.recentEmblemCenter}>
                    <RealBadgeEmblem id={b.id} size={48} isUnlocked={true} />
                  </View>
                  <Text style={styles.recentBadgeTitle} numberOfLines={1}>
                    {b.title}
                  </Text>
                  <View style={styles.earnedTag}>
                    <Text style={styles.earnedTagText}>UNLOCKED</Text>
                  </View>
                </TouchableOpacity>
              ))}

            {/* Next upcoming locked target preview */}
            {(reputation?.badges || [])
              .filter((b) => !b.isUnlocked)
              .slice(0, 2)
              .map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.recentBadgePill, styles.recentBadgePillLocked]}
                  onPress={() => setSelectedBadge(b)}
                  activeOpacity={0.8}
                >
                  <View style={styles.recentEmblemCenter}>
                    <RealBadgeEmblem id={b.id} size={48} isUnlocked={false} />
                    <View style={styles.miniLockOverlay}>
                      <Lock size={7} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text style={[styles.recentBadgeTitle, { color: COLORS.textMuted }]} numberOfLines={1}>
                    {b.title}
                  </Text>
                  <View style={styles.lockedProgressTag}>
                    <Text style={styles.lockedProgressText}>
                      {b.currentCount || 0}/{b.requiredCount || 1}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>

          {/* View All 54 Badges Action Button */}
          <TouchableOpacity
            style={styles.viewAllBadgesBtn}
            onPress={() => setAllBadgesModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.viewAllLeftRow}>
              <View style={styles.viewAllIconBubble}>
                <Sparkles size={14} color={COLORS.primary} />
              </View>
              <Text style={styles.viewAllBadgesBtnText}>
                View All {reputation?.badges.length || 54} Badges & Categories
              </Text>
            </View>
            <ChevronRight size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* 4. PRIVACY & SECURITY CONTROL CENTER */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <Lock size={16} color={COLORS.primary} />
            <Text style={styles.cardHeaderTitle}>Privacy & Security Center</Text>
          </View>
          <Text style={styles.cardSubtext}>
            Control your public visibility, location precision, and privacy settings.
          </Text>

          {/* Setting 1: Anonymous Reporting */}
          <View style={styles.settingToggleRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <EyeOff size={15} color={COLORS.textPrimary} />
                <Text style={styles.settingTitle}>Anonymous Public Reporting</Text>
              </View>
              <Text style={styles.settingDesc}>
                Mask your display name as "Verified Member" on public community maps and feeds.
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
              <Text style={styles.dataActionText}>Export Data Summary (JSON)</Text>
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

          {/* Test Push Notification Row */}
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={async () => {
              await scheduleCivicNotification({
                title: 'Live Hazard Alert: Pothole Flagged',
                body: 'A high-severity road issue was confirmed near Connaught Circus. Tap to open map.',
                data: { test: true },
              });
              setAlertConfig({
                visible: true,
                title: 'Push Notification Sent',
                message: 'A test live road alert was sent directly to your device notification tray!',
                icon: 'bell',
                confirmText: 'Great',
                confirmVariant: 'primary',
                onConfirm: () => setAlertConfig(null),
              });
            }}
            activeOpacity={0.7}
          >
            <Bell size={16} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsText}>Test Push Notifications</Text>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>
                Verify device notification tray delivery
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
            <Text style={styles.settingsText}>Switch to Demo Account</Text>
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

      {/* ALL 54 BADGES CATEGORICAL SLIDE-UP MODAL */}
      <AllBadgesModal
        visible={allBadgesModalVisible}
        badges={reputation?.badges || []}
        onClose={() => setAllBadgesModalVisible(false)}
      />

      {/* MODERN REUSABLE ALERT MODAL */}
      {alertConfig && (
        <ModernAlertModal
          {...alertConfig}
          visible={Boolean(alertConfig)}
          onConfirm={alertConfig.onConfirm || (() => setAlertConfig(null))}
          onCancel={alertConfig.onCancel || (() => setAlertConfig(null))}
        />
      )}

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
                <Text style={styles.exportTitle}>Your Exported Data</Text>
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
                setAlertConfig({
                  visible: true,
                  title: 'Data Summary Ready',
                  message: 'Your personal activity data summary has been compiled successfully.',
                  icon: 'success',
                  confirmText: 'Done',
                  confirmVariant: 'success',
                  onConfirm: () => setAlertConfig(null),
                });
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.closeModalBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        visible={editModalVisible}
        user={user}
        onClose={() => setEditModalVisible(false)}
        onSave={async (updates) => {
          await updateProfile(updates);
          setAlertConfig({
            visible: true,
            title: 'Profile Updated',
            message: 'Your display name, motto, and avatar emblem have been saved successfully.',
            icon: 'success',
            confirmText: 'Done',
            confirmVariant: 'success',
            onConfirm: () => setAlertConfig(null),
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: 14,
  },
  topPageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'left',
    letterSpacing: -0.6,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  editProfileBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    zIndex: 10,
  },
  editProfileBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#007AFF',
  },
  spotterBioText: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  spotterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  spotterCardTopStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.primary,
  },
  trustMeterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  trustMeterText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  xpProgressContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  xpLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  xpLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  xpValueText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  xpTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EFF6FF',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.primary,
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
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  yearPill: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.6)',
  },
  yearPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
  },
  githubMatrixContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  cellEmpty: {
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
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  badgeCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgeCountBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  recentBadgesRow: {
    gap: 10,
    paddingVertical: 4,
    paddingBottom: 12,
  },
  recentBadgePill: {
    width: 90,
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.lg,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recentBadgePillLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  recentEmblemCenter: {
    position: 'relative',
    marginVertical: 2,
  },
  miniLockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentBadgeTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 3,
  },
  earnedTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: RADIUS.full,
  },
  earnedTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#059669',
  },
  lockedProgressTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: RADIUS.full,
  },
  lockedProgressText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  viewAllBadgesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 2,
  },
  viewAllLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  viewAllIconBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllBadgesBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
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
