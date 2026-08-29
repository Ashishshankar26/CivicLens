import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useIssues } from '@/contexts/IssuesContext';
import { useAuth } from '@/contexts/AuthContext';
import { ImageSelector } from '@/components/report/ImageSelector';
import { AiSuggestionCard } from '@/components/report/AiSuggestionCard';
import { LocationPreviewCard } from '@/components/report/LocationPreviewCard';
import { DuplicateAlertModal } from '@/components/report/DuplicateAlertModal';
import { AchievementModal } from '@/components/gamification/AchievementModal';
import { ModernAlertModal, ModernAlertConfig } from '@/components/ui/ModernAlertModal';
import { CATEGORY_LIST } from '@/constants/categories';
import { SEVERITY_LIST } from '@/constants/severities';
import { getCurrentLocation, LocationResult } from '@/services/location/locationService';
import { analyzeCivicImage, AiVisionAnalysis } from '@/services/ai/visionService';
import { logUserCivicAction } from '@/services/gamification/gamificationService';
import { sendHazardReportSubmittedEmail } from '@/services/email/emailService';
import {
  sendHazardAlertPushNotification,
  sendBadgeUnlockedPushNotification,
} from '@/services/notifications/notificationService';
import { Badge } from '@/types/gamification';
import { IssueCategory, IssueSeverity, NearbyDuplicate } from '@/types/issue';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import {
  Camera,
  Send,
  Sparkles,
  Check,
  CircleDotDashed,
  Recycle,
  Lightbulb,
  Construction,
  TriangleAlert,
  MapPin,
  RefreshCw,
  Clock,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react-native';

export default function ReportIssueScreen() {
  const insets = useSafeAreaInsets();
  const { reportIssue, checkDuplicates } = useIssues();
  const { user } = useAuth();

  // Form State
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiVisionAnalysis | null>(null);
  const [aiAccepted, setAiAccepted] = useState<boolean>(false);

  const [category, setCategory] = useState<IssueCategory>('pothole');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [description, setDescription] = useState<string>('');

  // Location State
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState<boolean>(false);
  const [gpsPermissionGranted, setGpsPermissionGranted] = useState<boolean>(true);

  // Modals State
  const [duplicateModalVisible, setDuplicateModalVisible] = useState<boolean>(false);
  const [foundDuplicate, setFoundDuplicate] = useState<NearbyDuplicate | null>(null);
  const [achievementModalVisible, setAchievementModalVisible] = useState<boolean>(false);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);
  const [leveledUp, setLeveledUp] = useState<boolean>(false);
  const [alertConfig, setAlertConfig] = useState<ModernAlertConfig | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchGPSLocation();
  }, []);

  const fetchGPSLocation = async () => {
    setIsLoadingGPS(true);
    try {
      const res = await getCurrentLocation();
      setLocation(res.location);
      setGpsPermissionGranted(res.permissionGranted);
    } catch (err: any) {
      console.warn('[Report] GPS fetch error:', err?.message);
      setGpsPermissionGranted(false);
    } finally {
      setIsLoadingGPS(false);
    }
  };

  const handleImageSelected = async (uri: string) => {
    setImageUri(uri);
    setAiAccepted(false);
    setAiSuggestion(null);

    // Trigger Gemini AI Vision classification in background
    setIsAnalyzingImage(true);
    try {
      const analysis = await analyzeCivicImage(uri);
      if (analysis) {
        setAiSuggestion(analysis);
      }
    } catch (err) {
      console.warn('[Report] AI Vision failed:', err);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleImageRemoved = () => {
    setImageUri(null);
    setAiSuggestion(null);
    setAiAccepted(false);
  };

  const handleAcceptAiSuggestion = (
    suggestedCat: IssueCategory,
    suggestedSev?: IssueSeverity,
    suggestedDesc?: string
  ) => {
    setCategory(suggestedCat);
    if (suggestedSev) setSeverity(suggestedSev);
    if (suggestedDesc) setDescription(suggestedDesc);
    setAiAccepted(true);
  };

  const handleAutoFillDescription = () => {
    if (aiSuggestion?.suggestedDescription) {
      setDescription(aiSuggestion.suggestedDescription);
    }
  };

  const handlePreSubmit = () => {
    if (!imageUri) {
      setAlertConfig({
        visible: true,
        title: 'Photo Required',
        message: 'Please capture or upload photo evidence of the road hazard.',
        icon: 'camera',
        confirmText: 'Got It',
        confirmVariant: 'primary',
        onConfirm: () => setAlertConfig(null),
      });
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      setAlertConfig({
        visible: true,
        title: 'Description Required',
        message: 'Please provide a short description (at least 5 characters) explaining the hazard.',
        icon: 'warning',
        confirmText: 'Understood',
        confirmVariant: 'primary',
        onConfirm: () => setAlertConfig(null),
      });
      return;
    }

    if (!location || location.latitude === null || location.longitude === null) {
      setAlertConfig({
        visible: true,
        title: 'Location Pin Needed',
        message: 'GPS location is required to place the hazard marker accurately on the community map.',
        icon: 'warning',
        confirmText: 'Refresh GPS',
        confirmVariant: 'primary',
        onConfirm: () => {
          setAlertConfig(null);
          fetchGPSLocation();
        },
      });
      return;
    }

    const nearby = checkDuplicates(location.latitude, location.longitude, category);
    if (nearby.length > 0) {
      setFoundDuplicate(nearby[0]);
      setDuplicateModalVisible(true);
      return;
    }

    handleSubmitIssue();
  };

  const handleSubmitIssue = async () => {
    if (!imageUri || !location || location.latitude === null || location.longitude === null) return;

    setIsSubmitting(true);
    try {
      await reportIssue({
        category,
        description: description.trim(),
        imageUri,
        latitude: location.latitude,
        longitude: location.longitude,
        locationName: location.locationName,
        severity,
        aiSuggestedCategory: aiSuggestion?.category,
        aiConfidence: aiSuggestion?.confidence,
      });

      const gamificationRes = await logUserCivicAction(
        'submit_report',
        category,
        description.trim(),
        location.locationName || 'Local Road',
        {
          aiUsed: Boolean(aiSuggestion),
          hasPhotoProof: true,
          userId: user?.uid,
        }
      );
      if (gamificationRes.unlockedBadge) {
        setUnlockedBadge(gamificationRes.unlockedBadge);
        sendBadgeUnlockedPushNotification(gamificationRes.unlockedBadge.title).catch((e) => console.warn(e));
      }
      setLeveledUp(gamificationRes.leveledUp || false);
      setAchievementModalVisible(true);

      // Dispatch local/push neighborhood hazard broadcast
      sendHazardAlertPushNotification(category, location.locationName || 'Local Road', severity === 'high').catch((e) => console.warn(e));

      if (user?.email) {
        sendHazardReportSubmittedEmail(user, {
          category,
          locationName: location.locationName || 'Local Road',
          priorityScore: 75,
        }).catch((e) => console.warn('Email notify error:', e));
      }
    } catch (error) {
      console.error('Submission error:', error);
      setAlertConfig({
        visible: true,
        title: 'Submission Error',
        message: 'Could not submit report right now. Please verify your connection and try again.',
        icon: 'warning',
        confirmText: 'OK',
        confirmVariant: 'danger',
        onConfirm: () => setAlertConfig(null),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'ios' ? 4 : 8) }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconBox}>
              <Camera size={20} color={COLORS.primary} />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>Report an Issue</Text>
              <Text style={styles.headerSub}>
                Capture photo evidence for automatic AI categorization
              </Text>
            </View>
          </View>

          {/* AI-Powered Banner */}
          <View style={styles.aiBannerStrip}>
            <Sparkles size={13} color="#7C3AED" strokeWidth={2.4} />
            <Text style={styles.aiBannerText}>Powered by Gemini Vision AI — auto-categorization & severity detection</Text>
          </View>

          {/* Form Progress Step Indicator */}
          <View style={styles.stepProgressRow}>
            {[
              { num: 1, label: 'Photo', done: Boolean(imageUri) },
              { num: 2, label: 'Category', done: Boolean(category) },
              { num: 3, label: 'Severity', done: Boolean(severity) },
              { num: 4, label: 'Details', done: description.trim().length >= 5 },
              { num: 5, label: 'Location', done: Boolean(location?.latitude) },
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, step.done && styles.stepCircleDone]}>
                    {step.done ? (
                      <Check size={10} color="#FFFFFF" strokeWidth={3} />
                    ) : (
                      <Text style={styles.stepNumText}>{step.num}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepLabelText, step.done && styles.stepLabelTextDone]}>
                    {step.label}
                  </Text>
                </View>
                {idx < 4 && <View style={[styles.stepConnector, step.done && styles.stepConnectorDone]} />}
              </React.Fragment>
            ))}
          </View>

          {/* 1. PHOTO EVIDENCE WITH GEMINI VISION */}
          <View style={styles.card}>
            <ImageSelector
              imageUri={imageUri}
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              isLoading={isAnalyzingImage}
            />

            {isAnalyzingImage && (
              <View style={styles.analyzingBanner}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.analyzingText}>Analyzing photo with AI Vision...</Text>
              </View>
            )}
          </View>

          {/* AI VISION SUGGESTION BANNER */}
          {aiSuggestion && imageUri && (
            <AiSuggestionCard
              category={aiSuggestion.category}
              confidence={aiSuggestion.confidence}
              label={aiSuggestion.label}
              suggestedSeverity={aiSuggestion.suggestedSeverity}
              suggestedDescription={aiSuggestion.suggestedDescription}
              onAccept={handleAcceptAiSuggestion}
              onReject={() => setAiAccepted(false)}
              isAccepted={aiAccepted}
            />
          )}

          {/* 2. ISSUE CATEGORY */}
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>ISSUE CATEGORY *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_LIST.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardActive,
                    ]}
                    onPress={() => {
                      setCategory(cat.id);
                      setAiAccepted(false);
                    }}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.categoryIconWrap,
                        {
                          backgroundColor:
                            cat.id === 'pothole'
                              ? '#EFF6FF'
                              : cat.id === 'garbage'
                              ? '#ECFDF5'
                              : cat.id === 'streetlight'
                              ? '#FEF3C7'
                              : '#FEE2E2',
                        },
                      ]}
                    >
                      {cat.id === 'pothole' ? (
                        <CircleDotDashed size={20} color="#0066FF" strokeWidth={2.4} />
                      ) : cat.id === 'garbage' ? (
                        <Recycle size={20} color="#059669" strokeWidth={2.4} />
                      ) : cat.id === 'streetlight' ? (
                        <Lightbulb size={20} color="#D97706" strokeWidth={2.4} />
                      ) : cat.id === 'road_damage' ? (
                        <Construction size={20} color="#DC2626" strokeWidth={2.4} />
                      ) : (
                        <TriangleAlert size={20} color="#6366F1" strokeWidth={2.4} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.categoryCardLabel,
                        isSelected && styles.categoryCardLabelActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 3. SEVERITY LEVEL */}
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>SEVERITY LEVEL *</Text>
            <View style={styles.severityControl}>
              {SEVERITY_LIST.map((sev) => {
                const isSelected = severity === sev.id;
                return (
                  <TouchableOpacity
                    key={sev.id}
                    style={[
                      styles.severityBtn,
                      isSelected && {
                        backgroundColor:
                          sev.id === 'high'
                            ? '#EF4444'
                            : sev.id === 'medium'
                            ? COLORS.primary
                            : '#10B981',
                      },
                    ]}
                    onPress={() => setSeverity(sev.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.severityDot,
                        {
                          backgroundColor:
                            sev.id === 'high' ? '#EF4444' : sev.id === 'medium' ? '#F59E0B' : '#10B981',
                        },
                        isSelected && { backgroundColor: '#FFFFFF' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.severityText,
                        isSelected && styles.severityTextActive,
                      ]}
                    >
                      {sev.label.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. DESCRIPTION & AI AUTO-FILL */}
          <View style={styles.card}>
            <View style={styles.descHeaderRow}>
              <Text style={styles.cardSectionLabel}>ISSUE DESCRIPTION *</Text>
              {aiSuggestion?.suggestedDescription && (
                <TouchableOpacity
                  style={styles.aiAutoSummaryBtn}
                  onPress={handleAutoFillDescription}
                  activeOpacity={0.75}
                >
                  <Sparkles size={12} color={COLORS.primaryDark} />
                  <Text style={styles.aiAutoSummaryText}>AI Auto-Fill</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Describe the hazard and its impact on pedestrians or traffic..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* 5. LOCATION PREVIEW */}
          <View style={styles.card}>
            <LocationPreviewCard
              latitude={location?.latitude || null}
              longitude={location?.longitude || null}
              locationName={location?.locationName}
              isLoading={isLoadingGPS}
              onRefreshLocation={fetchGPSLocation}
              permissionGranted={gpsPermissionGranted}
            />
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handlePreSubmit}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Send size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Duplicate Alert Modal */}
      <DuplicateAlertModal
        visible={duplicateModalVisible}
        duplicate={foundDuplicate}
        onViewExisting={() => {
          setDuplicateModalVisible(false);
          if (foundDuplicate) {
            router.push({
              pathname: '/issue/[id]',
              params: { id: foundDuplicate.issue.id },
            });
          }
        }}
        onReportAnyway={() => {
          setDuplicateModalVisible(false);
          handleSubmitIssue();
        }}
        onClose={() => setDuplicateModalVisible(false)}
      />

      {/* Achievement Modal */}
      <AchievementModal
        visible={achievementModalVisible}
        unlockedBadge={unlockedBadge}
        leveledUp={leveledUp}
        newLevelTitle="Road Guardian"
        onClose={() => {
          setAchievementModalVisible(false);
          setImageUri(null);
          setDescription('');
          setAiSuggestion(null);
          router.replace('/(tabs)');
        }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  aiBannerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.lg,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  aiBannerText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6D28D9',
    flex: 1,
  },
  stepProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  stepItem: {
    alignItems: 'center',
    gap: 3,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepCircleDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepNumText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  stepLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  stepLabelTextDone: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
    marginBottom: 12,
  },
  stepConnectorDone: {
    backgroundColor: COLORS.primary,
  },
  cardSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  analyzingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 8,
    marginTop: 8,
  },
  analyzingText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHighlight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 8,
  },
  categoryCardActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  categoryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  categoryCardLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: '900',
  },
  severityControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.md,
    padding: 3,
  },
  severityBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    gap: 5,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  severityTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  descHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  aiAutoSummaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  aiAutoSummaryText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  descriptionInput: {
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
    minHeight: 75,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    gap: 8,
    ...SHADOWS.large,
    marginVertical: SPACING.md,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
