import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isLiveFirebase } from '../firebase/config';
import { UserReputation, Badge, CitizenLevel, UserActivityLog, UserPrivacySettings } from '@/types/gamification';
import { ALL_CIVIC_BADGES } from '@/constants/badges';

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
  badges: ALL_CIVIC_BADGES.map((b) => {
    // Unlock key introductory and progression badges for demo account
    const unlockedIds = [
      'first_step',
      'sharp_eye',
      'first_verifier',
      'ready_scout',
      'location_scout',
      'pothole_novice',
      'pothole_patrol',
      'lamp_spotter',
      'eco_starter',
      'eco_warrior',
      'verify_bronze',
      'fix_witness',
      'streak_3',
      'milestone_10',
      'ai_visionary',
    ];

    if (unlockedIds.includes(b.id)) {
      return {
        ...b,
        isUnlocked: true,
        unlockedAt: '2026-08-24',
        currentCount: b.requiredCount,
      };
    }

    // Set realistic progress on locked badges
    let progress = 0;
    if (b.category === 'potholes') progress = 8;
    else if (b.category === 'lighting') progress = 3;
    else if (b.category === 'waste') progress = 6;
    else if (b.category === 'verification') progress = 22;
    else if (b.category === 'resolution') progress = 6;
    else if (b.category === 'streak') progress = 4;
    else if (b.category === 'milestones') progress = 14;

    return {
      ...b,
      currentCount: Math.min(progress, b.requiredCount || 1),
      isUnlocked: false,
    };
  }),
  activityLogs: [
    {
      id: 'act_1',
      action: 'submit_report',
      category: 'pothole',
      title: 'Connaught Circus Pothole',
      locationName: 'Connaught Circus & Janpath',
      timestamp: new Date(Date.now() - 1000 * 3600 * 18).toISOString(),
    },
    {
      id: 'act_2',
      action: 'community_confirm',
      category: 'streetlight',
      title: 'Heritage Park Dark Lamp',
      locationName: 'Heritage Park Avenue',
      timestamp: new Date(Date.now() - 1000 * 3600 * 48).toISOString(),
    },
  ],
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
    return '@civiclens_user_reputation_demo_v7';
  }
  const cleanId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `@civiclens_user_reputation_${cleanId}_v7`;
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
 * Loads user reputation from Cloud Firestore (with local fallback).
 * Merges missing badges from ALL_CIVIC_BADGES so new badge updates immediately appear!
 */
export async function getLiveUserReputation(userId?: string): Promise<UserReputation> {
  const isDemo = !userId || userId === 'user-demo-citizen';

  // Try Firestore first if live
  if (isLiveFirebase && db && !isDemo) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.reputation) {
          const rep = data.reputation as UserReputation;
          rep.badges = mergeBadgesWithCatalog(rep.badges);
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
      const parsed = JSON.parse(raw) as UserReputation;
      parsed.badges = mergeBadgesWithCatalog(parsed.badges);
      return parsed;
    }
  } catch (err) {
    console.warn('[BadgeEngine] Local storage load failed:', err);
  }

  // Baseline initialization
  const initial = isDemo ? DEMO_REPUTATION : createNewUserReputation(userId || 'user-new');
  await saveLiveUserReputation(initial, userId);
  return initial;
}

/**
 * Merges existing user badges with the latest 54 badge catalog
 */
function mergeBadgesWithCatalog(userBadges?: Badge[]): Badge[] {
  const userMap = new Map<string, Badge>();
  (userBadges || []).forEach((b) => userMap.set(b.id, b));

  return ALL_CIVIC_BADGES.map((catalogBadge) => {
    const existing = userMap.get(catalogBadge.id);
    if (existing) {
      return {
        ...catalogBadge,
        isUnlocked: existing.isUnlocked,
        unlockedAt: existing.unlockedAt,
        currentCount: existing.currentCount ?? 0,
      };
    }
    return { ...catalogBadge, currentCount: 0, isUnlocked: false };
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
