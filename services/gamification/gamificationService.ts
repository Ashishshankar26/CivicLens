import {
  getLiveUserReputation,
  saveLiveUserReputation,
  processCitizenAction,
  INITIAL_REPUTATION,
  DEMO_REPUTATION,
  createNewUserReputation,
} from './badgeEngine';
import { UserReputation, Badge, CitizenLevel, UserActivityLog, UserPrivacySettings, LeaderboardUser } from '@/types/gamification';

export { INITIAL_REPUTATION, DEMO_REPUTATION, createNewUserReputation };

/**
 * Load user reputation state scoped per user
 */
export async function getUserReputation(userId?: string): Promise<UserReputation> {
  return getLiveUserReputation(userId);
}

/**
 * Save user reputation state scoped per user
 */
export async function saveUserReputation(rep: UserReputation, userId?: string): Promise<void> {
  return saveLiveUserReputation(rep, userId);
}

/**
 * Update privacy preferences scoped per user
 */
export async function updatePrivacySettings(
  settings: Partial<UserPrivacySettings>,
  userId?: string
): Promise<UserPrivacySettings> {
  const current = await getLiveUserReputation(userId);
  const updatedPrivacy = {
    ...current.privacySettings,
    ...settings,
  };
  current.privacySettings = updatedPrivacy;
  await saveLiveUserReputation(current, userId);
  return updatedPrivacy;
}

/**
 * Process a user civic action and check for badge milestones and level progression
 */
export async function logUserCivicAction(
  action: UserActivityLog['action'],
  category: string,
  title: string,
  locationName: string,
  extra?: { aiUsed?: boolean; hasPhotoProof?: boolean; userId?: string }
): Promise<{
  unlockedBadge: Badge | null;
  leveledUp: boolean;
  newLevelTitle: string;
  reputation: UserReputation;
}> {
  const result = await processCitizenAction(action, category, title, locationName, extra);
  return {
    unlockedBadge: result.newlyUnlockedBadge,
    leveledUp: result.leveledUp,
    newLevelTitle: result.newLevelTitle,
    reputation: result.reputation,
  };
}

export const SEEDED_LEADERBOARD: LeaderboardUser[] = [
  {
    id: 'user_lead_1',
    displayName: 'Ananya Sharma',
    points: 2450,
    level: 5 as CitizenLevel,
    levelTitle: 'Civic Legend 👑',
    trustScore: 98,
    streakWeeks: 7,
    rank: 1,
    reportsCount: 28,
    resolvedCount: 14,
  },
  {
    id: 'user_lead_2',
    displayName: 'Rajesh Kumar',
    points: 1980,
    level: 5 as CitizenLevel,
    levelTitle: 'Civic Legend 👑',
    trustScore: 94,
    streakWeeks: 5,
    rank: 2,
    reportsCount: 22,
    resolvedCount: 9,
  },
  {
    id: 'user_lead_3',
    displayName: 'Ashish Shankar',
    points: 1240,
    level: 4 as CitizenLevel,
    levelTitle: 'Road Guardian 🛡️',
    trustScore: 92,
    streakWeeks: 3,
    rank: 3,
    reportsCount: 8,
    resolvedCount: 3,
  },
  {
    id: 'user_lead_4',
    displayName: 'Priya Verma',
    points: 890,
    level: 3 as CitizenLevel,
    levelTitle: 'Active Ranger 🧭',
    trustScore: 84,
    streakWeeks: 2,
    rank: 4,
    reportsCount: 6,
    resolvedCount: 2,
  },
  {
    id: 'user_lead_5',
    displayName: 'Kabir Mehta',
    points: 620,
    level: 2 as CitizenLevel,
    levelTitle: 'Apprentice Scout 🔍',
    trustScore: 78,
    streakWeeks: 1,
    rank: 5,
    reportsCount: 4,
    resolvedCount: 1,
  },
];
