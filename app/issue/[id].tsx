import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useIssues } from '@/contexts/IssuesContext';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { IssueTimeline } from '@/components/issue/IssueTimeline';
import { AchievementModal } from '@/components/gamification/AchievementModal';
import { ResolutionPhotoModal } from '@/components/issue/ResolutionPhotoModal';
import { logUserCivicAction } from '@/services/gamification/gamificationService';
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
} from 'lucide-react-native';

export default function IssueDetailsScreen() {
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
        Alert.alert('Notice', res.message);
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
        Alert.alert('Hazard Escalated', 'Urgent hazard alert flagged to all neighboring citizens!');
      } else {
        Alert.alert('Notice', res.message);
      }
    } finally {
      setIsEscalating(false);
    }
  };

  const handleOpenResolutionModal = () => {
    if (hasResolved && isResolved) {
      Alert.alert('Already Restored', 'This issue has already been marked as restored.');
      return;
    }
    setResolutionModalVisible(true);
  };

  const handleTakePhotoProof = async () => {
    setResolutionModalVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is required to capture resolution proof.');
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
        if (gamificationRes.unlockedBadge) setUnlockedBadge(gamificationRes.unlockedBadge);
        setAchievementModalVisible(true);
      } else {
        Alert.alert('Notice', res.message);
      }
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Issue Intelligence</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Photo Evidence */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: liveIssue.imageUrl }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlays}>
            <CategoryBadge category={liveIssue.category} size="md" />
            <StatusBadge status={liveIssue.status} size="md" />
          </View>
        </View>

        {/* RESTORATION PROOF (IF RESOLVED) */}
        {isResolved && liveIssue.resolvedImageUrl && (
          <View style={styles.resolvedProofCard}>
            <View style={styles.resolvedProofHeader}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={styles.resolvedProofTitle}>CITIZEN RESOLUTION PHOTO PROOF</Text>
            </View>
            <Image
              source={{ uri: liveIssue.resolvedImageUrl }}
              style={styles.resolvedProofImage}
              resizeMode="cover"
            />
            <Text style={styles.resolvedProofSub}>
              Photo evidence captured on site verifying road restoration.
            </Text>
          </View>
        )}

        {/* SMART PRIORITY SCORE CARD */}
        <View style={styles.priorityCard}>
          <View style={styles.priorityTopRow}>
            <View style={styles.priorityTitleCol}>
              <View style={styles.priorityHeaderRow}>
                <Flame size={16} color={isUrgent ? '#EF4444' : '#F59E0B'} />
                <Text style={styles.priorityCardTitle}>COMMUNITY SAFETY ENGINE</Text>
              </View>
              <Text style={styles.priorityTierText}>
                {liveIssue.priorityTier || (isUrgent ? 'Critical / Urgent' : 'High Priority Action')}
              </Text>
            </View>

            <View style={[styles.priorityPill, { borderColor: isUrgent ? '#EF4444' : '#F59E0B' }]}>
              <Text style={[styles.priorityNum, { color: isUrgent ? '#EF4444' : '#B45309' }]}>
                {priorityScore}
              </Text>
              <Text style={styles.priorityMax}>/100</Text>
            </View>
          </View>

          {/* Priority Progress Meter */}
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
                    : '#10B981',
                },
              ]}
            />
          </View>
          <Text style={styles.priorityReasoning}>
            Weighted by: Severity ({liveIssue.severity.toUpperCase()}) + Traffic Density + {liveIssue.confirmationCount} citizen on-site verifications.
          </Text>
        </View>

        {/* DESCRIPTION & METADATA */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionHeading}>CIVIC PROBLEM SUMMARY</Text>
          <Text style={styles.descriptionText}>{liveIssue.description}</Text>

          {/* Impact Factors Chips */}
          {liveIssue.impactFactors && liveIssue.impactFactors.length > 0 && (
            <View style={styles.impactsWrapper}>
              <Text style={styles.impactsSub}>Citizen Reported Impacts:</Text>
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

          {/* Meta items */}
          <View style={styles.metaRow}>
            <MapPin size={16} color={COLORS.primary} />
            <Text style={styles.metaText}>{liveIssue.locationName}</Text>
          </View>

          <View style={styles.metaRow}>
            <Clock size={16} color={COLORS.textMuted} />
            <Text style={styles.metaText}>
              Reported {formatRelativeTime(liveIssue.createdAt)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <User size={16} color={COLORS.textMuted} />
            <Text style={styles.metaText}>
              Scout: {liveIssue.reporterName || 'Verified Citizen'}
            </Text>
          </View>

          {/* Google Maps Direct Navigation Button */}
          <TouchableOpacity
            style={styles.googleMapsActionBtn}
            onPress={() => {
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
            }}
            activeOpacity={0.85}
          >
            <Navigation size={16} color="#FFFFFF" />
            <Text style={styles.googleMapsActionText}>
              Open in Google Maps ({liveIssue.latitude.toFixed(4)}, {liveIssue.longitude.toFixed(4)})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5-STEP ISSUE HEALTH LIFECYCLE TIMELINE (Updates dynamically in real time) */}
        <IssueTimeline timeline={timeline} />

        {/* 3-CHOICE COMMUNITY VERIFICATION ACTION BAR */}
        {!isResolved ? (
          <View style={styles.communityActionCard}>
            <Text style={styles.actionCardTitle}>COMMUNITY VERIFICATION</Text>
            <Text style={styles.actionCardSub}>
              Have you observed this road hazard? Confirm on site or submit photo proof when repaired.
            </Text>

            <View style={styles.actionBtnStack}>
              {/* Option 1: Still Present */}
              <TouchableOpacity
                style={[styles.verifyOptionBtn, hasConfirmed && styles.verifyOptionBtnActive]}
                onPress={handleConfirmExists}
                disabled={isConfirming || hasConfirmed}
                activeOpacity={0.8}
              >
                {isConfirming ? (
                  <ActivityIndicator size="small" color="#0066FF" />
                ) : (
                  <>
                    <CheckCircle2 size={16} color={hasConfirmed ? '#FFFFFF' : COLORS.primary} />
                    <Text style={[styles.verifyOptionText, hasConfirmed && styles.verifyOptionTextActive]}>
                      {hasConfirmed ? `Confirmed Present (${liveIssue.confirmationCount})` : 'Confirm Still Present'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Option 2: Getting Worse */}
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
                    <AlertTriangle size={16} color="#DC2626" />
                    <Text style={styles.worseOptionText}>Report Getting Worse / Critical</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Option 3: Mark as Resolved (Custom Modal) */}
              <TouchableOpacity
                style={[styles.resolveOptionBtn, hasResolved && styles.resolveOptionBtnActive]}
                onPress={handleOpenResolutionModal}
                disabled={isResolving}
                activeOpacity={0.8}
              >
                {isResolving ? (
                  <ActivityIndicator size="small" color="#059669" />
                ) : (
                  <>
                    <Camera size={16} color={hasResolved ? '#FFFFFF' : '#059669'} />
                    <Text style={[styles.resolveOptionText, hasResolved && styles.resolveOptionTextActive]}>
                      {hasResolved ? 'Resolution Photo Verified' : 'Mark as Repaired (Take Photo Proof)'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.resolvedBannerCard}>
            <CheckCircle2 size={24} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={styles.resolvedBannerTitle}>ISSUE RESOLVED & VERIFIED</Text>
              <Text style={styles.resolvedBannerSub}>
                Restored on {liveIssue.resolvedAt ? new Date(liveIssue.resolvedAt).toLocaleDateString() : 'recently'}. Thank you to all contributing road scouts!
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
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPill: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.md,
    paddingBottom: 40,
  },
  imageContainer: {
    height: 240,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    ...SHADOWS.medium,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlays: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resolvedProofCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 8,
  },
  resolvedProofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resolvedProofTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  resolvedProofImage: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.lg,
    backgroundColor: '#064E3B',
  },
  resolvedProofSub: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
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
    marginBottom: 8,
  },
  priorityTitleCol: {
    flex: 1,
  },
  priorityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityCardTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  priorityTierText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    backgroundColor: COLORS.surfaceHighlight,
  },
  priorityNum: {
    fontSize: 18,
    fontWeight: '900',
  },
  priorityMax: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '800',
  },
  meterTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceHighlight,
    overflow: 'hidden',
    marginVertical: 8,
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
  priorityReasoning: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 15,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
    gap: 8,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    fontWeight: '600',
  },
  impactsWrapper: {
    marginTop: 4,
    marginBottom: 4,
  },
  impactsSub: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  impactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  impactTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  impactTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  googleMapsActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 8,
    marginTop: 10,
    ...SHADOWS.small,
  },
  googleMapsActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  communityActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  actionCardTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  actionCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  actionBtnStack: {
    gap: 8,
  },
  verifyOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  verifyOptionBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  verifyOptionText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  verifyOptionTextActive: {
    color: '#FFFFFF',
  },
  worseOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  worseOptionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  resolveOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  resolveOptionBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
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
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 12,
  },
  resolvedBannerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#065F46',
  },
  resolvedBannerSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
});
