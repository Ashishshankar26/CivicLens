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

// Generate seeded activity dates for the Demo presentation user
function generateDemoActivityDates(): Record<string, number> {
  const dates: Record<string, number> = {};
  const today = new Date();
  const sampleOffsets = [0, 1, 2, 4, 7, 8, 12, 15, 18, 22, 28, 35, 42, 50, 65, 80];
  sampleOffsets.forEach((offset, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const iso = d.toISOString().split('T')[0];
    dates[iso] = (idx % 3) + 1;
  });
  return dates;
}

/**
 * Pre-seeded reputation for the Demo Citizen presentation account
 */
export const DEMO_REPUTATION: UserReputation = {
  level: 4,
  levelTitle: 'Road Guardian 🛡️',
  trustScore: 92,
  trustTier: 'Verified Guardian',
  streakDays: 4,
  maxStreakDays: 12,
  streakWeeks: 3,
  activeDaysThisWeek: ['Mon', 'Wed', 'Thu', 'Today'],
  activityDates: generateDemoActivityDates(),
  reportsCount: 8,
  confirmationsCount: 16,
  resolvedCount: 3,
  impactRadiusKm: 5.4,
  badges: ALL_CIVIC_BADGES.map((b) => {
    if (b.id === 'first_spot' || b.id === 'road_scout' || b.id === 'first_verifier' || b.id === 'ai_visionary' || b.id === 'road_restorer') {
      return {
        ...b,
        isUnlocked: true,
        unlockedAt: '2026-08-22',
        currentCount: b.requiredCount,
      };
    }
    return {
      ...b,
      currentCount: b.id === 'community_sentinel' ? 8 : b.id === 'civic_guardian' ? 16 : 0,
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
    return '@civiclens_user_reputation_demo_v6';
  }
  const cleanId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `@civiclens_user_reputation_${cleanId}_v6`;
}

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  if (typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        res[k] = sanitizeForFirestore(v);
      }
    }
    return res;
  }
  return obj;
}

/**
 * Load user reputation state with live badge synchronization scoped per user
 */
export async function getLiveUserReputation(userId?: string): Promise<UserReputation> {
  const key = getStorageKey(userId);

  // 1. Try fetching from Firestore if live
  if (isLiveFirebase && db && userId && userId !== 'user-demo-citizen') {
    try {
      const snap = await getDoc(doc(db, 'reputations', userId));
      if (snap.exists()) {
        const firestoreData = snap.data() as UserReputation;
        await AsyncStorage.setItem(key, JSON.stringify(firestoreData));
        return syncBadgesWithSchema(firestoreData);
      }
    } catch (err) {
      console.warn('[Reputation] Firestore read notice:', err);
    }
  }

  // 2. Load from local cache
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      const initial = (!userId || userId === 'user-demo-citizen')
        ? DEMO_REPUTATION
        : createNewUserReputation(userId);
      await AsyncStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    const parsed: UserReputation = JSON.parse(raw);
    return syncBadgesWithSchema(parsed);
  } catch (err) {
    console.warn('Error reading reputation state:', err);
    return createNewUserReputation(userId || 'guest');
  }
}

function syncBadgesWithSchema(rep: UserReputation): UserReputation {
  const existingBadgesMap = new Map((rep.badges || []).map((b) => [b.id, b]));
  const mergedBadges = ALL_CIVIC_BADGES.map((template) => {
    const existing = existingBadgesMap.get(template.id);
    if (existing) {
      return {
        ...template,
        ...existing,
        icon: template.icon,
        title: template.title,
        description: template.description,
        requiredCount: template.requiredCount,
        tier: template.tier,
        rewardTitle: template.rewardTitle,
      };
    }
    return template;
  });

  return {
    ...rep,
    badges: mergedBadges,
    activityDates: rep.activityDates || {},
    streakDays: rep.streakDays || 0,
    maxStreakDays: rep.maxStreakDays || rep.streakDays || 0,
    privacySettings: rep.privacySettings || DEFAULT_PRIVACY,
  };
}

/**
 * Save user reputation state scoped per user
 */
export async function saveLiveUserReputation(rep: UserReputation, userId?: string): Promise<void> {
  const key = getStorageKey(userId);
  try {
    await AsyncStorage.setItem(key, JSON.stringify(rep));

    // Persist to live Firestore database
    if (isLiveFirebase && db && userId && userId !== 'user-demo-citizen') {
      const sanitized = sanitizeForFirestore(rep);
      await setDoc(doc(db, 'reputations', userId), sanitized, { merge: true });
    }
  } catch (err) {
    console.warn('Error persisting reputation state:', err);
  }
}

/**
 * Process a citizen action and evaluate badge milestones & level progression
 */
export async function processCitizenAction(
  action: UserActivityLog['action'],
  category: string,
  title: string,
  locationName: string,
  extra?: { aiUsed?: boolean; hasPhotoProof?: boolean; userId?: string }
): Promise<{
  newlyUnlockedBadge: Badge | null;
  leveledUp: boolean;
  newLevelTitle: string;
  reputation: UserReputation;
}> {
  const userId = extra?.userId;
  const rep = await getLiveUserReputation(userId);

  // 1. Record Action Log
  const newLog: UserActivityLog = {
    id: `act_${Date.now()}`,
    action,
    category,
    title,
    locationName,
    timestamp: new Date().toISOString(),
  };
  rep.activityLogs = [newLog, ...(rep.activityLogs || [])];

  // 2. Record date in activity heatmap ledger
  const todayIso = new Date().toISOString().split('T')[0];
  rep.activityDates = rep.activityDates || {};
  rep.activityDates[todayIso] = (rep.activityDates[todayIso] || 0) + 1;

  // 3. Increment action counters
  if (action === 'submit_report') {
    rep.reportsCount = (rep.reportsCount || 0) + 1;
    rep.impactRadiusKm = +(Number(rep.impactRadiusKm || 0) + 0.3).toFixed(1);
  } else if (action === 'community_confirm') {
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

  // 6. Track Badge Progress & Unlocks
  let newlyUnlockedBadge: Badge | null = null;

  rep.badges = rep.badges.map((badge) => {
    let current = badge.currentCount || 0;

    switch (badge.id) {
      case 'first_spot':
      case 'road_scout':
      case 'community_sentinel':
      case 'hazard_hunter':
        current = rep.reportsCount;
        break;
      case 'first_verifier':
      case 'civic_guardian':
        current = rep.confirmationsCount;
        break;
      case 'road_restorer':
      case 'fixer_champion':
        current = rep.resolvedCount;
        break;
      case 'ai_visionary':
        if (extra?.aiUsed) {
          const req = badge.requiredCount || 1;
          current = Math.min((badge.currentCount || 0) + 1, req);
        }
        break;
      case 'streak_master':
        current = rep.streakDays || 0;
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

  // 7. Calculate Dynamic Level & Trust Tier
  const totalActions = rep.reportsCount + rep.confirmationsCount + rep.resolvedCount * 2;
  const oldLevel = rep.level;
  let newLevel: CitizenLevel = 1;
  let newLevelTitle = 'Novice Scout 🌱';
  let trustScore = Math.min(50 + totalActions * 4, 100);

  if (totalActions >= 20) {
    newLevel = 5;
    newLevelTitle = 'Civic Legend 👑';
  } else if (totalActions >= 12) {
    newLevel = 4;
    newLevelTitle = 'Road Guardian 🛡️';
  } else if (totalActions >= 6) {
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
