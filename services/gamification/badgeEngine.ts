import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isLiveFirebase } from '../firebase/config';
import { UserReputation, Badge, CitizenLevel, UserActivityLog, UserPrivacySettings } from '@/types/gamification';
import { ALL_CIVIC_BADGES } from '@/constants/badges';
import { CivicIssue } from '@/types/issue';

const DEFAULT_PRIVACY: UserPrivacySettings = {
  anonymousReporting: false,
  locationJitter: true,
  biometricLock: false,
  shareTelemetry: true,
};

/**
 * Clean baseline reputation for demo and user accounts
 */
export const DEMO_REPUTATION: UserReputation = {
  level: 1,
  levelTitle: 'Novice Scout 🌱',
  trustScore: 70,
  trustTier: 'Active Citizen',
  streakDays: 0,
  maxStreakDays: 0,
  streakWeeks: 0,
  activeDaysThisWeek: [],
  activityDates: {},
  reportsCount: 0,
  confirmationsCount: 0,
  resolvedCount: 0,
  impactRadiusKm: 0.0,
  badges: ALL_CIVIC_BADGES.map((b) => ({
    ...b,
    currentCount: 0,
    isUnlocked: false,
    unlockedAt: undefined,
  })),
  activityLogs: [],
  privacySettings: DEFAULT_PRIVACY,
};

/**
 * Clean baseline reputation for new registered citizens (100% fresh, 0 days streak, 0 contributions)
 */
export function createNewUserReputation(userId: string): UserReputation {
  return {
    level: 1,
    levelTitle: 'Novice Scout 🌱',
    trustScore: 50,
    trustTier: 'New Scout',
    streakDays: 0,
    maxStreakDays: 0,
    streakWeeks: 0,
    activeDaysThisWeek: [],
    activityDates: {},
    reportsCount: 0,
    confirmationsCount: 0,
    resolvedCount: 0,
    impactRadiusKm: 0.0,
    badges: ALL_CIVIC_BADGES.map((b) => ({
      ...b,
      currentCount: 0,
      isUnlocked: false,
    })),
    activityLogs: [],
    privacySettings: DEFAULT_PRIVACY,
  };
}

export const INITIAL_REPUTATION = DEMO_REPUTATION;

function getStorageKey(userId?: string): string {
  if (!userId || userId === 'user-demo-citizen') {
    return '@civiclens_user_reputation_demo_v8';
  }
  const cleanId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `@civiclens_user_reputation_${cleanId}_v8`;
}

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      clean[k] = sanitizeForFirestore(v);
    }
  }
  return clean;
}

/**
 * Cross-verifies all 54 badge criteria directly against real database reports & user actions.
 * If criteria is already filled, unlocks those badges in real time!
 */
export function crossVerifyBadgesWithUserActivity(
  rep: UserReputation,
  userReports: CivicIssue[] = []
): { reputation: UserReputation; newlyUnlockedBadges: Badge[] } {
  const totalReports = userReports.length;
  const photoReports = userReports.filter((r) => Boolean(r.imageUrl)).length;
  const gpsReports = userReports.filter((r) => typeof r.latitude === 'number' && typeof r.longitude === 'number').length;
  const aiReports = userReports.filter((r) => typeof r.aiConfidence === 'number' && r.aiConfidence > 0).length;

  const potholeReports = userReports.filter((r) => r.category === 'pothole').length;
  const roadDamageReports = userReports.filter((r) => r.category === 'road_damage').length;
  const lightingReports = userReports.filter((r) => r.category === 'streetlight').length;
  const wasteReports = userReports.filter((r) => r.category === 'garbage').length;

  let nightReports = 0;
  let dawnReports = 0;
  let weekendReports = 0;

  userReports.forEach((r) => {
    if (r.createdAt) {
      try {
        const d = new Date(r.createdAt);
        const hr = d.getHours();
        const day = d.getDay();
        if (hr >= 22 || hr < 5) nightReports++;
        if (hr >= 5 && hr < 7) dawnReports++;
        if (day === 0 || day === 6) weekendReports++;
      } catch {}
    }
  });

  const confirmations = rep.confirmationsCount || 0;
  const resolved = rep.resolvedCount || 0;
  const streak = Math.max(rep.streakDays || 0, rep.maxStreakDays || 0);

  const newlyUnlocked: Badge[] = [];
  const existingMap = new Map<string, Badge>();
  (rep.badges || []).forEach((b) => existingMap.set(b.id, b));

  rep.badges = ALL_CIVIC_BADGES.map((catalogBadge) => {
    const existing = existingMap.get(catalogBadge.id);
    let current = 0;

    switch (catalogBadge.id) {
      // 1. Onboarding
      case 'first_step':
        current = totalReports;
        break;
      case 'sharp_eye':
        current = photoReports;
        break;
      case 'first_verifier':
        current = confirmations;
        break;
      case 'ready_scout':
        current = totalReports > 0 || confirmations > 0 || resolved > 0 ? 1 : 0;
        break;
      case 'location_scout':
        current = gpsReports;
        break;
      case 'quick_responder':
        current = confirmations > 0 ? 1 : 0;
        break;

      // 2. Potholes & Road Damage
      case 'pothole_novice':
      case 'pothole_patrol':
      case 'pothole_hunter':
      case 'pothole_master':
      case 'pothole_legend':
        current = potholeReports;
        break;
      case 'road_doctor_1':
      case 'road_doctor_2':
      case 'road_doctor_3':
        current = roadDamageReports;
        break;

      // 3. Lighting
      case 'lamp_spotter':
      case 'night_watch_1':
      case 'night_watch_2':
      case 'night_watch_3':
        current = lightingReports;
        break;
      case 'midnight_owl':
        current = nightReports;
        break;
      case 'dawn_patrol':
        current = dawnReports;
        break;

      // 4. Waste
      case 'eco_starter':
      case 'eco_warrior':
      case 'eco_sentinel':
      case 'eco_champion':
      case 'eco_legend':
        current = wasteReports;
        break;
      case 'speedy_cleaner':
        current = wasteReports >= 2 || resolved >= 1 ? 1 : 0;
        break;

      // 5. Verification
      case 'verify_bronze':
      case 'verify_silver':
      case 'verify_gold':
      case 'verify_platinum':
      case 'verify_diamond':
      case 'hawk_eye':
      case 'peer_trusted':
        current = confirmations;
        break;
      case 'double_check':
        current = (rep.activityLogs || []).filter((l) => l.action === 'getting_worse').length || (confirmations >= 2 ? 1 : 0);
        break;

      // 6. Resolution
      case 'fix_witness':
      case 'fix_agent':
      case 'fix_champion':
      case 'fix_legend':
      case 'before_after':
      case 'zero_hazard':
        current = resolved;
        break;

      // 7. Streak
      case 'streak_3':
      case 'streak_7':
      case 'streak_14':
      case 'streak_30':
      case 'streak_60':
      case 'streak_100':
        current = streak;
        break;
      case 'weekend_hero':
        current = weekendReports;
        break;
      case 'holiday_keeper':
        current = weekendReports >= 1 ? 1 : 0;
        break;

      // 8. Milestones & AI
      case 'milestone_10':
      case 'milestone_25':
      case 'milestone_50':
      case 'milestone_100':
      case 'milestone_250':
        current = totalReports;
        break;
      case 'ai_visionary':
        current = aiReports;
        break;

      default:
        current = existing?.currentCount || 0;
    }

    const required = catalogBadge.requiredCount || 1;
    const isNowUnlocked = current >= required;

    if (isNowUnlocked && (!existing || !existing.isUnlocked)) {
      const unlockedItem: Badge = {
        ...catalogBadge,
        currentCount: current,
        isUnlocked: true,
        unlockedAt: new Date().toISOString().split('T')[0],
      };
      newlyUnlocked.push(unlockedItem);
      return unlockedItem;
    }

    if (isNowUnlocked) {
      return {
        ...catalogBadge,
        currentCount: current,
        isUnlocked: true,
        unlockedAt: existing?.unlockedAt || new Date().toISOString().split('T')[0],
      };
    }

    return {
      ...catalogBadge,
      currentCount: current,
      isUnlocked: false,
      unlockedAt: undefined,
    };
  });

  const points = (totalReports * 50) + (confirmations * 25) + (resolved * 100);
  rep.points = points;
  rep.reportsCount = totalReports;
  rep.confirmationsCount = confirmations;
  rep.resolvedCount = resolved;

  const unlockedCount = rep.badges.filter((b) => b.isUnlocked).length;
  if (unlockedCount >= 20 || points >= 1200) {
    rep.level = 5;
    rep.levelTitle = 'Civic Legend 👑';
    rep.trustTier = 'Verified Guardian';
  } else if (unlockedCount >= 10 || points >= 600) {
    rep.level = 4;
    rep.levelTitle = 'Road Guardian 🛡️';
    rep.trustTier = 'Verified Guardian';
  } else if (unlockedCount >= 5 || points >= 300) {
    rep.level = 3;
    rep.levelTitle = 'Active Ranger 🧭';
    rep.trustTier = 'Active Citizen';
  } else if (unlockedCount >= 2 || points >= 100) {
    rep.level = 2;
    rep.levelTitle = 'Apprentice Scout 🔍';
    rep.trustTier = 'Active Citizen';
  } else {
    rep.level = 1;
    rep.levelTitle = 'Novice Scout 🌱';
    rep.trustTier = 'New Scout';
  }

  rep.trustScore = Math.min(99, Math.max(50, 60 + Math.round(points / 25) + unlockedCount * 2));

  return { reputation: rep, newlyUnlockedBadges: newlyUnlocked };
}

/**
 * Loads user reputation from Cloud Firestore (with local fallback).
 * Automatically cross-verifies with active reports if provided!
 */
export async function getLiveUserReputation(
  userId?: string,
  userReports?: CivicIssue[]
): Promise<UserReputation> {
  const isDemo = !userId || userId === 'user-demo-citizen';
  let rep: UserReputation;

  // Try Firestore first if live
  if (isLiveFirebase && db && !isDemo) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.reputation) {
          rep = data.reputation as UserReputation;
          rep.badges = mergeBadgesWithCatalog(rep.badges);
          if (userReports) {
            const verified = crossVerifyBadgesWithUserActivity(rep, userReports);
            rep = verified.reputation;
          }
          await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(rep));
          return rep;
        }
      }
    } catch (err) {
      console.warn('[BadgeEngine] Firestore fetch failed, checking local storage:', err);
    }
  }

  // Local storage fallback
  try {
    const raw = await AsyncStorage.getItem(getStorageKey(userId));
    if (raw) {
      rep = JSON.parse(raw) as UserReputation;
      rep.badges = mergeBadgesWithCatalog(rep.badges);
      if (userReports) {
        const verified = crossVerifyBadgesWithUserActivity(rep, userReports);
        rep = verified.reputation;
      }
      return rep;
    }
  } catch (err) {
    console.warn('[BadgeEngine] Local storage load failed:', err);
  }

  // Baseline initialization
  rep = isDemo ? DEMO_REPUTATION : createNewUserReputation(userId || 'user-new');
  if (userReports) {
    const verified = crossVerifyBadgesWithUserActivity(rep, userReports);
    rep = verified.reputation;
  }
  await saveLiveUserReputation(rep, userId);
  return rep;
}

/**
 * Merges existing user badges with the latest 54 badge catalog and sanitizes old mock dates
 */
function mergeBadgesWithCatalog(userBadges?: Badge[]): Badge[] {
  const userMap = new Map<string, Badge>();
  (userBadges || []).forEach((b) => {
    // Sanitize any legacy mock demo date
    if (b.unlockedAt === '2026-08-24') {
      userMap.set(b.id, { ...b, isUnlocked: false, currentCount: 0, unlockedAt: undefined });
    } else {
      userMap.set(b.id, b);
    }
  });

  return ALL_CIVIC_BADGES.map((catalogBadge) => {
    const existing = userMap.get(catalogBadge.id);
    if (existing && existing.unlockedAt !== '2026-08-24') {
      const isLegitUnlocked = Boolean(existing.isUnlocked && existing.unlockedAt);
      return {
        ...catalogBadge,
        isUnlocked: isLegitUnlocked,
        unlockedAt: isLegitUnlocked ? existing.unlockedAt : undefined,
        currentCount: existing.currentCount ?? 0,
      };
    }
    return { ...catalogBadge, currentCount: 0, isUnlocked: false, unlockedAt: undefined };
  });
}

/**
 * Saves user reputation to Cloud Firestore and local storage.
 */
export async function saveLiveUserReputation(reputation: UserReputation, userId?: string): Promise<void> {
  const isDemo = !userId || userId === 'user-demo-citizen';

  try {
    await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(reputation));
  } catch (err) {
    console.warn('[BadgeEngine] Local save failed:', err);
  }

  if (isLiveFirebase && db && !isDemo && userId) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(
        userDocRef,
        {
          reputation: sanitizeForFirestore(reputation),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[BadgeEngine] Firestore save failed:', err);
    }
  }
}

export async function processCitizenAction(
  action: UserActivityLog['action'],
  category: string,
  title: string,
  locationName: string,
  extra?: { aiUsed?: boolean; hasPhotoProof?: boolean; hasPhoto?: boolean; hasGps?: boolean; userId?: string }
): Promise<{
  newlyUnlockedBadge: Badge | null;
  leveledUp: boolean;
  newLevelTitle: string;
  reputation: UserReputation;
}> {
  return logUserCivicAction(
    action as any,
    {
      category,
      title,
      locationName,
      aiUsed: extra?.aiUsed,
      hasPhoto: extra?.hasPhoto || extra?.hasPhotoProof,
      hasGps: extra?.hasGps,
    },
    extra?.userId
  );
}

/**
 * Core dynamic action logger and real-time badge evaluator
 */
export async function logUserCivicAction(
  action: 'submit_report' | 'community_confirm' | 'getting_worse' | 'issue_resolved',
  extra?: {
    category?: string;
    title?: string;
    locationName?: string;
    aiUsed?: boolean;
    hasPhoto?: boolean;
    hasGps?: boolean;
  },
  userId?: string
): Promise<{
  newlyUnlockedBadge: Badge | null;
  leveledUp: boolean;
  newLevelTitle: string;
  reputation: UserReputation;
}> {
  const rep = await getLiveUserReputation(userId);

  // 1. Add Activity Log entry
  const newLog: UserActivityLog = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    action,
    category: extra?.category || 'general',
    title: extra?.title || (action === 'submit_report' ? 'Road Hazard Reported' : 'On-Site Verification'),
    locationName: extra?.locationName || 'Local Area',
    timestamp: new Date().toISOString(),
  };

  rep.activityLogs = [newLog, ...(rep.activityLogs || [])].slice(0, 50);

  // 2. Register date in activity heatmap
  const todayIso = new Date().toISOString().split('T')[0];
  rep.activityDates = rep.activityDates || {};
  rep.activityDates[todayIso] = (rep.activityDates[todayIso] || 0) + 1;

  // 3. Increment counters
  if (action === 'submit_report') {
    rep.reportsCount = (rep.reportsCount || 0) + 1;
    rep.impactRadiusKm = +(Number(rep.impactRadiusKm || 0) + 0.3).toFixed(1);
  } else if (action === 'community_confirm' || action === 'getting_worse') {
    rep.confirmationsCount = (rep.confirmationsCount || 0) + 1;
  } else if (action === 'issue_resolved') {
    rep.resolvedCount = (rep.resolvedCount || 0) + 1;
  }

  // 4. Calculate live consecutive day streak & max streak
  let currentStreak = 0;
  const checkDate = new Date();
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (rep.activityDates[dateStr] && rep.activityDates[dateStr] > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  rep.streakDays = currentStreak;
  rep.maxStreakDays = Math.max(rep.maxStreakDays || 0, currentStreak);

  // 5. Update dynamic active days
  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  if (!rep.activeDaysThisWeek.includes(todayDay)) {
    rep.activeDaysThisWeek = [...rep.activeDaysThisWeek, todayDay];
  }

  // 6. Time of day checks
  const currentHour = new Date().getHours();
  const isNight = currentHour >= 22 || currentHour < 5;
  const isDawn = currentHour >= 5 && currentHour < 7;
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

  // 7. Track Badge Progress & Evaluate Unlocks
  let newlyUnlockedBadge: Badge | null = null;

  rep.badges = rep.badges.map((badge) => {
    let current = badge.currentCount || 0;

    switch (badge.id) {
      // Onboarding & Novice
      case 'first_step':
        current = rep.reportsCount;
        break;
      case 'sharp_eye':
        if (extra?.hasPhoto) current = (badge.currentCount || 0) + 1;
        break;
      case 'first_verifier':
        current = rep.confirmationsCount;
        break;
      case 'ready_scout':
        current = 1;
        break;
      case 'location_scout':
        if (extra?.hasGps) current = 1;
        break;
      case 'quick_responder':
        if (action === 'community_confirm') current = 1;
        break;

      // Potholes
      case 'pothole_novice':
      case 'pothole_patrol':
      case 'pothole_hunter':
      case 'pothole_master':
      case 'pothole_legend':
        if (extra?.category === 'pothole') current = (badge.currentCount || 0) + 1;
        break;

      case 'road_doctor_1':
      case 'road_doctor_2':
      case 'road_doctor_3':
        if (extra?.category === 'road_damage') current = (badge.currentCount || 0) + 1;
        break;

      // Lighting
      case 'lamp_spotter':
      case 'night_watch_1':
      case 'night_watch_2':
      case 'night_watch_3':
        if (extra?.category === 'streetlight') current = (badge.currentCount || 0) + 1;
        break;
      case 'midnight_owl':
        if (isNight) current = 1;
        break;
      case 'dawn_patrol':
        if (isDawn) current = 1;
        break;

      // Waste
      case 'eco_starter':
      case 'eco_warrior':
      case 'eco_sentinel':
      case 'eco_champion':
      case 'eco_legend':
      case 'speedy_cleaner':
        if (extra?.category === 'garbage') current = (badge.currentCount || 0) + 1;
        break;

      // Verifications
      case 'verify_bronze':
      case 'verify_silver':
      case 'verify_gold':
      case 'verify_platinum':
      case 'verify_diamond':
      case 'hawk_eye':
      case 'peer_trusted':
        current = rep.confirmationsCount;
        break;
      case 'double_check':
        if (action === 'getting_worse') current = (badge.currentCount || 0) + 1;
        break;

      // Resolutions
      case 'fix_witness':
      case 'fix_agent':
      case 'fix_champion':
      case 'fix_legend':
      case 'before_after':
      case 'zero_hazard':
        current = rep.resolvedCount;
        break;

      // Streaks
      case 'streak_3':
      case 'streak_7':
      case 'streak_14':
      case 'streak_30':
      case 'streak_60':
      case 'streak_100':
        current = rep.streakDays || 0;
        break;
      case 'weekend_hero':
        if (isWeekend) current = (badge.currentCount || 0) + 1;
        break;
      case 'holiday_keeper':
        current = 1;
        break;

      // Milestones
      case 'milestone_10':
      case 'milestone_25':
      case 'milestone_50':
      case 'milestone_100':
      case 'milestone_250':
        current = rep.reportsCount;
        break;

      case 'ai_visionary':
        if (extra?.aiUsed) {
          current = (badge.currentCount || 0) + 1;
        }
        break;

      default:
        break;
    }

    const wasUnlocked = badge.isUnlocked;
    const reqCount = badge.requiredCount || 1;
    const shouldUnlock = current >= reqCount;

    if (!wasUnlocked && shouldUnlock) {
      newlyUnlockedBadge = {
        ...badge,
        currentCount: current,
        isUnlocked: true,
        unlockedAt: new Date().toISOString().split('T')[0],
      };
      return newlyUnlockedBadge;
    }

    return {
      ...badge,
      currentCount: current,
      isUnlocked: wasUnlocked || shouldUnlock,
      unlockedAt: wasUnlocked ? badge.unlockedAt : shouldUnlock ? new Date().toISOString().split('T')[0] : undefined,
    };
  });

  // 8. Calculate Dynamic Level & Trust Tier
  const totalActions = rep.reportsCount + rep.confirmationsCount + rep.resolvedCount * 2;
  const oldLevel = rep.level;
  let newLevel: CitizenLevel = 1;
  let newLevelTitle = 'Novice Scout 🌱';
  let trustScore = Math.min(50 + totalActions * 4, 100);

  if (totalActions >= 30) {
    newLevel = 5;
    newLevelTitle = 'Civic Legend 👑';
  } else if (totalActions >= 18) {
    newLevel = 4;
    newLevelTitle = 'Road Guardian 🛡️';
  } else if (totalActions >= 8) {
    newLevel = 3;
    newLevelTitle = 'Active Ranger 🧭';
  } else if (totalActions >= 2) {
    newLevel = 2;
    newLevelTitle = 'Apprentice Scout 🔍';
  }

  rep.level = newLevel;
  rep.levelTitle = newLevelTitle;
  rep.trustScore = trustScore;
  rep.trustTier =
    trustScore >= 90
      ? 'Verified Guardian'
      : trustScore >= 75
      ? 'Trusted Citizen'
      : trustScore >= 60
      ? 'Active Contributor'
      : 'New Scout';

  const leveledUp = newLevel > oldLevel;

  await saveLiveUserReputation(rep, userId);

  return {
    newlyUnlockedBadge,
    leveledUp,
    newLevelTitle,
    reputation: rep,
  };
}
