import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useIssues } from '@/contexts/IssuesContext';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { IssueTimeline } from '@/components/issue/IssueTimeline';
import { AchievementModal } from '@/components/gamification/AchievementModal';
import { ResolutionPhotoModal } from '@/components/issue/ResolutionPhotoModal';
import { ModernAlertModal, ModernAlertConfig } from '@/components/ui/ModernAlertModal';
import { logUserCivicAction } from '@/services/gamification/gamificationService';
import {
  sendRepairVerifiedPushNotification,
  sendBadgeUnlockedPushNotification,
  sendHazardAlertPushNotification,
} from '@/services/notifications/notificationService';
import { generateIssueTimeline } from '@/utils/priority';
import { Badge } from '@/types/gamification';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { formatRelativeTime } from '@/utils/formatters';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Check,
  Navigation,
  Sparkles,
  Camera,
  Share2,
  Shield,
  ShieldCheck,
  Eye,
  Activity,
  Layers,
  Bot,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function IssueDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    issues,
    getIssueById,
    confirmExists,
    confirmGettingWorse,
    markResolved,
    checkUserActions,
  } = useIssues();
  const { user } = useAuth();

  // Bind to LIVE issue state from IssuesContext so updates propagate instantly in real time
  const liveIssue = issues.find((i) => i.id === id) || getIssueById(id);

  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [hasResolved, setHasResolved] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [resolutionModalVisible, setResolutionModalVisible] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | undefined>(undefined);
  const [alertConfig, setAlertConfig] = useState<ModernAlertConfig | null>(null);

  useEffect(() => {
    if (liveIssue) {
      checkUserActions(liveIssue.id).then((actions) => {
        setHasConfirmed(actions.hasConfirmed);
        setHasResolved(actions.hasResolved || liveIssue.status === 'resolved');
      }).catch((e) => console.warn('Action check error:', e));
    }
  }, [liveIssue, checkUserActions]);

  if (!liveIssue) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.notFoundText}>Issue Report Not Found</Text>
          <TouchableOpacity
            style={styles.backBtnPill}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>Return to Map</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isResolved = liveIssue.status === 'resolved';
  const priorityScore = liveIssue.priorityScore || 65;
  const isUrgent = priorityScore >= 80;
  // Re-generate lifecycle timeline dynamically in real time from live state
  const timeline = generateIssueTimeline(liveIssue);

  const handleConfirmExists = async () => {
    if (hasConfirmed) return;
    setIsConfirming(true);
    try {
      const res = await confirmExists(liveIssue.id);
      if (res.success) {
        setHasConfirmed(true);
        const gamificationRes = await logUserCivicAction(
          'community_confirm',
          liveIssue.category,
          liveIssue.locationName,
          liveIssue.locationName,
          { userId: user?.uid }
        );
        if (gamificationRes.unlockedBadge) setUnlockedBadge(gamificationRes.unlockedBadge);
        setAchievementModalVisible(true);
      } else {
        setAlertConfig({
          visible: true,
          title: 'Notice',
          message: res.message,
          icon: 'info',
          confirmText: 'OK',
          onConfirm: () => setAlertConfig(null),
        });
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleGettingWorse = async () => {
    setIsEscalating(true);
    try {
      const res = await confirmGettingWorse(liveIssue.id);
      if (res.success) {
        await logUserCivicAction(
          'getting_worse',
          liveIssue.category,
          liveIssue.locationName,
          liveIssue.locationName,
          { userId: user?.uid }
        );
        sendHazardAlertPushNotification(liveIssue.category, liveIssue.locationName, true).catch((e) => console.warn(e));
        setAlertConfig({
          visible: true,
          title: 'Hazard Escalated',
          message: 'Urgent hazard alert flagged to all neighboring citizens and response crews!',
          icon: 'warning',
          confirmText: 'Got It',
          confirmVariant: 'primary',
          onConfirm: () => setAlertConfig(null),
        });
      } else {
        setAlertConfig({
          visible: true,
          title: 'Notice',
          message: res.message,
          icon: 'info',
          confirmText: 'OK',
          onConfirm: () => setAlertConfig(null),
        });
      }
    } finally {
      setIsEscalating(false);
    }
  };

  const handleOpenResolutionModal = () => {
    if (hasResolved && isResolved) {
      setAlertConfig({
        visible: true,
        title: 'Already Restored',
        message: 'This issue has already been verified and marked as restored.',
        icon: 'success',
        confirmText: 'Great',
        confirmVariant: 'success',
        onConfirm: () => setAlertConfig(null),
      });
      return;
    }
    setResolutionModalVisible(true);
  };

  const handleTakePhotoProof = async () => {
    setResolutionModalVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setAlertConfig({
        visible: true,
        title: 'Permission Required',
        message: 'Camera access is required to capture resolution proof.',
        icon: 'camera',
        confirmText: 'OK',
        onConfirm: () => setAlertConfig(null),
      });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await processResolution(result.assets[0].uri);
    }
  };

  const handleChooseGalleryProof = async () => {
    setResolutionModalVisible(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await processResolution(result.assets[0].uri);
    }
  };

  const processResolution = async (photoUri: string) => {
    setIsResolving(true);
    try {
      const res = await markResolved(liveIssue.id, photoUri);
      if (res.success) {
        setHasResolved(true);
        const gamificationRes = await logUserCivicAction(
          'issue_resolved',
          liveIssue.category,
          liveIssue.locationName,
          liveIssue.locationName,
          { hasPhotoProof: true, userId: user?.uid }
        );
        if (gamificationRes.unlockedBadge) {
          setUnlockedBadge(gamificationRes.unlockedBadge);
          sendBadgeUnlockedPushNotification(gamificationRes.unlockedBadge.title).catch((e) => console.warn(e));
        }
        sendRepairVerifiedPushNotification(liveIssue.category, liveIssue.locationName).catch((e) => console.warn(e));
        setAchievementModalVisible(true);
      } else {
        setAlertConfig({
          visible: true,
          title: 'Notice',
          message: res.message,
          icon: 'info',
          confirmText: 'OK',
          onConfirm: () => setAlertConfig(null),
        });
      }
    } finally {
      setIsResolving(false);
    }
  };

  const openNavigation = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${liveIssue.latitude},${liveIssue.longitude}`,
      android: `geo:0,0?q=${liveIssue.latitude},${liveIssue.longitude}(${encodeURIComponent(liveIssue.locationName)})`,
    });
    Linking.canOpenURL(url || '').then((supported) => {
      if (supported && url) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${liveIssue.latitude},${liveIssue.longitude}`);
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar with sleek frosted icons */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <ArrowLeft size={19} color={COLORS.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.appBarTitleCol}>
          <Text style={styles.appBarTitle}>Issue Intelligence</Text>
          <View style={styles.appBarStatusRow}>
            <View style={[styles.statusMiniDot, { backgroundColor: isResolved ? '#10B981' : isUrgent ? '#EF4444' : '#0066FF' }]} />
            <Text style={styles.appBarSub}>
              {isResolved ? 'RESOLVED' : isUrgent ? 'CRITICAL HAZARD' : 'ACTIVE REPORT'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.headerIconBtn, styles.headerNavBtn]}
          onPress={openNavigation}
          activeOpacity={0.75}
        >
          <Navigation size={17} color={COLORS.primary} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. HERO PHOTO VIEWPORT */}
        <View style={styles.heroViewport}>
          <Image
            source={{ uri: liveIssue.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Top Overlays */}
          <View style={styles.heroTopOverlays}>
            <CategoryBadge category={liveIssue.category} size="md" />
            <StatusBadge status={liveIssue.status} size="md" />
          </View>

          {/* Bottom Gradient Scrim Overlay */}
          <View style={styles.heroBottomScrim}>
            <View style={styles.heroMetaPill}>
              <Clock size={12} color="#FFFFFF" />
              <Text style={styles.heroMetaText}>Reported {formatRelativeTime(liveIssue.createdAt)}</Text>
            </View>
            {liveIssue.aiConfidence && (
              <View style={styles.heroAiPill}>
                <Sparkles size={11} color="#A855F7" />
                <Text style={styles.heroAiText}>AI Verified ({Math.round(liveIssue.aiConfidence * 100)}%)</Text>
              </View>
            )}
          </View>
        </View>

        {/* 2. RESTORATION PROOF CARD (IF RESOLVED) */}
        {isResolved && liveIssue.resolvedImageUrl && (
          <View style={styles.resolvedProofCard}>
            <View style={styles.resolvedProofHeader}>
              <View style={styles.resolvedCheckCircle}>
                <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2.8} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resolvedProofTitle}>ISSUE RESOLVED • PHOTO EVIDENCE</Text>
                <Text style={styles.resolvedProofSub}>
                  Verified on-site camera evidence confirming safe road conditions.
                </Text>
              </View>
            </View>
            <Image
              source={{ uri: liveIssue.resolvedImageUrl }}
              style={styles.resolvedProofImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* 3. PRIORITY & IMPACT COMMAND CARD */}
        <View style={styles.priorityCard}>
          <View style={styles.priorityTopRow}>
            <View style={styles.priorityTitleCol}>
              <View style={styles.priorityHeaderRow}>
                <Flame size={18} color={isUrgent ? '#EF4444' : '#F59E0B'} strokeWidth={2.5} />
                <Text style={styles.priorityCardTitle}>PRIORITY & IMPACT RATING</Text>
              </View>
              <Text style={styles.priorityTierText}>
                {liveIssue.priorityTier || (isUrgent ? 'Critical Urgency Priority' : 'Standard Community Priority')}
              </Text>
            </View>

            {/* Score Ring */}
            <View style={[styles.priorityScoreBadge, { borderColor: isUrgent ? '#EF4444' : '#0066FF' }]}>
              <Text style={[styles.priorityScoreNum, { color: isUrgent ? '#EF4444' : COLORS.primary }]}>
                {priorityScore}
              </Text>
              <Text style={styles.priorityScoreMax}>/100</Text>
            </View>
          </View>

          {/* Segmented Progress Bar */}
          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterFill,
                {
                  width: `${priorityScore}%`,
                  backgroundColor: isUrgent
                    ? '#EF4444'
                    : priorityScore >= 60
                    ? '#F97316'
                    : '#0066FF',
                },
              ]}
            />
          </View>

          {/* Impact Factors Tags */}
          {liveIssue.impactFactors && liveIssue.impactFactors.length > 0 && (
            <View style={styles.impactsWrapper}>
              <Text style={styles.impactsSub}>Identified Hazard Factors:</Text>
              <View style={styles.impactsRow}>
                {liveIssue.impactFactors.map((imp, idx) => (
                  <View key={idx} style={styles.impactTag}>
                    <Text style={styles.impactTagText}>
                      {imp === 'two_wheeler_danger'
                        ? '🏍️ 2-Wheeler Risk'
                        : imp === 'vehicle_damage'
                        ? '🚗 Vehicle Damage'
                        : imp === 'pedestrian_danger'
                        ? '🚶 Pedestrian Risk'
                        : imp === 'traffic_slowdown'
                        ? '🚦 Traffic Slowdown'
                        : '⚠️ Road Hazard'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.priorityReasoning}>
            Evaluated from severity ({liveIssue.severity.toUpperCase()}), traffic density, and {liveIssue.confirmationCount || 0} community verifications.
          </Text>
        </View>

        {/* 4. LOCATION & NAVIGATION CARD */}
        <View style={styles.locationCard}>
          <View style={styles.locationTopRow}>
            <View style={styles.locationIconBox}>
              <MapPin size={20} color={COLORS.primary} strokeWidth={2.4} />
            </View>
            <View style={styles.locationInfoCol}>
              <Text style={styles.locationCardTitle}>LOCATION & ACCESS</Text>
              <Text style={styles.locationNameText}>{liveIssue.locationName}</Text>
              <Text style={styles.coordinatesText}>
                {Number(liveIssue.latitude).toFixed(5)}, {Number(liveIssue.longitude).toFixed(5)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.mapsNavigateBtn}
            onPress={openNavigation}
            activeOpacity={0.85}
          >
            <Navigation size={16} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.mapsNavigateBtnText}>Navigate in Maps</Text>
          </TouchableOpacity>
        </View>

        {/* 5. VERIFIED CITIZEN REPORT INTEL CARD */}
        <View style={styles.intelCard}>
          <View style={styles.intelHeaderRow}>
            <ShieldCheck size={16} color={COLORS.primary} strokeWidth={2.4} />
            <Text style={styles.intelHeaderTitle}>CITIZEN REPORT INTEL</Text>
          </View>

          <Text style={styles.descriptionText}>{liveIssue.description}</Text>

          <View style={styles.reporterMetaDivider} />

          <View style={styles.reporterInfoRow}>
            <View style={styles.reporterAvatar}>
              <User size={15} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reporterName}>
                {liveIssue.reporterName || 'Verified Citizen'}
              </Text>
              <Text style={styles.reporterSub}>
                Logged {new Date(liveIssue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>

        {/* 6. HEALTH LIFECYCLE TIMELINE */}
        <IssueTimeline timeline={timeline} />

        {/* 7. COMMUNITY ACTION CONSOLE */}
        {!isResolved ? (
          <View style={styles.communityActionCard}>
            <View style={styles.actionHeaderRow}>
              <View style={styles.actionIconBubble}>
                <Activity size={16} color={COLORS.primary} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionCardTitle}>COMMUNITY RESPONSE CONSOLE</Text>
                <Text style={styles.actionCardSub}>
                  Help neighboring drivers by confirming hazard status on site.
                </Text>
              </View>
            </View>

            <View style={styles.actionBtnStack}>
              {/* Option 1: Confirm Issue Active */}
              <TouchableOpacity
                style={[styles.verifyOptionBtn, hasConfirmed && styles.verifyOptionBtnActive]}
                onPress={handleConfirmExists}
                disabled={isConfirming || hasConfirmed}
                activeOpacity={0.8}
              >
                {isConfirming ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <CheckCircle2 size={17} color={hasConfirmed ? '#FFFFFF' : COLORS.primary} strokeWidth={2.4} />
                    <Text style={[styles.verifyOptionText, hasConfirmed && styles.verifyOptionTextActive]}>
                      {hasConfirmed
                        ? `Confirmed Active (${liveIssue.confirmationCount || 1})`
                        : `Confirm Issue Active (${liveIssue.confirmationCount || 0})`}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Option 2: Escalate Urgency */}
              <TouchableOpacity
                style={styles.worseOptionBtn}
                onPress={handleGettingWorse}
                disabled={isEscalating}
                activeOpacity={0.8}
              >
                {isEscalating ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <>
                    <AlertTriangle size={17} color="#DC2626" strokeWidth={2.4} />
                    <Text style={styles.worseOptionText}>Escalate Hazard Urgency</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Option 3: Submit Resolution Proof */}
              <TouchableOpacity
                style={[styles.resolveOptionBtn, hasResolved && styles.resolveOptionBtnActive]}
                onPress={handleOpenResolutionModal}
                disabled={isResolving}
                activeOpacity={0.8}
              >
                {isResolving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Camera size={17} color={hasResolved ? '#FFFFFF' : '#059669'} strokeWidth={2.4} />
                    <Text style={[styles.resolveOptionText, hasResolved && styles.resolveOptionTextActive]}>
                      {hasResolved ? 'Resolution Photo Verified' : 'Submit Resolution Photo Proof'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.resolvedBannerCard}>
            <View style={styles.resolvedBannerIcon}>
              <CheckCircle2 size={24} color="#FFFFFF" strokeWidth={2.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resolvedBannerTitle}>ISSUE RESOLVED</Text>
              <Text style={styles.resolvedBannerSub}>
                Hazard marked as resolved on {liveIssue.resolvedAt ? new Date(liveIssue.resolvedAt).toLocaleDateString() : 'recently'}. Verified by community evidence.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modern Custom Photo Resolution Modal */}
      <ResolutionPhotoModal
        visible={resolutionModalVisible}
        onTakePhoto={handleTakePhotoProof}
        onChooseGallery={handleChooseGalleryProof}
        onClose={() => setResolutionModalVisible(false)}
      />

      {/* Celebration Popup */}
      <AchievementModal
        visible={achievementModalVisible}
        unlockedBadge={unlockedBadge}
        onClose={() => setAchievementModalVisible(false)}
      />

      {/* Modern Alert Modal */}
      {alertConfig && (
        <ModernAlertModal
          {...alertConfig}
          visible={Boolean(alertConfig)}
          onConfirm={alertConfig.onConfirm || (() => setAlertConfig(null))}
          onCancel={alertConfig.onCancel || (() => setAlertConfig(null))}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  backBtnPill: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerNavBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  appBarTitleCol: {
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  appBarStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusMiniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  appBarSub: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.4,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: 14,
    paddingBottom: 45,
  },
  heroViewport: {
    height: 250,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    ...SHADOWS.medium,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTopOverlays: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroBottomScrim: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroMetaText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroAiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    ...SHADOWS.subtle,
  },
  heroAiText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
  },
  resolvedProofCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 10,
    ...SHADOWS.subtle,
  },
  resolvedProofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resolvedCheckCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resolvedProofTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  resolvedProofSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
  resolvedProofImage: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.lg,
    backgroundColor: '#064E3B',
  },
  priorityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  priorityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityTitleCol: {
    flex: 1,
  },
  priorityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityCardTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.6,
  },
  priorityTierText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  priorityScoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  priorityScoreNum: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 17,
  },
  priorityScoreMax: {
    fontSize: 8.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  meterTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  meterFill: {
    height: '100%',
    borderRadius: 4,
  },
  impactsWrapper: {
    marginBottom: 10,
  },
  impactsSub: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  impactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  impactTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 0.8,
    borderColor: '#FDE68A',
  },
  impactTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#92400E',
  },
  priorityReasoning: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: RADIUS.md,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  locationTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  locationIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  locationInfoCol: {
    flex: 1,
  },
  locationCardTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  locationNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
    lineHeight: 18,
  },
  coordinatesText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  mapsNavigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: RADIUS.lg,
    ...SHADOWS.subtle,
  },
  mapsNavigateBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  intelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  intelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  intelHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.6,
  },
  descriptionText: {
    fontSize: 13.5,
    color: COLORS.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },
  reporterMetaDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  reporterInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reporterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reporterName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  reporterSub: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  communityActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  actionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  actionIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionCardTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  actionCardSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  actionBtnStack: {
    gap: 10,
  },
  verifyOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
  },
  verifyOptionBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  verifyOptionText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  verifyOptionTextActive: {
    color: '#FFFFFF',
  },
  worseOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.lg,
    paddingVertical: 11,
  },
  worseOptionText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  resolveOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
  },
  resolveOptionBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  resolveOptionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  resolveOptionTextActive: {
    color: '#FFFFFF',
  },
  resolvedBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    ...SHADOWS.subtle,
  },
  resolvedBannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resolvedBannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.6,
  },
  resolvedBannerSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 16,
  },
});
