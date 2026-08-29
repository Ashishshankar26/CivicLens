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
import { LinearGradient } from 'expo-linear-gradient';
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
  CircleDotDashed,
  Recycle,
  Lightbulb,
  Construction,
  TriangleAlert,
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
    } finally {
      setIsLoadingGPS(false);
    }
  };

  const handleImageSelected = async (uri: string) => {
    setImageUri(uri);
    setIsAnalyzingImage(true);
    setAiSuggestion(null);
    setAiAccepted(false);

    try {
      const analysis = await analyzeCivicImage(uri);
      if (analysis) {
        setAiSuggestion(analysis);
        setCategory(analysis.category);
        setSeverity(analysis.suggestedSeverity);
        if (analysis.suggestedDescription && (!description || description.length < 5)) {
          setDescription(analysis.suggestedDescription);
        }
        setAiAccepted(true);
      }
    } catch (err) {
      console.warn('Vision analysis failed:', err);
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
      Alert.alert('Photo Required', 'Please capture or select a photo of the road hazard.');
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      Alert.alert('Description Required', 'Please enter a short description (at least 5 characters).');
      return;
    }

    if (!location || location.latitude === null || location.longitude === null) {
      Alert.alert('Location Required', 'GPS location is required to place your issue pin on the map.');
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
        { aiUsed: Boolean(aiSuggestion), userId: user?.uid }
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
      Alert.alert('Error', 'Could not submit report. Please try again.');
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
            <LinearGradient
              colors={['#0052CC', '#0066FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIconBox}
            >
              <Camera size={20} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>Report an Issue</Text>
              <Text style={styles.headerSub}>
                Capture or upload photo evidence for automatic AI categorization
              </Text>
            </View>
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
                    style={[styles.severityBtn, isSelected && styles.severityBtnActiveWrapper]}
                    onPress={() => setSeverity(sev.id)}
                    activeOpacity={0.8}
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={
                          sev.id === 'high'
                            ? ['#DC2626', '#EF4444']
                            : sev.id === 'medium'
                            ? ['#0052CC', '#0066FF']
                            : ['#059669', '#10B981']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.severityGradient}
                      >
                        <Text style={styles.severityTextActive}>
                          {sev.label.toUpperCase()}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.severityText}>
                        {sev.label.toUpperCase()}
                      </Text>
                    )}
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
            <LinearGradient
              colors={['#0052CC', '#0066FF', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtnGradient}
            >
              <Send size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
              </Text>
            </LinearGradient>
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
        newLevelTitle="Road Guardian 🛡️"
        onClose={() => {
          setAchievementModalVisible(false);
          setImageUri(null);
          setDescription('');
          setAiSuggestion(null);
          router.replace('/(tabs)');
        }}
      />
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
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
  severityBtnActiveWrapper: {
    paddingVertical: 0,
    overflow: 'hidden',
  },
  severityGradient: {
    width: '100%',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  severityTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
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
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.large,
    marginVertical: SPACING.md,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
    borderRadius: RADIUS.full,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
