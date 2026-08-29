import {
  getLiveUserReputation,
  saveLiveUserReputation,
  processCitizenAction,
  crossVerifyBadgesWithUserActivity,
  INITIAL_REPUTATION,
  DEMO_REPUTATION,
  createNewUserReputation,
} from './badgeEngine';
import { UserReputation, Badge, CitizenLevel, UserActivityLog, UserPrivacySettings, LeaderboardUser } from '@/types/gamification';
import { CivicIssue } from '@/types/issue';

export { INITIAL_REPUTATION, DEMO_REPUTATION, createNewUserReputation, crossVerifyBadgesWithUserActivity };

/**
 * Load user reputation state scoped per user with automatic database cross-verification
 */
export async function getUserReputation(userId?: string, userReports?: CivicIssue[]): Promise<UserReputation> {
  return getLiveUserReputation(userId, userReports);
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

import { collection, getDocs } from 'firebase/firestore';
import { db, isLiveFirebase } from '../firebase/config';
import { getIssues } from '../issues/issueService';

/**
 * Dynamically queries real registered users from Firestore and real reporters from issues database
 */
export async function getLiveLeaderboard(): Promise<LeaderboardUser[]> {
  const usersMap = new Map<string, LeaderboardUser>();

  // 1. Fetch live users from Firestore if connected
  if (isLiveFirebase && db) {
    try {
      const usersRef = collection(db, 'users');
      const snap = await getDocs(usersRef);
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const rep = data.reputation as UserReputation | undefined;
        const reportsCount = rep?.reportsCount ?? data.reportsCount ?? 0;
        const confirmationsCount = rep?.confirmationsCount ?? data.confirmationsCount ?? 0;
        const resolvedCount = rep?.resolvedCount ?? data.resolvedCount ?? 0;
        const points = (reportsCount * 50) + (confirmationsCount * 25) + (resolvedCount * 100);

        const level = (rep?.level || (points > 1000 ? 5 : points > 600 ? 4 : points > 300 ? 3 : points > 100 ? 2 : 1)) as CitizenLevel;
        const levelTitle = rep?.levelTitle || (level === 5 ? 'Civic Legend' : level === 4 ? 'Road Guardian' : level === 3 ? 'Active Ranger' : level === 2 ? 'Apprentice Scout' : 'Novice Scout');
        const trustScore = rep?.trustScore || Math.min(99, 60 + Math.round(points / 20));

        usersMap.set(docSnap.id, {
          id: docSnap.id,
          displayName: data.displayName || data.email?.split('@')[0] || 'Civic Scout',
          points,
          level,
          levelTitle,
          trustScore,
          streakWeeks: rep?.streakWeeks || 0,
          rank: 1,
          reportsCount,
          resolvedCount,
        });
      });
    } catch (e) {
      console.warn('[Leaderboard] Firestore query notice:', e);
    }
  }

  // 2. Aggregate active reporters from real issues in the database
  try {
    const issues = await getIssues();
    issues.forEach((issue) => {
      if (issue.reportedBy) {
        const existing = usersMap.get(issue.reportedBy);
        if (existing) {
          existing.reportsCount = Math.max(existing.reportsCount, 1);
          if (issue.status === 'resolved') existing.resolvedCount++;
          existing.points = (existing.reportsCount * 50) + (existing.resolvedCount * 100);
        } else {
          usersMap.set(issue.reportedBy, {
            id: issue.reportedBy,
            displayName: issue.reportedBy.startsWith('user_') ? issue.reportedBy.replace(/^user_/, '').replace(/_/g, ' ') : 'Citizen Scout',
            points: 50 + (issue.status === 'resolved' ? 100 : 0),
            level: 1 as CitizenLevel,
            levelTitle: 'Novice Scout',
            trustScore: 75,
            streakWeeks: 0,
            rank: 1,
            reportsCount: 1,
            resolvedCount: issue.status === 'resolved' ? 1 : 0,
          });
        }
      }
    });
  } catch (e) {}

  // 3. Sort by points descending and assign genuine ranks
  const sorted = Array.from(usersMap.values()).sort((a, b) => b.points - a.points);
  sorted.forEach((u, index) => {
    u.rank = index + 1;
  });

  return sorted;
}
